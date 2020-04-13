FROM node:12.16.1-alpine as builder
USER root

WORKDIR /opt/central-event-processor

RUN apk --no-cache add git
RUN apk add --no-cache -t build-dependencies make gcc g++ python libtool autoconf automake \
  && cd $(npm root -g)/npm \
  && npm config set unsafe-perm true \
  && npm install -g node-gyp

COPY package.json package-lock.json* /opt/central-event-processor/

RUN npm install

COPY src /opt/central-event-processor/src
COPY config /opt/central-event-processor/config
COPY app.js /opt/central-event-processor/
COPY docs /opt/central-event-processor/docs

FROM node:12.16.1-alpine
WORKDIR /opt/central-event-processor

# Create empty log file & link stdout to the application log file
RUN mkdir ./logs && touch ./logs/combined.log
RUN ln -sf /dev/stdout ./logs/combined.log

# Create a non-root user: ml-user
RUN adduser -D ml-user 
USER ml-user

COPY --chown=ml-user --from=builder /opt/central-event-processor .
RUN npm prune --production

EXPOSE 3080
CMD node app.js
