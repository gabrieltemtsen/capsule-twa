# Use the official Node.js 18 image as the base
FROM node:18-alpine AS base

# Set working directory
WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose port 4000 (as your server runs on this port)
EXPOSE 4000

# Set the command to start your custom server
CMD ["npm", "run", "start"]
