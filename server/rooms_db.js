var debug = require('debug')('rooms_db');
var liveStream = require('level-live-stream');
var level = require('level');
var es = require('event-stream');
var _ = require('lodash');

var db = level('./db/chat.db', {valueEncoding: 'json'});
var live = liveStream(db)
  .on('data', function(data) {
    if (data.key.indexOf('message:') >= 0) {
      var idx = data.key.split(':')[1];

      db.get('messages', function(err, data) {
        data = data || {};
        data[idx] = '';
        db.put('messages', data);
      }); 
    }
  });

module.exports = es.merge(db, live);
