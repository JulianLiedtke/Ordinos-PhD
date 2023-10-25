FROM node:lts

WORKDIR /data/gui/website

COPY gui/website .

COPY examples/configs /data/examples/configs

RUN npm install .

CMD ["npx", "quasar", "dev"]