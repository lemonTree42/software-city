FROM node:14-alpine as builder
COPY . .
RUN npm install
RUN npm run build

FROM nginx@sha256:644a70516a26004c97d0d85c7fe1d0c3a67ea8ab7ddf4aff193d9f301670cf36
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder ./dist/ /usr/share/nginx/html/
ARG configpath
COPY --from=builder ${configpath}  /etc/nginx/conf.d/app.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# run with: docker build -t test --build-arg configpath=./nginx.conf .