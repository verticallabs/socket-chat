var _ = require('lodash');
var messages = require('./server/socket/messages');

var socket = io();

$(function() {
  $('button')
    .on('click', function() {
      socket.emit('?' + messages.NEW_MESSAGE, {
        body: $('#m').val(),
        roomId: 'lobby'
      });

      $('#m').val('');
    });
});

socket.on('!' + messages.ROOM_JOIN, function() {
  $('ul').empty();
});

socket.on('!' + messages.NEW_MESSAGE, function(m) {
  $('#messages')
    .append($('<li>')
    .text(m.body));
});

socket.on('connect', function() {
  socket.emit('?' + messages.ROOM_JOIN, { id: 'lobby' });
});

socket.on('reconnect', function() {
});
