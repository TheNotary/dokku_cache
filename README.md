# dokku_cache

By running this app (http proxy + git daemon) on some host and creating 2 env vars in your dokku app, you'll be able to push to that app without having to be connected to the internet and wasting bandwidth.  Plus the request that the ruby/ node buildpacks make for node will go over https instead of insecurely... though I should point out, this app's proxy must be connected to via http so keep it on your secure LAN or localhost!  

This has only been testing on rails apps, it will very likely need tweaking to work with, say, go apps.  


## Concept

Ordinarily when you deploy to dokku (consider a rails app) the following online activity take place: 

 - It first goes online to look up any custom build packs...
 
 - It then downloads, say, ruby stuff
 
 - It then downloads node (over http, yikes)
 
Now if you use my custom ruby buildpack which avoids the standard node proxy (http://s3pository.heroku.com/node/v0.10.30/node-v0.10.30-linux-x64.tar.gz) and the heroku buildpacks server (https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/) you won't need to access the internet at all except for gems.  And you can run a gem server with a cache of your gems for that bit of it.


## Usage

#### Set up the proxy info for the dokku app

`DOKKU_APP_NAME` should be the name of the dokku app you'd like to hook into this proxy-mi-jigger.  `IP_ADDRESS` should be the IP of the server running this docker app, and from the perspective of the dokku server.

```
  export DOKKU_APP_NAME=app_name
  export IP_ADDRESS="192.168.0.145"
  dokku config:set ${DOKKU_APP_NAME} BUILDPACK_URL=git://${IP_ADDRESS}/ BUILDPACK_VENDOR_URL="http://${IP_ADDRESS}:8000/heroku-buildpack-ruby/" VENDOR_URL="http://${IP_ADDRESS}:8000/"
```


#### Boot the servers via docker

```
  # Build the new docker image
  docker build -t john/dokku_cache .

  # Run the image
  docker run -v `pwd`:/usr/src/app -p 8000:8000 -p 9418:9418 john/dokku_cache
```


#### Change out Buildpack

So the buildpack is how your app sets up the environment for the app you're pushing to dokku.  In the case of pushing a rails app, this means installing ruby and node.  The buildpack is stored at `bp-ruby.git/` so if that thing's not to your liking, change it up.  

#### Misc

To see notes on manually running things, see MANUAL.md

