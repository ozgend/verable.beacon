FROM node:8.9-alpine
ARG redis_endpoint
ARG listen_port
ENV NODE_ENV production
ENV REDIS_ENDPOINT ${redis_endpoint}
ENV PORT ${listen_port}
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE ${listen_port}
CMD npm start