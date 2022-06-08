# minimal distroless nodejs docker image
FROM gcr.io/distroless/nodejs:16 
WORKDIR /usr/app
# copy files from the temporary build folder
COPY .tmp/build .
USER 1000
CMD ["dist/index.js"]