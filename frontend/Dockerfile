FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm
COPY package.json pnpm-lock.yaml ./
# Make sure to copy pnpm-lock.yaml as well
RUN rm -rf node_modules && pnpm install --frozen-lockfile

# Copy project files
COPY . .

# Build the application
# The build script in package.json is "next build", which should work with pnpm.
RUN pnpm run build

# Expose the application port
EXPOSE 3000

# Start the application using pnpm
CMD ["pnpm", "run", "dev"] 