package com.belezapro.belezapro_api.features.authentication.interceptor;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.belezapro.belezapro_api.features.authentication.annotation.RequireAuth;
import com.belezapro.belezapro_api.features.authentication.annotation.RequireRoles;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JWTVerifier verifier;

    public AuthInterceptor(@Value("${jwt.secret:changeit-secret}") String secret) {
        Algorithm algorithm = Algorithm.HMAC256(secret);
        this.verifier = JWT.require(algorithm).build();
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod hm = (HandlerMethod) handler;
        Method method = hm.getMethod();

        RequireRoles methodRoles = method.getAnnotation(RequireRoles.class);
        RequireRoles classRoles = hm.getBeanType().getAnnotation(RequireRoles.class);
        RequireAuth methodAuth = method.getAnnotation(RequireAuth.class);
        RequireAuth classAuth = hm.getBeanType().getAnnotation(RequireAuth.class);

        boolean needsRoles = (methodRoles != null) || (classRoles != null);
        boolean needsAuth = needsRoles || (methodAuth != null) || (classAuth != null);

        if (!needsAuth) {
            return true;
        }

        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            respondUnauthorized(response, "Missing or invalid Authorization header");
            return false;
        }

        String token = auth.substring(7);
        try {
            DecodedJWT jwt = verifier.verify(token);
            request.setAttribute("authenticatedUser", jwt.getSubject());

            if (needsRoles) {
                String[] tokenRoles = jwt.getClaim("roles").asArray(String.class);
                Set<String> tokenRoleSet = new HashSet<>();
                if (tokenRoles != null) tokenRoleSet.addAll(Arrays.asList(tokenRoles));

                String[] required = methodRoles != null ? methodRoles.value() : classRoles.value();
                boolean ok = false;
                for (String r : required) {
                    if (tokenRoleSet.contains(r)) { ok = true; break; }
                }
                if (!ok) {
                    respondForbidden(response, "Insufficient role");
                    return false;
                }
            }

            return true;
        } catch (JWTVerificationException ex) {
            respondUnauthorized(response, "Invalid token");
            return false;
        }
    }

    private void respondUnauthorized(HttpServletResponse response, String message) throws java.io.IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }

    private void respondForbidden(HttpServletResponse response, String message) throws java.io.IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
