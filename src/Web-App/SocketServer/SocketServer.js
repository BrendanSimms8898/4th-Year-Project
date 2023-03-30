const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {   cors: {
  origin: "*"
} });

io.on("connection", (socket) => {
  console.log("connection started")
  username = socket.handshake.headers.user;

  console.log(user);
});

console.log("hi")
httpServer.listen(1025);