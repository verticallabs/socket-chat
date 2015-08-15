var debug = require('debug')('serverRoom');
var levelup = require('levelup');
var multilevel = require('multilevel');
var levelLiveStream = require('level-live-stream');
var stream = require('stream');

function ServerRoom(options) {
  this.options = options || {};
  
  this.messages = {};
  this.init();
  
  return this;
}

ServerRoom.prototype.init = function init() {
  var self = this;

  this.db = levelup(this.options.path, {valueEncoding: 'json'});

  var levelStream = levelLiveStream(this.db);
  levelStream.on('data', this._handleData.bind(this));

  this.liveDbStream = levelStream.on('data', this._handleData.bind(this));
  this.dbStream = multilevel.server(this.db)

  //load initial messages
  self.db.get('messages', function(err, data) {
    if (err) return;
    self.messages = data;
  });
};

ServerRoom.prototype._handleData = function _handleData(data) {
  var self = this;

  if (data.type === 'del' && data.key === 'messages') { 
    //'clear' pressed, doesn't actually remove all of the keys, although you easily could
    self.messages = {};
  }

  if (data.key.indexOf('message:') >= 0) {
    var idx = data.key.split(':')[1];
    self.messages[idx] = ''; //not sophisticated enough to handle messages generated at exact same time
    self.db.put('messages', self.messages);
  }
}

module.exports = {
  ServerRoom: ServerRoom
};
