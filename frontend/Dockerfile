FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
COPY angular.json ./
COPY tsconfig.json tsconfig.app.json ./
COPY .postcssrc.json ./

RUN npm install

COPY src ./src/
COPY public ./public
COPY scripts/docker-build-env.cjs ./scripts/docker-build-env.cjs

ARG API_URL=http://localhost:8080/api/v1
ENV API_URL=$API_URL
ARG APP_NAME=BelezaPro
ENV APP_NAME=$APP_NAME

RUN node scripts/docker-build-env.cjs

RUN npx ng build --configuration production

FROM nginx:alpine
COPY --from=builder /app/dist/app /tmp/dist-app
RUN set -eu; \
    INDEX_DIR="$(dirname "$(find /tmp/dist-app -type f -name index.html -print -quit)")"; \
    if [ -z "$INDEX_DIR" ]; then echo "index.html not found under /tmp/dist-app" >&2; exit 1; fi; \
    rm -rf /usr/share/nginx/html/*; \
    cp -R "$INDEX_DIR"/. /usr/share/nginx/html/
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
