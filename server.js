var http = require('http')
var shoe = require('shoe')
var fs = require('fs')
var browserify = require('browserify')
var ServerRoom = require('./server/server_room').ServerRoom;
var room = new ServerRoom({path: './db/chat.db'});

var changesSocket = shoe(function(stream) {
  room.liveDbStream.pipe(stream); 
});

var dbSocket = shoe(function(stream) {
  stream.pipe(room.serverStream).pipe(stream);
});

var server = http.createServer(function(req, res) {
  switch (req.url) {
    case '/': 
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

changesSocket.install(server, '/wschanges');
dbSocket.install(server, '/wsdb');

server.listen(8000, function() {
  console.log('listening...')
})
