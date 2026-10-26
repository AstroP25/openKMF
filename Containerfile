FROM docker.io/redhat/ubi10-minimal

RUN microdnf update -y && \
microdnf install -y caddy && \
microdnf clean

ADD caddy.cfg /etc/caddy/
ADD openkmf/ /var/www/localhost/

WORKDIR /var/www/localhost/

CMD [caddy]