#### SHARED DOCKER STAGES ##############

# The OS setup
FROM ubuntu as developer-os
MAINTAINER mike <michael.dacey@uwtsd.ac.uk>
ENV DEBIAN_FRONTEND    noninteractive
RUN apt-get update --fix-missing && \
apt-get install -y software-properties-common && \
apt-get install -y --no-install-recommends apt-utils && \
apt-get install -y curl \
wget
RUN apt-get install -y sudo
RUN echo "export SERVER_IP_ADDRESS='0.0.0.0'" >> /etc/profile
RUN apt-get clean

# Setup for node.js
FROM developer-os as nodeenv
MAINTAINER mike <michael.dacey@uwtsd.ac.uk>
WORKDIR /var/www/node
RUN curl -fsSL https://deb.nodesource.com/setup_17.x | sudo -E bash - && \
apt-get install -y nodejs && \
npm install -g npm && \
npm install -g npx --force
RUN npm install -g package-json-merge && \
npm install -g nodemon

RUN npm init -y
RUN npm install --save-dev typescript && \
npm install --save-dev @types/node
# Install the express framework
RUN npm install express && \
npm install express-validator && \
npm install axios && \
npm install cors && \
npm install --save-dev @types/express && \
npm install --save-dev @types/cors
RUN npm install ejs

FROM nodeenv as webservice-build
# Create and change the working directory
WORKDIR /var/www/node
RUN npm install --save-dev @types/jquery
# Copy the package.json file for the "build" script
# merging in the dependencies from previous steps
COPY ./package.json ./package.json.tmp
RUN package-json-merge package.json package.json.tmp > ./package2.json && \
mv package2.json package.json && rm package.json.tmp
# Copy the typescript config file
COPY ./configs/tscompileoptions.json ./configs/
# Copy the application files to the image
COPY ./tsconfig.service.json ./
COPY ./*.html ./
COPY ./*.ts ./
COPY ./*.ejs ./
# Build the code
RUN npm run build

FROM nodeenv as webservice
RUN apt-get -y update && \
apt-get install -y dnsutils && \
apt-get install -y iproute2 && \
apt-get install -y net-tools
# Expose our webservices port number
EXPOSE 1340
# Create and change the working directory
WORKDIR /var/www/node
# Copy the package.json file for the "start" script
COPY --from=webservice-build /var/www/node/package.json ./
# Copy the built application files
COPY --from=webservice-build /var/www/node/dist ./
COPY --from=webservice-build /var/www/node/*.ejs ./
COPY --from=webservice-build /var/www/node/*.html ./
COPY --from=webservice-build /var/www/node/node_modules ./node_modules
# Execute the application
ENTRYPOINT ["npm", "run", "start"]


