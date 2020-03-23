FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

CMD /usr/bin/tail -f /dev/null
