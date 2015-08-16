var debug = require('debug')('app:server');
var browserify = require('browserify');
var util = require('util');
var _ = require('lodash');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var socket = require('./socket')(http);

app.use(express.static('public'));
app.get('/client.js', function(req, res){
  res.writeHead(200, {'Content-Type': 'application/javascript'});
  browserify('./client.js', {debug:true}).bundle().pipe(res);
});

http.listen(3000, function(){
  debug('listening on 3000');
});
