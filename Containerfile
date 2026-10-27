FROM docker.io/alpine:3.24

RUN apk update --no-cache && \
apk add lighttpd

COPY openkmf/. /var/www/localhost/htdocs
EXPOSE 80

CMD ["lighttpd","-D","-f","/etc/lighttpd/lighttpd.conf"]

