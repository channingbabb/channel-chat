var express = require('express');
var app = express();
var socket = require('socket.io');
var React = require('react');

this.general = [];

app.use(express.static('public'));

var server = app.listen(3000, function() {
  console.log('Server started');
});

var io = socket(server);

var users = [];
var rooms = [];
var usersInRooms = [];

Array.prototype.findName = function(socketid) {
  for (i = 0; i < this.length; i++) {
    if (this[i] == socketid) {
      return this[i + 1];
    }
  }
}

Array.prototype.findRoom = function(socketid) {
  for (i = 0; i < this.length; i++) {
    if (this[i] == socketid) {
      return this[i + 2];
    }
  }
}

Array.prototype.removeItem = function(a) {
  for (i = 0; i < this.length; i++) {
    if (this[i] == a) {
      for (i2 = i; i2 < this.length - 1; i2++) {
        this[i2] = this[i2 + 1];
      }
      this.length = this.length - 1
      return;
    }
  }
}

function removeFromRoom(socketid) {
  action(socketid, 0, 0, "removeUser");
}

function action(socketid, name, room, action) {

  // create a list of users... i had something planned but my mind is terrible at remembering what i was going to do but it'll eventually come back to me. 96.5% positive it had to do with identity matching so i wouldn't have to constantly define the name for the room and name for the user if it wasn't valid when they submitted it.
  if (action == "createUser") {
    if (!name) {
      let name = "mr. no-name doofenshmirtz";
    }
    if (!room) {
      let room = "general";
    }
    this.users.push({
      socketid: socketid,
      name: name,
      room: room
    });
    console.log(this.users);
  }
  else if (action == "pushToRoom") {
    if (!room) {
      let room = "general";
    }
    this.usersInRooms.push({
      socket: socketid,
      room: room
    });
    console.log(this.usersInRooms);
  }
  else if (action == "getName") {
    return this.users.findName(socketid);
  }
  else if (action == "getRoom") {
    return this.users.findRoom(socketid);
  }
  else if (action == "removeUser") {
    this.usersInRooms.removeItem(socketid);
    this.users.removeItem(socketid);
    console.log("[REMOVED USER]: " + this.users.findName(socketid))
  }
}




io.on('connection', function(socket) {
  // client joins
  socket.on('joined', function(data) {
    var rooms = this.rooms;

    // if room had an invalid name, join them to the fallback room
    if (!data.room) {
      io.to(socket.id).emit('roomNoName');
      data.room = "general";
    }

    // if the name was invalid, call then mr. no-name doofenshmirtz.

    // why didn't i put dr. no-name doofenshmirtz???
    if (!data.name) {
      data.name = "mr. no-name doofenshmirtz";
    }

    action(socket.id, data.name, data.room, "createUser");
    action(socket.id, 0, data.room, "pushToRoom");

    // if the rooms (this.rooms) array does not have the room that the user just joined, append it.
    // if (!rooms.includes(data.room)) {
    //   // push room to room list for the room module
    //   rooms.push(data.room);
    // }
    // join the client to the room
    socket.join(data.room);
    console.log(data.name + " joined " + data.room);
    io.to(socket.id).emit('infoUpdate', { name: data.name, room: data.room });

    // update room name for the user that joined
    io.to(socket.id).emit('roomConnection', { room: data.room });

    // emit joined status to clients in the room they joined
    io.to(data.room).emit('joined', { name: data.name, room: data.room, clients: io.sockets.adapter.rooms[data.room].length, totalclients: io.engine.clientsCount });

    // update client numbers
    if (io.sockets.adapter.rooms[data.room] !== undefined) {
      io.sockets.emit('updateOnline', { room: data.room, clients: io.sockets.adapter.rooms[data.room].length, totalclients: io.engine.clientsCount });
    }

  });

  socket.on('disconnect', function(socket) {
    removeFromRoom(socket.id);
  });

  socket.on('send', function(data) {
    if (!data.room) {
      data.room = "general";
    }
    if (!data.name) {
      data.name = "dr. no-name doofenshmirtz";
    }
    console.log(data);
    io.sockets.to(data.room).emit('send', data);
    // messages div to scroll to bottom
    var msgsDiv = document.getElementById("messages");
    msgsDiv.scrollTop = msgsDiv.scrollHeight;
  });
});