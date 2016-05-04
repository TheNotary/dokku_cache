FROM buildpack-deps:jessie

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


# get git and python I guess
RUN apt-get update && apt-get install -y \
  git \
  python \
 && rm -rf /var/lib/apt/lists/*



# Bundle app source
COPY . /usr/src/app

# start servers
CMD [ "git", "daemon", "--base-path=/usr/src/app/bp-ruby.git/", "--listen=0.0.0.0", "--detach" ]
CMD [ "python", "-m", "SimpleHTTPServer"]

