FROM electronuserland/builder:wine

# Set environment variables
ENV ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true
ENV ELECTRON_BUILDER_ARCH=x64
ENV NODE_OPTIONS=--max_old_space_size=4096

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
CMD ["npm", "run", "electron:build:win"] 