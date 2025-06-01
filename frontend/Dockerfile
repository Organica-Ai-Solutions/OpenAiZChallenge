FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm
COPY package.json pnpm-lock.yaml ./
# Remove frozen-lockfile for development flexibility
RUN rm -rf node_modules && pnpm install

# Copy project files
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application in development mode
CMD ["pnpm", "run", "dev"] 