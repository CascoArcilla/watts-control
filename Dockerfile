## Este Dockerfile esta pensado para montar todo el sistema en un solo contenedor
## No es el ideal, pero es el que funciona por ahora

## El servicio de postgres es externo a este docker, 
## por lo que hay que tenerlo corriendo en otro contenedor
## o en la maquina host

## La app frontend esta pensada para ser servida por el backend
## Usa pnpm como administrador de paquetes

ARG NODE_VERSION=22.19.0
ARG PNPM_VERSION=10.17.1

# --- Phase 1: Build Frontend ---
FROM node:${NODE_VERSION}-alpine AS frontend-builder
RUN npm install -g pnpm@${PNPM_VERSION}
WORKDIR /app/frontend

COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Force installation of devDependencies and include hoisting for binaries
RUN pnpm install --frozen-lockfile

# Copy code and build (Generate /app/frontend/dist)
COPY frontend/ .

# RUN pnpm build
RUN pnpm build

# --- Phase 2: Prepare the Backend and join everything ---
FROM node:${NODE_VERSION}-alpine AS final
RUN npm install -g pnpm@${PNPM_VERSION}
WORKDIR /app/backend

# Installation of backend dependencies
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the backend code
COPY backend/ .

# Copy the frontend build (essential for Express to serve it)
COPY --from=frontend-builder /app/frontend/dist ../frontend/dist

# Set up the entrypoint and permissions
RUN chmod +x entrypoint.sh && chown node:node entrypoint.sh

# Ensure node user owns the app folder (Fixed -R and path)
RUN chown -R node:node /app

USER node
EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]