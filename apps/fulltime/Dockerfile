FROM node:20.16-bullseye-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

ENV NODE_ENV="production"

FROM base AS prod-deps

COPY --link ./package.json ./pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

COPY --link ./web/package.json ./web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store cd web && pnpm install --prod --frozen-lockfile

FROM base AS build

ARG DATABASE_URL
ARG PORT

COPY --link ./package.json ./pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY --link ./web/package.json ./web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store cd web && pnpm install --frozen-lockfile

COPY --link . .

RUN pnpm run build

RUN find ./web -mindepth 1 ! -regex '^./web/dist\(/.*\)?' -delete

FROM base

COPY --from=build /app/dist /app
COPY --from=build /app/web/dist /app/web/dist

EXPOSE 3000

CMD [ "node", "index.js" ]