var debug = require('debug')('app:message');
var util = require('util');
var messages = require('./messages');

function send(m) {
  var socket = this;
  var io = socket._io;
  var redis = socket._redis;

  debug(util.inspect(m));
  var messageId = 'message:' + new Date().valueOf();
  redis.set(messageId, JSON.stringify(m), function(err) {
    redis.rpush('room:' + m.roomId, messageId, function(err) {
      io.in(m.roomId).emit('!' + messages.NEW_MESSAGE, m);
    });
  }); 
}

function emit(m) {
  var socket = this;
  socket.emit('!' + messages.NEW_MESSAGE, m);
}

module.exports = {
  send: send,
  emit: emit
};
