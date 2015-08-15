var multilevel = require('multilevel');
var shoe = require('shoe');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

function ClientRoom(options) {
  this.options = options || {};

  this.db = multilevel.client();
  this.dbSocket = shoe('/wsdb');
  this.changesSocket = shoe('/wschanges');

  this.init();

  return this;
}
util.inherits(ClientRoom, EventEmitter); 

ClientRoom.prototype._emitMessage = function _loadMessage(m) {
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

ClientRoom.prototype.init = function init() {
  var self = this;

  self.dbSocket.pipe(self.db.createRpcStream()).pipe(self.dbSocket)

  self.changesSocket.on('data', function _handleSocketChanges(data) {
    var data = JSON.parse(data)
console.log(data);

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
  });

  self.db.get('messages', function(err, messages) {
    if (messages == null) return;

    var ids = Object.keys(messages).slice(-15) //take last 15
    ids.forEach(self._loadMessage.bind(self));
  });
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
