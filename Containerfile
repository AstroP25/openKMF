FROM docker.io/alpine:3.24

RUN apk update --no-cache && \
apk add caddy

ADD Caddyfile /opt/
ADD openkmf /opt/openkmf/

EXPOSE 443/tcp

WORKDIR /opt

CMD ["caddy","start"]