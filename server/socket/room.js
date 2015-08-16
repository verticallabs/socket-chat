var debug = require('debug')('app:room');
var messages = require('./messages.js');
var message = require('./message');
var _ = require('lodash');

var MESSAGES_TO_START = 15;

function join(room) {
  var socket = this;
  var redis = socket._redis;

  debug('join ' + room.id);
  socket.join(room.id);
  socket.emit('!' + messages.ROOM_JOIN, { roomId: room.id });

  redis.lrange('room:' + room.id, -1 * MESSAGES_TO_START, MESSAGES_TO_START, function(err, list) {
    if(err) debug(err);
    _.each(list, function(messageId) {
      redis.get(messageId, function(err, m) {

        if(err) debug(err);
        message.emit.bind(socket)(JSON.parse(m));
      });
    });
  });
}

function leave() {
  var socket = this;

  debug('leave ' + room.id);
  socket.leave(room.id);
  socket.emit('!' + messages.ROOM_LEAVE, { roomId: room.id });
}

module.exports = {
  join: join,
  leave: leave
};
