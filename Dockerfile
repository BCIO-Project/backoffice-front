# Dockerfile extending the generic Node image with application files for a
# single application.
FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy source code
COPY . .

# You have to specify "--unsafe-perm" with npm install
# when running as root.  Failing to do this can cause
# install to appear to succeed even if a preinstall
# script fails, and may have other adverse consequences
# as well.
# This command will also cat the npm-debug.log file after the
# build, if it exists.
RUN npm install

EXPOSE 80

CMD npm start
