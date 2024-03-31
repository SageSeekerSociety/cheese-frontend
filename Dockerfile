FROM node:21-slim as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
RUN corepack enable

FROM base as dev
COPY . ./
RUN pnpm install --frozen-lockfile
CMD ["pnpm", "dev"]

FROM base as build
COPY . ./
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM nginx:1.25.4 as prod
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
