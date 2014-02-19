var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};


// If there is nothing to return send a 404.
function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}


// Send files to user looking up mim type of file.
function sendFile(response, filePath, fileContents)  {
  response.writeHead(
    200,
    {"content-type" : mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}

// Serve static files to user located in public folder.
function serveStatic (response, cache, absPath) {
  if(cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, function(exists) {
      if(exists) {
        fs.readFile(absPath, function(err, data) {
          if(err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
}

// Create Server and send index.html when hitting root.
var server = http.createServer(function(request, response) {
  var filePath = false;

  if(request.url == '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + request.url;
  }

  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);
});


// Start Listening
server.listen(3000, function() {
  console.log("Server listening on port 3000.");
});

// Require and start the chat server.
var chatServer = require('./lib/chat_server');
chatServer.listen(server);



