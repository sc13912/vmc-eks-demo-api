# Use a node 12 base image
FROM node:12-alpine

# Create the app directory
WORKDIR /usr/src/app

ARG DB_HOST
ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_NAME

# Install dependencies
COPY package*.json ./
RUN npm ci

# Start the app
COPY . .
ENV DB_HOST=$DB_HOST
ENV DB_USERNAME=$DB_USERNAME
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_NAME=$DB_NAME


RUN echo $DB_HOST

EXPOSE 3000

ENTRYPOINT ["npm", "start"]
