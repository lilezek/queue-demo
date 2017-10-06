# specify the node base image with your desired version node:<version>
FROM node:8

WORKDIR /usr/src/app

# Install app dependencies
COPY tsconfig.json package.json package-lock.json ./

RUN npm install

# Bundle app source
COPY . .

ARG topic=topic1

# Compile TypeScript
RUN npm run build

CMD ["npm", "start", "$topic1"]
