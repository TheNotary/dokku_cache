// Configs
var port = 8000,
    controllerToDomainDic = {
      "/heroku-buildpack-ruby": "https://s3-external-1.amazonaws.com/",
      "/node": "https://s3pository.heroku.com/"
    };

// Dependencies
var path = require("path"),
    fs = require("fs"),
    appRoot = path.resolve(__dirname + "/.."),
    pjson = require(appRoot + '/package.json'),
    mkpath = require('mkpath'),
    http = require('http'),
    https = require('https');


var server = http.createServer(function(req, response) {
  // display version info
  if (req.url == "/version") {
    response.end(pjson.version);
    return;
  }

  // proxy for https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/cedar-14/ruby-2.2.4.tgz
  var filePath = path.join(appRoot, '../', req.url);
  var readStream = fs.createReadStream(filePath).

    // Serve the file from disk if we can open it
    on('open', function() {
      var stat = fs.statSync(filePath);

      response.writeHead(200, {
        'Content-Type': 'application/x-gtar',
        //'Content-Type': 'application/x-gzip',
        'Content-Length': stat.size
      });

      readStream.pipe(response);
    }).

    // request the file from upstream to the fs and pipe through response if we don't have the cache
    on('error', function(err) {
      if (err.code === 'ENOENT') {

        var originDomain = pickDomainToPullFrom(req.url);

        var request = https.get(originDomain + req.url).on('response', function(originResponse) {
          response.writeHead(200, {
            'Content-Type': originResponse.headers['content-type'],
            'Content-Length': originResponse.headers['content-length']
          });

          originResponse.pipe(response);  // write to network

          mkpath(path.dirname(filePath), function (err) {
            if (err) throw err;
            console.log("Cache Miss: Piping stream to disk.");
            var wstream = fs.createWriteStream(filePath);
            originResponse.pipe(wstream);   // write to file system
          });
        });
      }
      else {
        console.log("we hit an error while requesting a file from the Internet:  " + req.url);
        throw err;
      }
    });

});

console.log("listening on port " + port);
server.listen(port);


// Looks up what directory the file is being requested from.  This signals us
// what domain has the original file
function pickDomainToPullFrom(url) {
  var result;
  Object.keys(controllerToDomainDic).forEach(function(key) {
    if (url.lastIndexOf(key, 0) === 0)
      result = controllerToDomainDic[key];
  });
  return result;
}


// Hackish!!!!!
// Because it's really hard to tell Docker to run two servers, I spawn a git-daemon server from within the web server...
const spawn = require('child_process').spawn;
const gitDaemon = spawn('git', ['daemon', '--base-path=/usr/src/app/bp-ruby.git', '--listen=0.0.0.0', '/usr/src/app/bp-ruby.git'] );
// const gitDaemon = spawn('ls', ['-h']);

gitDaemon.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});


