var debug = require('debug')('server');
var http = require('http')
var fs = require('fs')
var browserify = require('browserify')
var level = require('level');
var multilevel = require("multilevel");
var shoe = require("shoe");
var es = require('event-stream');
var roomsDb = require('./server/rooms_db');

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
}).listen(3000);

var wsServer = shoe(function(stream) {
  stream
    .pipe(es.map(function(data, next) {
      debug('in: ' + data);
      next(null, data);
    }))
    .pipe(multilevel.server(roomsDb))
    .pipe(es.map(function(data, next) {
      debug('out: ' + data);
      next(null, data);
    }))
    .pipe(stream);
});
wsServer.install(server, '/room/ws');
