import React from "react";
import PlayerNavBar from "./PlayerNavBar"
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn} from 'mdb-react-ui-kit';
import WebSocket from 'ws';
import { Amplify, Hub, Auth} from 'aws-amplify';
import awsExports from "../aws-exports.js";

const initialState = {
    gametojoin: "",
    books: [],
    formState: "SearchForGame",
    Package1: "",
    Package2: "",
    Package3: "",
    Package4: "",
    SelectedPackage: "",
    CurrentGame: 0,
    BooksForCurrentGame: [],
}

const intialBookobject = {
    booknum: 0,
    ticket_1: [],
    ticket_2: [],
    ticket_3: [],
    ticket_4: [],
    ticket_5: [],
    ticket_6: []
}

Amplify.configure(awsExports);

const JoinGame = () => {
    const [user, setUser] = React.useState(null);

    const [gameState, updateGameState] = React.useState(initialState)

    const [socket, setSocket] = React.useState(null);

    const [Number, updateNumber] = React.useState(null);

    const getUser = async () => {
        const user = await Auth.currentAuthenticatedUser();
  
        setUser(user);
        
    }

    console.log(socket)
    console.log(Number)
    
    React.useEffect(() => {
        getUser();

        if (gameState.CurrentGame !== 0) {
            var CurrentGame = gameState.CurrentGame
            var Index = 0
            if (gameState.SelectedPackage === "Package1") {
                Index = 4
                if (CurrentGame != 1) {
                    Index = 4 + (CurrentGame * 13)
                }
            }
            if (gameState.SelectedPackage === "Package2") {
                Index = 7
                if (CurrentGame != 1) {
                    Index = 4 + (CurrentGame * 13)
                }
            }
            if (gameState.SelectedPackage === "Package3") {
                Index = 10
                if (CurrentGame != 1) {
                    Index = 4 + (CurrentGame * 13)
                }
            }
            if (gameState.SelectedPackage === "Package4") {
                Index = 13
                if (CurrentGame != 1) {
                    Index = 4 + (CurrentGame * 13)
                }
            }
            const BooksForGame = gameState.books.slice(0, Index)
    
            updateGameState(() => ({...gameState, BooksForCurrentGame: BooksForGame}))
        }

        if (socket !== null) {
        socket.on("PlayerNextNumber", (LatestNumber) => {
            var NewNumber = LatestNumber
            console.log("Recieved a number")
            updateNumber(NewNumber)
        })

        socket.once("Packages", (arg1, arg2, arg3, arg4) => {
            arg1 = "" + arg1
            arg2 = "" + arg2
            arg3 = "" + arg3
            arg4 = "" + arg4
            updateGameState(() => ({...gameState, Package1: arg1, Package2: arg2, Package3: arg3, Package4: arg4, formState: "PurchasePackage"}))
        })

        socket.once("SendBooks", (ArrayString, HowMany) => {
            var NumberOfBooks = 0

            if (HowMany === "Package1") {
                NumberOfBooks = 3
            }
            if (HowMany === "Package2") {
                NumberOfBooks = 6
            }
            if (HowMany === "Package3") {
                NumberOfBooks = 9
            }
            if (HowMany === "Package4") {
                NumberOfBooks = 12
            }
            
            const temp = ArrayString.split(' ')
            var CurrentLine = []
            var CurrentTicket = []
            var CurrentBook = []
            var AllBooks = []
            var x = 1

            while (x < temp.length) {
              if (x != 0) {
                CurrentLine.push(temp[x])
              }
              if (x % 5 === 0) {
                CurrentTicket.push(CurrentLine)
                CurrentLine = []
                }  
    
              if (x % 15 === 0) {
                CurrentBook.push(CurrentTicket)
                CurrentTicket = []
              }
    
              if (x % 90 === 0) {
                AllBooks.push(CurrentBook)
                CurrentBook = []
              }
              x += 1
            }
            
            updateGameState((previous) => ({...previous, books: AllBooks, formState: "WaitingForHostToStartGame"}));

            socket.emit("PlayerHasBooks");
      })

        socket.once("StartGame", () => {
            console.log("Recieved Game Start Message")
            var NumberOfBooksPerGame = gameState.SelectedPackage

            if (NumberOfBooksPerGame === "Package1") {
                NumberOfBooksPerGame = "3"
            }
            if (NumberOfBooksPerGame === "Package2") {
                NumberOfBooksPerGame = "6"
            }
            if (NumberOfBooksPerGame === "Package3") {
                NumberOfBooksPerGame = "9"
            }
            if (NumberOfBooksPerGame === "Package4") {
                NumberOfBooksPerGame = "12"
            }
            updateGameState((previous) => ({...previous, formState: "InGame", CurrentGame: 1}))
        })
    }

      }, [socket], [Number]);

    const onChange = (event) => {
        event.persist();

        updateGameState(() => ({...gameState, gametojoin: event.target.value }))   
    };

    const UpdatePackageSelect = (e) => {
        e.persist();

        updateGameState(() => ({...gameState, SelectedPackage: e.target.value}))
    }

    const PackageSubmit = async () => {
        var HasBalance = false;

        var UserBalance = user.attributes['custom:balance']

        var cost = 0

        if (gameState.SelectedPackage === "Package1") {
            cost = gameState.Package1
        }

        if (gameState.SelectedPackage === "Package2") {
            cost = gameState.Package2
        }

        if (gameState.SelectedPackage === "Package3") {
            cost = gameState.Package4
        }
        
        if (gameState.SelectedPackage === "Package4") {
            cost = gameState.Package4
        }

        cost = parseInt(cost)

        if (UserBalance - cost > 0) {
            HasBalance = true
        }
        
        if (HasBalance === true) {
        socket.emit("GenerateTheBooks", gameState.SelectedPackage)
        var NewBalanceNum = UserBalance - cost 
        var NewBalanceString = "" + NewBalanceNum
        Auth.updateUserAttributes(user, {'custom:balance':NewBalanceString})
        }

        else {
        window.alert("You have insufficent funds")
        }
    }

    const JoinAGame = async() => {
        var isError = false;
        try {
            const { io } = require("socket.io-client");

            var socket = io("ws://localhost:1025/", {
            
            extraHeaders: {
                "useridtoken": user.signInUserSession.idToken.jwtToken,
                "usertype": user.attributes['custom:UserType'],
                "username": user.attributes.email,
                "roomtojoin": gameState.gametojoin
            }
        });

            setSocket(socket)
        }

        catch (err) {
            window.alert(err)
            isError = true;
        }
    }

    console.log(gameState);
    const {formState} = gameState
    
    return (
        <>
        {formState === "SearchForGame" && (
        <>
        <PlayerNavBar/>
        <div id="ConfigurationContainer">
            <MDBContainer fluid>
            <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
               <MDBCol col='12'>
                   <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
                   <h2 className="fw-bold mb-2 text-center">Enter the users name you wish to join</h2>
                       <MDBCardBody className='p-5 vw-30 d-flex flex-column'>
                       <MDBInput onChange={onChange} wrapperClass='mb-4 vw-30' name="amount" label='Username' size="lg" />
                       <MDBBtn className="mb-4" size='lg' onClick={JoinAGame} >Submit</MDBBtn>
                       </MDBCardBody>
                    </MDBCard>
                </MDBCol>
           </MDBRow>
        </MDBContainer>
        </div>
        </>
        )}
        {formState === "PurchasePackage" && (
        <>
        <PlayerNavBar/>
        <div id="Pack">
            <div id="Card1">
            <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
            <h2 className="fw-bold mb-2 text-center">Package1</h2>
                <MDBCardBody className=' vw-30 d-flex flex-column'>
                <h4 className="PackagePrice">{gameState.Package1}</h4>
                <MDBBtn className="mb-4" size='lg' value="Package1" onClick={UpdatePackageSelect}>Select</MDBBtn>
                </MDBCardBody>
                </MDBCard>
                </div>
                <div id="Card2">
            <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
            <h2 className="fw-bold mb-2 text-center">Package2</h2>
                <MDBCardBody className=' vw-30 d-flex flex-column'>
                <h4 className="PackagePrice">{gameState.Package2}</h4>
                <MDBBtn className="mb-4" size='lg' value="Package2" onClick={UpdatePackageSelect}>Select</MDBBtn>
                </MDBCardBody>
                </MDBCard>
                </div>
                <div id="Card3">
            <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
            <h2 className="fw-bold mb-2 text-center">Package3</h2>
                <MDBCardBody className='vw-30 d-flex flex-column'>
                <h4 className="PackagePrice">{gameState.Package3}</h4>
                <MDBBtn className="mb-4" size='lg' value="Package3" onClick={UpdatePackageSelect}>Select</MDBBtn>
                </MDBCardBody>
                </MDBCard>
                </div>
                <div id="Card4">
            <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
                <h2 className="fw-bold mb-2 text-center">Package4</h2>
                <MDBCardBody className=' vw-30 d-flex flex-column'>
                <h4 className="PackagePrice">{gameState.Package4}</h4>
                <MDBBtn className="mb-4" size='lg' value="Package4" onClick={UpdatePackageSelect}>Select</MDBBtn>
                </MDBCardBody>
                </MDBCard>
                </div>
                </div>
        <div id="PackageSubmit">
        <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
            <MDBCardBody className='p-5 vw-30 d-flex flex-column'>
            <MDBBtn className="mb-4" size='lg' onClick={PackageSubmit}>Submit</MDBBtn>
            </MDBCardBody>
            </MDBCard>
        </div>
        </>
        )}
        {formState === "WaitingForHostToStartGame" &&(
            <div id="WaitingForGame">
            <>
            <PlayerNavBar/>
            <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
            <MDBCardBody className='p-5 vw-30 d-flex flex-column'>     
                <h5>Waiting For Host to start the game</h5>
            </MDBCardBody>
            </MDBCard>
            </>
            </div>
        )}
        {formState === "InGame" && (
            <>
            <PlayerNavBar/>
            <section class="text-center">

          <div class="rows">
            <div class="col-lg-4 col-md-12 mb-4">
              <div class="card">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
                </div>
                <div class="game-card-body">
                  <p class="card-text">
                    Some quick example text to build on the card title and make up the bulk of the
                    card's content.
                  </p>
                </div>
              </div>
            </div>

            <div class="col-lg-4 col-md-6 mb-4">
              <div class="card">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
                </div>
                <div class="game-card-body">
                    <h5 id="Number">{Number}</h5>
                  

                </div>
              </div>
            </div>

            <div class="col-lg-4 col-md-6 mb-4">
              <div class="card">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
                </div>
                <div class="game-card-body">
                    <MDBBtn className="mb-4" size='lg'>Check Number </MDBBtn>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div id="Player-table">
            <table className="numtable table-bordered">
                <thead>
                    <tr>
                    </tr>
                </thead>
                <tbody>
                    <tr className="table-secondary">
                        <td id="box1">1</td>
                        <td id="box2">2</td>
                        <td id="box3">3</td>
                        <td id="box4">4</td>
                        <td id="box5">5</td>
                        <td id="box6">6</td>
                        <td id="box7">7</td>
                        <td id="box9">8</td>
                        <td id="box9">9</td>
                        <td id="box10">10</td>
                    </tr>
                
                    <tr className="table-secondary">
                        <td id="box11">11</td>
                        <td id="box12">12</td>
                        <td id="box13">13</td>
                        <td id="box14">14</td>
                        <td id="box15">15</td>
                        <td id="box16">16</td>
                        <td id="box17">17</td>
                        <td id="box18">18</td>
                        <td id="box19">19</td>
                        <td id="box20">20</td>
                    </tr>
                
                    <tr className="table-secondary">
                            <td id="box21">21</td>
                            <td id="box22">22</td>
                            <td id="box23">23</td>
                            <td id="box24">24</td>
                            <td id="box25">25</td>
                            <td id="box26">26</td>
                            <td id="box27">27</td>
                            <td id="box28">28</td>
                            <td id="box29">29</td>
                            <td id="box30">30</td>

                    </tr>
                    </tbody>
                </table>
            </div>
            </>
        )}
        </>
    )
};

export default JoinGame;