FROM node:lts AS base

# Enable corepack (bundled with recent Node images) so pnpm is available
RUN corepack enable

WORKDIR /usr/src/bot

# Install dependencies with pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy only build inputs, not the whole repo
COPY tsconfig*.json ./
COPY src .

# Build inside the image
RUN pnpm run build

# Run the built code
CMD ["pnpm", "start"]