################################################################################
#
# External Prices - Container Image
# This image implements a Node.js process as an unprivileged user in a hardened context.  
#
# see: https://github.com/ellerbrock/docker-collection/tree/master/dockerfiles/alpine-harden
#

################################################################################
#
#  Install phase [ as installer ]
#

# Build image with NPM, etc.
FROM mhart/alpine-node:10 AS installer

ENV SERVICE_HOME /home/app

COPY . ${SERVICE_HOME}/
WORKDIR ${SERVICE_HOME}

RUN apk --no-cache update && \
    apk --no-cache upgrade && \
    npm install --only=production

################################################################################
#
#  Release phase [ as release ]
#  Release image - no NPM, yarn, etc. & harden.sh applied
#

FROM mhart/alpine-node:slim-10 AS release

LABEL maintainer="jackie.luc@westjet.com"

ENV SERVICE_USER app
ENV SERVICE_HOME /home/app

COPY ./certs ${SERVICE_HOME}/certs
COPY --from=installer ${SERVICE_HOME} ${SERVICE_HOME}
WORKDIR ${SERVICE_HOME}

RUN apk --no-cache update && \
    apk --no-cache upgrade && \
    apk add --no-cache dumb-init && \
    addgroup -S app && adduser -h /home/app -s /bin/false -G app -S -g app app && \
    chown -R app:app ${SERVICE_HOME}/

USER ${SERVICE_USER}

EXPOSE 8080

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]

# With dumb-init as the entry point, node is not PID 1
CMD ["node", "--max-http-header-size=16348", "index.js"]