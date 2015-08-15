var debug = require('debug')('server');
var http = require('http')
var fs = require('fs')
var browserify = require('browserify')
var mountRoom = require('./server/mount_room');

var server = http.createServer(function(req, res) {
  switch (req.url) {
    case '/room': 
      fs.createReadStream('./index.html').pipe(res)
      break;
    case '/client.js':
      res.writeHead(200, {'Content-Type': 'application/javascript'})
      browserify('./client.js', {debug:true}).bundle().pipe(res)
      break;
    default: 
      res.writeHead(200, {'Content-Type': 'text/plain'})
      res.end(res.url + ' not found')
  }
});

mountRoom(server, '/room');

server.listen(8000, function() {
  console.log('listening...')
})
