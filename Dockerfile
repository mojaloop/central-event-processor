# Arguments
ARG NODE_VERSION=lts-alpine

# NOTE: Ensure you set NODE_VERSION Build Argument as follows...
#
#  export NODE_VERSION="$(cat .nvmrc)-alpine" \
#  docker build \
#    --build-arg NODE_VERSION=$NODE_VERSION \
#    -t mojaloop/central-event-processor:local \
#    . \
#

# Build Image
FROM node:${NODE_VERSION} as builder
USER root

WORKDIR /opt/app

RUN apk --no-cache add git
RUN apk add --no-cache -t build-dependencies make gcc g++ python3 libtool openssl-dev autoconf automake bash \
    && cd $(npm root -g)/npm

COPY package.json package-lock.json* /opt/app/

RUN npm ci

RUN apk del build-dependencies

COPY src /opt/app/src
COPY config /opt/app/config

FROM node:${NODE_VERSION}

WORKDIR /opt/app

# Create empty log file & link stdout to the application log file
RUN mkdir ./logs && touch ./logs/combined.log
# Links combined to stdout
RUN ln -sf /dev/stdout ./logs/combined.log

# Create a non-root user:app-user
RUN adduser -D app-user
USER app-user

COPY --chown=app-user --from=builder /opt/app .
RUN npm prune --production

EXPOSE 3080
CMD ["npm", "start"]