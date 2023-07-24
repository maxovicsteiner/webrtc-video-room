const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: ["*"],
  },
});

const PORT = 3000;

app.use(express.static("public"));

const roomLengths = new Map();

io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  socket.on("create or join", (room) => {
    console.log("room created or joined", room);
    let numClients = roomLengths.get(room);
    if (!numClients) {
		numClients = 0;
	}
	
	roomLengths.set(room, ++numClients);
	

    console.log(room, "has", numClients, "clients");

    switch (numClients) {
      case 1:
        socket.join(room);
        socket.emit("created", room);
        break;
      case 2:
        socket.join(room);
        socket.emit("joined", room);
        break;
      default:
        socket.emit("full", room);
        break;
    }
  });

  socket.on("ready", (room) => {
    socket.broadcast.to(room).emit("ready");
  });

  socket.on("candidate", (event) => {
    socket.broadcast.to(event.room).emit("candidate", event);
  });
  
  socket.on("offer", (event) => {
	  socket.broadcast.to(event.room).emit("offer", event.sdp);
  })
  
  socket.on("answer", (event) => {
	  socket.broadcast.to(event.room).emit("answer", event.sdp);
  })
});

server.listen(PORT, () => console.log("listening on", PORT));
