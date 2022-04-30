#!/bin/sh
git pull
docker rm -f main
docker images
read IMAGE
docker image rm $IMAGE
docker build . -t server
docker run -d -p 127.0.0.1:8080:8080 --link mongodb:mongodb --name main server
docker logs -f main