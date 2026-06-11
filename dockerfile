# Build Frontend
FROM oven/bun:1 AS collab-frontend-builder

WORKDIR /frontend

COPY ./Frontend/package.json ./Frontend/bun.lock ./

RUN bun install --frozen-lockfile

COPY ./Frontend .

RUN bun run build


# Build Backend Runtime
FROM oven/bun:1

WORKDIR /app

COPY ./Backend/package.json ./Backend/bun.lock ./

RUN bun install --frozen-lockfile

COPY ./Backend .

COPY --from=collab-frontend-builder /frontend/dist ./public

EXPOSE 3000

CMD ["bun", "run", "start"]
