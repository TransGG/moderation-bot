#!/usr/bin/env bash

# cd into the directory of the script
cd "$(dirname -- "${BASH_SOURCE[0]:-$0}";)"

# remove temporary build folder just in case
rm -rf .tmp/build

# remove previous image
docker image rm -f transplace/moderation-bot:latest

# compile typescript
echo Building transplace/moderation-bot:compile
docker build -t transplace/moderation-bot:compile . -f Dockerfile.compile

# extract the compiled files to a temporary build folder
docker container create --name extract transplace/moderation-bot:compile  
docker container cp extract:/usr/app .tmp/build  
docker container rm -f extract

# remove the typescript compilation image
docker image rm transplace/moderation-bot:compile

# build the production image
echo Building transplace/moderation-bot:latest
docker build --no-cache -t transplace/moderation-bot:latest .