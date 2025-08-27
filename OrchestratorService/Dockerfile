# Use a Node.js 20 base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose the application port
EXPOSE 3003

# Command to run the application
CMD ["npm", "start"]
