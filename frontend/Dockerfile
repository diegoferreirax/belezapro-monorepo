FROM node:22-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY angular.json tsconfig.app.json ./
COPY tsconfig.json tsconfig.app.json ./

WORKDIR /app/src
COPY src ./

RUN pnpm install
RUN pnpm run build --configuration production

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]