FROM node:lts AS base

WORKDIR /usr/src/bot

# Install deps
COPY package*.json ./
RUN npm ci

# Copy only build inputs, not the whole repo
COPY tsconfig*.json ./
COPY src ./src

# Build inside the image
RUN npm run build

# Run the built code
CMD ["npm", "start"]