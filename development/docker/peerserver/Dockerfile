FROM node:lts

WORKDIR /data/peerserver

COPY peerserver .

COPY certificate_localhost /data/certificate_localhost

RUN npm install .

CMD ["node", "peers.js"]