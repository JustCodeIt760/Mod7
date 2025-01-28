# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Debug: Show what files we have
RUN echo "Contents before build:" && ls -la

# Build the application
RUN npm run build

# Debug: Show what's in dist
RUN echo "Contents of dist after build:" && ls -la dist/

# Production stage
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Debug: Show what's in dist in production stage
RUN echo "Contents of dist in production:" && ls -la dist/

EXPOSE 3000

# -s flag handles SPA routing
CMD ["serve", "-s", "dist", "-l", "3000", "--single"]