FROM nginx

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# File Author / Maintainer
MAINTAINER Raul Rodriguez Proenza

COPY . /usr/share/nginx/html

ENV SERVER=/var/www/server
COPY server-stage-3 "$SERVER"

# nvm environment variables
ENV NVM_DIR=/usr/local/nvm
ENV NODE_VERSION=8.11.1

# install nvm
# https://github.com/creationix/nvm#install-script

# Install Node.js and other dependencies
RUN apt-get update && \
    apt-get -y install curl

RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash

# install node and npm
RUN source "$NVM_DIR"/nvm.sh \
    && nvm install "$NODE_VERSION"\
    && nvm alias default "$NODE_VERSION" \
    && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH "$NVM_DIR"/v"$NODE_VERSION"/lib/node_modules
ENV PATH "$NVM_DIR"/versions/node/v"$NODE_VERSION"/bin:"$PATH"

# Define working directory
WORKDIR "$SERVER"

EXPOSE 80/tcp 443/tcp 1337/tcp

RUN cd "$SERVER" && npm i
RUN echo 'nginx & npm start' >start.sh

# Run app using nodemon
CMD ["sh", "start.sh"]

# Create image: docker build -t rproenza86/mws-restaurant:v0.0.1 .
# Test image: docker run --name mws-restaurant --rm -it -p 8998:80 -p 1337:1337 rproenza86/mws-restaurant:v0.0.1
#  docker run -P --name mws-restaurant -d rproenza86/mws-restaurant:v0.0.1
# Push docker image: docker push rproenza86/mws-restaurant:v0.0.1
# Check docker image online listing it: docker search rproenza86/mws-restaurant