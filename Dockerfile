FROM node:15-alpine as builder

WORKDIR /builds
COPY . .
RUN npm ci && npx tsc

FROM nginx:alpine
COPY --from=builder /builds/webroot /usr/share/nginx/html