FROM nginx:alpine

FROM node:16

WORKDIR /src

RUN corepack enable && corepack prepare --all

COPY . .

RUN yarn install

RUN yarn docs:build

COPY --from=builder /src/docs/.vitepress/dist /usr/share/nginx/html/static

RUN echo " server { listen 8080; root /usr/share/nginx/html/static; absolute_redirect off; location / { try_files $uri $uri.html $uri/index.html /404.html =404; } }"> /etc/nginx/conf.d/default.conf