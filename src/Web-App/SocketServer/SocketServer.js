const { createServer } = require("http");
const { Server } = require("socket.io");
const { CognitoJwtVerifier} = require("aws-jwt-verify")
const { decomposeUnverifiedJwt } = require("aws-jwt-verify/jwt");

var isValidUser = true;

const Rooms = []

const templateRoomObject = {
  roomName: "",
  roomHostSocketID: "",
  Players: [],
  Package1: 0,
  Package2: 0,
  Package3: 0,
  Package4: 0,
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
  }

  return RoomObject
}

function PlayerObjectInstance (arg1, arg2) {
const PlayerObject = {
  username: arg1,
  socketID: arg2,
  Books: false
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
  maxHttpBufferSize: 1e8,  
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

  SocketID = socket.id
 
  Verify();

  if (isValidUser == true) {

    console.log(`connection succesful ${socket}`);

    if (usertype == "Host") {      
      var result = Rooms.filter(room => {
        return room.roomName === username
      });

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

    }

    if (usertype == "Player") {
      var room_exists = false

      var result = Rooms.filter(room => {
        if (room.roomName === RoomToJoin) {
          room_exists = true
        }
      })

      if (room_exists === false) {
        socket.disconnect(true)
      }

      else {
        socket.join(RoomToJoin)
      }

      var result = Rooms.filter(room => {
        if (room.roomName === RoomToJoin){
          if (room.Players.length != 0) {
            room.Players.filter(player => {
              if (player.username === username) {
                player.socketID = SocketID
              }
              else {
                room.Players.push(PlayerObjectInstance(username, SocketID))
              }
            })
          }
          else {
            room.Players.push(PlayerObjectInstance(username, SocketID))
          }
        }

        console.log(room.Players[0])
        if (room.Players.length >= 1) {
          console.log(room.Players[1]);
        }
      })

      var Package1 = Rooms.filter(room => {
        if (room.roomName === RoomToJoin) {
          socket.emit("Packages", room.Package1, room.Package2, room.Package3, room.Package4);
        }
      })

    }
    console.log(Rooms)
  }
  
  else {
    console.log("Not a valid user connection was closed")
    socket.disconnect()
  }

    socket.on("disconnect", () => {
    console.log("User Has Disconnected")
  
    if (socket.handshake.headers.usertype === "Player") {
  
      Rooms.filter(room => {
        if(room.roomName === socket.handshake.headers.roomtojoin) {
        room.Players.filter(player => {
        if (player.username === socket.handshake.headers.username) {
          player.socketID = ""
        }
      })   
    }
    console.log(room.Players[0])
      if (room.Players.length >= 1) {
      console.log(room.Players[1])
    }
  })
    }
  
    if (socket.handshake.headers.usertype == "Host") {
      var result = Rooms.filter(room => {
        if (room.roomName === socket.handshake.headers.username) {
          if(room.roomHostSocketID === socket.id) {
            room.roomHostSocketID = ""
            io.to(room.roomName).emit("Host Has Disconnected Please wait while he reconnects")
          }
        }
      });
    }

    console.log(Rooms)
  });

    socket.on("GenerateTheBooks", (arg1) => {
      if (usertype == "Player") {
        var HostSocket = Rooms.filter(room => {
          if (room.roomName === socket.handshake.headers.roomtojoin) {
              var HostSocket = room.roomHostSocketID
              var PlayerSocket = socket.id
              console.log(arg1)
              socket.to(HostSocket).emit("GenerateBooks", arg1, PlayerSocket)
          }
        })
      }
    });

    socket.on("SendBooks", (ArrayString, PlayerSocket, HowMany) => {
      if (socket.handshake.headers.usertype === "Host") {
        socket.to(PlayerSocket).emit("SendBooks", ArrayString, HowMany)
      }
    });

    socket.on("PlayerHasBooks", () => {
      if (socket.handshake.headers.usertype === "Player") {
        var result = Rooms.filter(room => {
          if (room.roomName === socket.handshake.headers.roomtojoin) {
            var HostSocket = room.roomHostSocketID
          }
          var player = room.Players.filter(player => {
            if (player.username === socket.handshake.headers.username) {
              player.Books = true
              var playerBooks = player.Books
              var playerusername = player.username
              console.log("Sending Player Message")
              socket.to(HostSocket).emit("AddPlayer", playerBooks, playerusername)
            }
          })
        })
      }
    });


    socket.on("GameStart", () => {
    if (socket.handshake.headers.usertype === "Host") {
      var result = Rooms.filter(room => {
        if (socket.handshake.headers.username === room.roomName) {
        var Room = room.roomName
        
        console.log("Game Starting")
        io.to(Room).emit("StartGame")
      }
    })
    }
  });


    socket.on("NextNumber", (Number) => {
      if (socket.handshake.headers.usertype === "Host") {
      var result = Rooms.filter(room => {
        if (room.roomName === socket.handshake.headers.username) {
          var room = room.roomName
          console.log("Sending Number")
          console.log(Number)
          io.to(room).emit("PlayerNextNumber", Number)
        }
    })
    }
  });
})
  // Socket.on("Check"), () => {
  //  
  //}

  // Socket.on("EndGame"), () => {
  //
  //}

  // Socket.on("EndSession"), () => {
  //
  //}


io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});

console.log("hi");

httpServer.listen(1025);

