ARG NODE_VERSION=22.19.0
ARG PNPM_VERSION=10.17.1

FROM node:${NODE_VERSION}-alpine

# Install pnpm.
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

WORKDIR /frontend

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.local/share/pnpm/store to speed up subsequent builds.
# Leverage a bind mounts to package.json and pnpm-lock.yaml to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Run the application as a non-root user.


# Copy the rest of the source files into the image.
COPY . .

RUN chmod 777 ./vite.config.js

# Expose the port that the application listens on.
EXPOSE 5173

# Run the application.
CMD pnpm dev:host
