#!/bin/bash

# Build the Docker image
docker build -t cavity-calculator-builder .

# Run the container and copy the built files
docker run --rm -v "$(pwd)/release:/app/release" cavity-calculator-builder

echo "Windows installer has been built in the release directory!" 