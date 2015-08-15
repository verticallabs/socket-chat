var ClientRoom = require("./client/client_room.js").ClientRoom; 
var room = new ClientRoom({ path: window.location.pathname });

//get initial chat state
room.on('message', function(m) {
  appendMessage(m);
})

room.on('del', function(m) {
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
  room.addMessage(obj)
}

window.onload = function() {
  var nameEl = document.getElementById('name')
  var id = Math.random().toString().substr(2,3)
  nameEl.value += id
}

window.clearMessages = function() {
  room.clearMessages();
}
