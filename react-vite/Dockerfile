# Use Node.js 18 with Alpine Linux
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
# This layer will only rebuild if package files change
COPY package*.json ./

# Use npm install instead of npm ci for development
RUN npm ci

# Copy the rest of the application
# This layer will rebuild on any code changes
COPY . .

# Add these environment variables
ENV NODE_ENV=development
ENV VITE_BASE_URL=http://localhost:5000

# Expose port 5173 (Vite's default port)
# This is documentation only - you still need to map ports in docker-compose
EXPOSE 5173

# Set host to 0.0.0.0 to allow external connections
# --host flag makes the server accessible from outside the container
CMD ["npm", "run", "dev"]