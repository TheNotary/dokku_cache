## Manually Boot the Servers

#### Fire up asset server

So first fire up the http server for most of the assets:

```
  $  cd misc/dokku_proxy
  $  rvmsudo ruby -run -e httpd . 
```

#### Fire up build-step git server

```
  $  cd misc/heroku-buildpack-ruby
  $  touch .git/git-daemon-export-ok
  $  git daemon --base-path=. --listen=0.0.0.0
``` 

