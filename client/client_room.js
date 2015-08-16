var multilevel = require('multilevel');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var levelLiveStream = require('level-live-stream');
var shoe = require('shoe');

function ClientRoom(options) {
  var self = this;
  self.options = options || {};

  self.db = multilevel.client();

  self.dbSocket = shoe(options.path + '/ws');
  self.dbSocket.pipe(self.db.createRpcStream()).pipe(self.dbSocket)

  var liveStream = levelLiveStream(self.db);
  liveStream.on('data', self._handleSocketChanges.bind(self));

  self.db.get('messages', function(err, messages) {
    if (messages == null) return;

    var ids = Object.keys(messages).slice(-15) //take last 15
    ids.forEach(self._loadMessage.bind(self));
  });

  return self;
}
util.inherits(ClientRoom, EventEmitter); 

ClientRoom.prototype._emitMessage = function _emitMessage(m) {
  var self = this;
  self.emit('message', m);
}


ClientRoom.prototype._loadMessage = function _loadMessage(id) {
  var self = this;
  if (!id) return;

  self.db.get('message:' + id, function(err, message) {
    self._emitMessage(message);
  })
}
/*
ClientRoom.prototype.init = function init() {
  var self = this;

  self.dbSocket.pipe(self.db.createRpcStream()).pipe(self.dbSocket)
  self.changesSocket.on('data', self._handleSocketChanges.bind(self));
  self.db.get('messages', function(err, messages) {
    if (messages == null) return;

    var ids = Object.keys(messages).slice(-15) //take last 15
    ids.forEach(self._loadMessage.bind(self));
  });
}
*/

ClientRoom.prototype._handleSocketChanges = function _handleSocketChanges(data) {
  var self = this;
  //var data = JSON.parse(data)

  switch(data.type) {
    case 'put':
      if(_.contains(data.key, 'message:')) {
        self._emitMessage(data.value);
      }
      break;
    case 'del':
      self.emit('del');
      break;
  }
}


ClientRoom.prototype.addMessage = function addMessage(m) {
  this.db.put('message:' + Date.now(), m)
}

ClientRoom.prototype.clearMessages = function addMessage(m) {
   this.db.del('messages');
}

module.exports = {
  ClientRoom: ClientRoom
};
