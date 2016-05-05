# dokku_cache

TODO:  

  - Add a DL latest function to populate all the data I painstakingly dropped into place
  - Add Proxying functionality?????? instead of the above?


## Concept

Ordinarily when you deploy to dokku (consider a rails app), the following online activity take place: 

 - It first goes online to look up any custom build packs...
 
 - It then downloads, say, ruby stuff
 
 - It then downloads node (over http, yikes)
 
Now if you use my custom ruby buildpack which avoids the standard node proxy (http://s3pository.heroku.com/node/v0.10.30/node-v0.10.30-linux-x64.tar.gz) and the heroku buildpacks server (https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/) you won't need to access the internet at all except for gems.  And you can run a gem server with a cache of your gems for that bit of it.


## Usage


#### Set up the proxy info for the dokku app

```
  export DOKKU_APP_NAME=app_name
  export IP_ADDRESS="192.168.0.145"
  dokku config:set ${DOKKU_APP_NAME} BUILDPACK_URL=git://${IP_ADDRESS}/ BUILDPACK_VENDOR_URL="http://${IP_ADDRESS}/heroku-buildpack-ruby/"
```


#### Boot the servers via docker

```
  # Build the new docker image
  docker build -t john/dokku_cache .

  # Run the image
  docker run -v `pwd`:/usr/src/app -p 8000:8000 -p 9418:9418 john/dokku_cache
```

To see notes on manually running things, see MANUAL.md



