FROM docker.io/node:23.10.0-alpine3.21@sha256:6eae672406a2bc8ed93eab6f9f76a02eb247e06ba82b2f5032c0a4ae07e825ba

WORKDIR /usr/app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

ENTRYPOINT [ "node", "dist/index.js" ]