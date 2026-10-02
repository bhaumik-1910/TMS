FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm run build

FROM nginx:alpine

COPY --from=builder /app/dist/spa /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
