const { createServer } = require("http");
const { Server } = require("socket.io");
const { CognitoJwtVerifier} = require("aws-jwt-verify")
const { decomposeUnverifiedJwt } = require("aws-jwt-verify/jwt");

var isValidUser = true;
var username = null;
var usertype = null;
var AccessToken = null;

const Rooms = []

const templateRoomObject = {
  roomName: "",
  roomHostSocketID: "",
  Players: [],
  Package1: 0,
  Package2: 0,
  Package3: 0,
  Package4: 0,
  Numbers: []
}

function RoomObjectInstance (arg1, arg2, arg3, arg4, arg5, arg6) {
  
  const RoomObject = {
    roomName: arg1,
    roomHostSocketID: arg2,
    Players: [],
    Package1: arg3,
    Package2: arg4,
    Package3: arg5,
    Package4: arg6,
    Numbers: []
  }

  return RoomObject
}

function PlayerObjectInstance (arg1, arg2) {
const PlayerObject = {
  username: arg1,
  socketID: arg2,
  Books: [],
}

return PlayerObject
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
const io = new Server(httpServer, {   
  cors: {
  origin: "*",
} });


io.on("connection", (socket) => {
  Package1 = socket.handshake.headers.package1

  Package2 = socket.handshake.headers.package2

  Package3 = socket.handshake.headers.package3

  Package4 = socket.handshake.headers.package4

  username = socket.handshake.headers.username;

  usertype = socket.handshake.headers.usertype;

  AccessToken = socket.handshake.headers.useridtoken;

  RoomToJoin = socket.handshake.headers.roomtojoin

  var SocketID = socket.id
 
  Verify();

  if (isValidUser == true) {

    console.log(`connection succesful ${socket}`);

    if (usertype == "Host") {      
      var result = Rooms.filter(room => {
        return room.roomName === username
      });

      console.log(result)

      if (result.length < 1) {
      socket.join(username)

      RoomObject = RoomObjectInstance(username, socket.id, Package1, Package2, Package3, Package4);

      Rooms.push(RoomObject);
      }

      else {
        socket.join(username)

        var result = Rooms.filter(room => {
          if (room.roomName === username) {
            room.roomHostSocketID = socket.id
          }
        });

        console.log("Host Has rejoined the room")
      }

      console.log(result);
      console.log(Rooms);
    }

    if (usertype == "Player") {
      socket.join(roomtojoin)

      var result = Rooms.filter(room => {
        if (room.roomName === roomtojoin){
          room.players.filter(player => {
            if (player.username === username) {
              player.socketID = SocketID
            }
            else {
              room.players.append(PlayerObjectInstance(username, SocketID))
            }
          })
        }
      })


      socket.emit("Packages", Package1, Package2, Package3, Package4);
    }
  }
  else {
    console.log("Not a valid user connection was closed")
    socket.close()
  }

  socket.on("disconnect", (socket) => {
    console.log("User Has Disconnected")
  
    if (usertype === "Player") {
  
      Rooms.filter(room => {
        if(room.roomName === roomtojoin) {
        result.players.filter(player => {
        if (player.username === username) {
          player.socketID = ""
        }
      })
    }})
    }
  
    if (usertype == "Host") {
      var result = Rooms.filter(room => {
        if (room.roomName === username) {
          if(room.roomHostSocketID === SocketID) {
            room.roomHostSocketID = ""

            io.to(room.roomName).emit("Host Has Disconnected Please wait while he reconnects")
          }
        }
      });
    }

    console.log(Rooms)
  });
});

io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});

io.on("getNextNumber", (socket) => {
  //
});

io.on("generateBooks", (socket) => {
  //
});

io.on("check", (socket) => {
  //
});

io.on("getPackages", (socket, room) => {
  //  
})

io.on("SelectedPackage", (socket) => {
  //
})

io.on("EndGame", (socket) => {
  //
})

io.on("EndSession", (socket) => {
  //
})

console.log("hi");

httpServer.listen(1025);