var ClientDatabase = require("./client/db.js").ClientDatabase; 
var db = new ClientDatabase();

//get initial chat state
db.on('message', function(m) {
  appendMessage(m);
})

db.on('del', function(m) {
  document.getElementById('messages').innerHTML = '';
})

function appendMessage(msg) {
  var p = document.createElement('p')
  var text = document.createTextNode(msg.name + ': ' + msg.message)
  p.appendChild(text)
  document.getElementById('messages').appendChild(p)
}

window.send = function() {
  var nameEl = document.getElementById('name')
  var msgEl = document.getElementById('message')
  var obj = {name: nameEl.value, message: msgEl.value}
  msgEl.value = ''
  db.addMessage(obj)
}

window.onload = function() {
  var nameEl = document.getElementById('name')
  var id = Math.random().toString().substr(2,3)
  nameEl.value += id
}

window.clearMessages = function() {
  db.clearMessages();
}
