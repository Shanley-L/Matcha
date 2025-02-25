FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Install curl for health checks
RUN apk add --no-cache curl

# Create a directory for the source code
RUN mkdir -p /app/src /app/public

EXPOSE 3000

CMD ["npm", "start"]