FROM docker.io/alpine:3.24

COPY Caddyfile /opt/
COPY openkmf/. /opt/openkmf/
COPY kfdweb/. /opt/kfdweb/

RUN apk update --no-cache && \
apk add caddy && \
chmod -R 755 /opt/openkmf && \
chmod -R 755 /opt/kfdweb

EXPOSE 443/tcp

WORKDIR /opt

CMD ["caddy","run"]