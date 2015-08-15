var debug = require('debug')('mount_room');
var shoe = require('shoe')
var es = require('event-stream');

var ServerRoom = require('./server_room').ServerRoom;
var room = new ServerRoom({path: './db/chat.db'});

function mountRoom(server, path) {
  var changesSocket = shoe(function(stream) {
    room.liveDbStream
      .pipe(es.map(function(data, next) { 
        debug(path + ':live');
        debug(data);
        next(null, JSON.stringify(data)) 
      }))
      .pipe(stream); 
  });

  var dbSocket = shoe(function(stream) {
    var es = require('event-stream');
    stream
      .pipe(es.map(function(data, next) {
        debug(path + ':in')
        debug(data)
        next(null, data)  
      }))
      .pipe(room.dbStream)
      .pipe(es.map(function(data, next) {
        debug(path + ':out')
        debug(data)
        next(null, data)  ;
      }))
      .pipe(stream);
  });

  debug('mounting room at ' + path);
  changesSocket.install(server, path + '/changes');
  dbSocket.install(server, path + '/db');
}

module.exports = mountRoom;
