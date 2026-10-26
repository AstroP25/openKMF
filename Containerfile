FROM docker.io/redhat/ubi10-minimal

RUN microdnf update -y && \
microdnf install -y caddy && \
microdnf clean

ADD Caddyfile /opt/
ADD openkmf /opt/

EXPOSE 443/tcp

WORKDIR /opt

CMD ["caddy","start"]