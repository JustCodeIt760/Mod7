# Use Node.js 18 with Alpine Linux
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
# This layer will only rebuild if package files change
COPY package*.json ./

# Install dependencies
# ci is preferred over install in Docker for consistent installs
RUN npm ci

# Copy the rest of the application
# This layer will rebuild on any code changes
COPY . .

# Expose port 5173 (Vite's default port)
# This is documentation only - you still need to map ports in docker-compose
EXPOSE 5173

# Set host to 0.0.0.0 to allow external connections
# --host flag makes the server accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host"]