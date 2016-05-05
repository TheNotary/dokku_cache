var port = 8000;

var path = require("path"),
    fs = require("fs"),
    appRoot = path.resolve(__dirname + "/.."),
    pjson = require(appRoot + '/package.json'),
    http = require('http'),
    https = require('https');

//
// Create a proxy server with custom application logic
//
// var proxy = httpProxy.createProxyServer({});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function(req, response) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  

  // display version info
  if (req.url == "/version") {
    response.end(pjson.version);  
    return;
  }


  // Assume that we don't have a file and need to DL it 

  // proxy for https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/cedar-14/ruby-2.2.4.tgz
  if (req.url.indexOf("heroku-buildpack-ruby") > -1) {

    var filePath = path.join(appRoot, '../', req.url);

    // Search for file being requested locally and serve that
    path.exists(filePath, function(exists) {
      if(!exists) {
        // request the file from upstream to the fs and pipe through response if we don't have the cache
        var wstream = fs.createWriteStream(filePath);

        var request = https.get("https://s3-external-1.amazonaws.com/" + req.url, function(originResponse) {
          var cType = originResponse.headers['content-type'];
          var cLength = originResponse.headers['content-length'];

          /*
          response.writeHead(200, {
            'Content-Type': cType,
            'Content-Length': cLength
          });
          */

          originResponse.pipe(response);
          originResponse.pipe(wstream);
        });

        return;
      }

      // Else, serve the file
      var stat = fs.statSync(filePath);

      /*
      response.writeHead(200, {
        'Content-Type': 'application/x-gtar',
        //'Content-Type': 'application/x-gzip',
        'Content-Length': stat.size
      });
      */

      var readStream = fs.createReadStream(filePath);

      readStream.pipe(response);
      return;
    });

  }

});

console.log("listening on port " + port)
server.listen(port);

