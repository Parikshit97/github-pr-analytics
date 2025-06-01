# Use a small base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json first for caching
COPY package*.json ./

# Install dependencies (cached unless package files change)
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose port and define start command
EXPOSE 3000
CMD ["npm", "start"]
