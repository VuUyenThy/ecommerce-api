FROM node:22-slim

# Prisma cần openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package trước để tận dụng cache của Docker khi chỉ sửa code
COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000

# Áp migration rồi mới khởi động app
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
