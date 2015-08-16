var debug = require('debug')('app:socket');
var socketIo = require('socket.io');
var util = require('util');
var _ = require('lodash');
var redis = require('redis').createClient(process.env.REDIS_PORT, process.env.REDIS_HOSTNAME);

var messages = require('./messages');
var roomHandlers = require('./room');
var messageHandlers = require('./message');

module.exports = function(http) {
  var io = socketIo(http);

  io.on('connection', function(socket){
    socket._redis = redis;
    socket._io = io;

    socket.on('?' + messages.ROOM_JOIN, roomHandlers.join.bind(socket));
    socket.on('?' + messages.ROOM_LEAVE, roomHandlers.leave.bind(socket));
    socket.on('?' + messages.NEW_MESSAGE, messageHandlers.send.bind(socket));

    socket.on('disconnect', function(){
    });

    socket.on('debug', function(o) {
      debug(o);
    });
  });
}
