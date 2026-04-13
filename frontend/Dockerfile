FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
COPY angular.json ./
COPY tsconfig.json tsconfig.app.json ./
COPY .postcssrc.json ./

WORKDIR /app/src
COPY src ./

RUN npm install
RUN npm install -g @angular/cli
RUN ng build --configuration production

FROM nginx:alpine
COPY --from=builder /app/build/browser /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]