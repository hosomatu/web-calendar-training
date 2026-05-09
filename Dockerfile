FROM  nginx:latest

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./content/* /usr/share/nginx/html

EXPOSE 80
