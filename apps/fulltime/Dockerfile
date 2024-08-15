FROM node:20.16-bullseye-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

ENV NODE_ENV="production"

FROM base AS prod-deps

COPY --link pnpm-*.yaml ./
COPY --link package.json ./
COPY --link apps/fulltime/package.json ./apps/fulltime/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build

ARG DATABASE_URL
ARG PORT

COPY --link pnpm-*.yaml ./
COPY --link package.json ./
COPY --link apps/fulltime/package.json ./apps/fulltime/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY --link . .

RUN pnpm --filter fulltime run build

FROM base

COPY --from=build /app/apps/fulltime/dist /app
COPY --from=build /app/apps/fulltime/web/dist /app/web/dist
COPY --from=prod-deps /app/node_modules /app/node_modules

EXPOSE 3000

CMD [ "node", "index.js" ]