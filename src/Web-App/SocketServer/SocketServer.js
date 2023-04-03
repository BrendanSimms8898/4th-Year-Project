const { createServer } = require("http");
const { Server } = require("socket.io");
const { CognitoJwtVerifier} = require("aws-jwt-verify")
const { decomposeUnverifiedJwt } = require("aws-jwt-verify/jwt");

var isValidUser = true;
var username = null;
var usertype = null;
var AccessToken = null;
var GameToJoin = null;

const Rooms = []

const templateRoomObject = {
  roomName: "",
  roomHostSocketID: "",
  Players: [],
  Package1: 0,
  Package2: 0,
  Package3: 0,
  Package4: 0
}

function RoomObjectInstance (arg1, arg2, arg3, arg4, arg5, arg6) {
  
  const RoomObject = {
    roomName: arg1,
    roomHostSocketID: arg2,
    Players: [],
    Package1: arg3,
    Package2: arg4,
    Package3: arg5,
    Package4: arg6
  }

  return RoomObject
}

async function Verify () {
const {payload} = decomposeUnverifiedJwt(AccessToken)

var clientId = "" + payload.aud;

const verifier = CognitoJwtVerifier.create({
  userPoolId: "eu-west-1_FYm9eQUYe",
  tokenUse: "id",
  clientId: clientId
});

try {
  await verifier.verify(
    AccessToken
  );
}

catch (err) {
  console.log(err);
  isValidUser = false;
}

}


const httpServer = createServer();
const io = new Server(httpServer, {   cors: {
  origin: "*",
} });


io.on("connection", (socket) => {

  socket.emit("Hello", "World");

  Package1 = socket.handshake.headers.package1

  Package2 = socket.handshake.headers.package2

  Package3 = socket.handshake.headers.package3

  Package4 = socket.handshake.headers.package4

  username = socket.handshake.headers.username;

  usertype = socket.handshake.headers.usertype;

  AccessToken = socket.handshake.headers.useridtoken;

  RoomToJoin = socket.handshake.headers.roomtojoin
 
  Verify();

  if (isValidUser == true) {

    console.log(`connection succesful ${socket}`);

    if (usertype == "Host") {
      socket.join(username)
    
      RoomObject = RoomObjectInstance(username, socket.id, Package1, Package2, Package3, Package4);

      Rooms.push(RoomObject);


      console.log(Package1)

      console.log(RoomObject);

      console.log(Rooms);

      socket.emit("Packages", Package1, Package2, Package3, Package4);
    }

    if (usertype == "Player") {
      socket.join(roomtojoin)

      var result = Rooms.filter(room => {
        return room.roomName === roomtojoin
      })

      result.Players.append(PlayerObjectInstance(username, socket.id))
    }

  }


  else {
    socket.disconnect()
    console.log("Not a valid user connection was closed")
  }
});

io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});

io.on("disconnect", (socket) => {
  console.log("User Has Disconnected")
});

io.on("reconnect", (socket) => {
  console.log("User has rejoined")
})

io.on("get next number", (socket) => {
  //
});

io.on("generate books", (socket) => {
  //
});

io.on("validate check", (socket) => {
  //
});

io.on("check", (socket) => {
  //
});

io.on("get packages", (socket, room) => {

})

console.log("hi");

httpServer.listen(1025);