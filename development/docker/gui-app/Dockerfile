FROM node:lts

WORKDIR /data/gui/app

COPY gui/app .

COPY examples/configs /data/examples/configs

RUN npm install .

CMD ["npx", "quasar", "dev"]