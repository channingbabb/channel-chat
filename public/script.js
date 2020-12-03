const socket = io.connect();

// name input
let name = prompt("What is your username?");

// room input
let room = prompt("What room do you want to join?");

console.log(room);

socket.emit('joined', {
  name: name,
  room: room
});

// message input
let msg = document.querySelector(".message");



msg.addEventListener("keyup", function(event) {
  console.log("checkpoint 1");
  if (msg.value !== "") {
    console.log("checkpoint 2");
    if (event.keyCode === 13) {
      // emit name and msg

      if (!name) {
        let name = "mr. no-name doofenshmirtz";
      }
      if (!room) {
        let room = "general";
      }

      socket.emit('send', {
        name: name,
        room: room,
        msg: msg.value
      });
      console.log("checkpoint 3");
      msg.value = "";
    }
  }
});


socket.on('send', data => {
  document.getElementById('messages').innerHTML += "<ul>" + "<li>" + "<strong>" + data.name + "</strong>" + "</li>" + data.msg + "</ul>";
});

socket.on('joined', function(data) {
  console.log(room);

  document.getElementById('messages').innerHTML += "<ul>" + "<li>" + "🔵 " + data.name + "   joined " + data.room + "</li>" + "</ul>";
  document.getElementById('active-members').innerHTML = "Online in room: <i>" + data.clients + "</i>";
  document.getElementById('total-active-members').innerHTML = "Online in all: <i>" + data.totalclients + "</i>";

});

socket.on('roomConnection', function(data) {
  document.getElementById('room-name').innerHTML = "Room: <i>" + data.room + "</i>";
});

socket.on('infoUpdate', function(data) {
  let name = data.name;
  let room = data.room;
});

socket.on('updateOnline', function(data) {
  document.getElementById('active-members').innerHTML = "Online in room: <i>" + data.clients + "</i>";
  document.getElementById('total-active-members').innerHTML = "Online in all: <i>" + data.totalclients + "</i>";
});

socket.on('roomNoName', function(data) {
  document.getElementById('messages').innerHTML += "<ul>" + "<li> You were moved to <i>general</i> because you did not enter a room name. </li>" + "</ul>";
});

socket.on('disconnect', function(room) {
})