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
    CurrentStage: ""
}

Amplify.configure(awsExports);

const JoinGame = () => {
    const [user, setUser] = React.useState(null);

    const [gameState, updateGameState] = React.useState(initialState)

    const [socket, setSocket] = React.useState(null);

    const [Number, updateNumber] = React.useState(null);

    const [bestTicket, updateBestTicket] = React.useState(null);

    const [Numbers, updateNumbers] = React.useState([]);

    const Books = []

    var TempNumbers = []

    var BooksForGame = []

    const getUser = async () => {
        const user = await Auth.currentAuthenticatedUser();
  
        setUser(user);
        
    }

    // Only works for First Game Right Now
    function BooksForCurrentGame (CurrentGame) {
         var Index = 0
         var StartPoint =  0
            if (gameState.SelectedPackage === "Package1") {
                Index = 3
                 if (CurrentGame != 1) {
                    Index = 3 + (CurrentGame * 12)
                    StartPoint = 3 * (CurrentGame - 1)
                }
            }
            if (gameState.SelectedPackage === "Package2") {
                Index = 6
                if (CurrentGame != 1) {
                    Index = 6 + (CurrentGame * 12)
                    StartPoint = 6 * (CurrentGame - 1)
                 }
            }
            if (gameState.SelectedPackage === "Package3") {
                Index = 9
                if (CurrentGame != 1) {
                    Index = 9 + (CurrentGame * 12)
                    StartPoint = 9 * (CurrentGame - 1)
                }
             }
             if (gameState.SelectedPackage === "Package4") {
                 Index = 12
                 if (CurrentGame != 1) {
                     Index = 12 + (CurrentGame * 12)
                     StartPoint = 12 * (CurrentGame - 1)
                 }
             }

             BooksForGame = gameState.books.slice(0, Index)

             console.log(gameState.books)
             console.log(BooksForGame)

             return BooksForGame
     }
    
    React.useEffect(() => {
        getUser();

        if (socket !== null) {
        socket.on("PlayerNextNumber", (LatestNumber) => {
            var NewNumber = LatestNumber
            TempNumbers.push(NewNumber)
            var NewNumberList = TempNumbers
            NewNumberList = NewNumberList.slice(0, NewNumberList.length)
            updateNumbers(NewNumberList)
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
            
            Books.push(AllBooks)

            updateGameState((previous) => ({...previous, books: AllBooks, formState: "WaitingForHostToStartGame"}));

            socket.emit("PlayerHasBooks");
      })

        socket.once("StartGame", () => {
            console.log("Recieved Game Start Message")

            updateGameState((previous) => ({...previous, formState: "InGame", CurrentGame: 1, CurrentStage: "FirstLine"}))
        })
    }

      }, [socket]);
     
    React.useEffect(() => {
        
        if (bestTicket !== null) {
            ClearTicketUI();
            updateTicketUI();
        }

    }, [bestTicket])

     React.useEffect(() => {
        if (gameState.books !== null & gameState.CurrentGame !== 0) {
            var GameBooks = BooksForCurrentGame(gameState.CurrentGame)

            updateGameState((previous) => ({...previous, BooksForCurrentGame: GameBooks}))

            console.log(gameState)
        }

    }, [gameState.CurrentGame]) 

    React.useEffect(() => {
        if (gameState.BooksForCurrentGame !== null & gameState.CurrentStage !== ""){

            var NewBestTicket = DetermineBestTicket(gameState.CurrentStage)
            
            updateBestTicket(NewBestTicket)
        }
    }, [Numbers], [gameState.BooksForCurrentGame])

    function ClearTicketUI () {
        var i = 1
        while (i <= 27) {
        if (document.getElementById("box" + i).innerText !== "") {
            document.getElementById("box" + i).innerText = ""
            document.getElementById("box" + i).style.backgroundColor = '#ecedf0'
        }

            i += 1
        }
    }
    function updateTicketUI () {
        var x = 0
        
        while (x < 3) {
            var y = 0
            var ElementID = ""
            while (y < 5) {
                var ArrayNumber = bestTicket[x][y]

                if (parseInt(ArrayNumber) <= 10) {
                    if (x === 0) {
                        ElementID = "box1"
                    }
                    if (x === 1) {
                        ElementID = "box10"
                    }
                    if (x === 2){
                        ElementID = "box19"
                    }
                }
                else if (parseInt(ArrayNumber) <= 20) {
                    if (x === 0) {
                        ElementID = "box2"
                    }
                    if (x === 1) {
                        ElementID = "box11"
                    }
                    if (x === 2){
                        ElementID = "box20"
                    }
                }
                else if (parseInt(ArrayNumber) <= 30) {
                    if (x === 0) {
                        ElementID = "box3"
                    }
                    if (x === 1) {
                        ElementID = "box12"
                    }
                    if (x === 2){
                        ElementID = "box21"
                    }
                }
                else if (parseInt(ArrayNumber) <= 40) {
                    if (x === 0) {
                        ElementID = "box4"
                    }
                    if (x === 1) {
                        ElementID = "box13"
                    }
                    if (x === 2){
                        ElementID = "box22"
                    }
                }
                else if (parseInt(ArrayNumber) <= 50) {
                    if (x === 0) {
                        ElementID = "box5"
                    }
                    if (x === 1) {
                        ElementID = "box14"
                    }
                    if (x === 2){
                        ElementID = "box23"
                    }
                }
                else if (parseInt(ArrayNumber) <= 60) {
                    if (x === 0) {
                        ElementID = "box6"
                    }
                    if (x === 1) {
                        ElementID = "box15"
                    }
                    if (x === 2){
                        ElementID = "box24"
                    }
                }
                else if (parseInt(ArrayNumber) <= 70) {
                    if (x === 0) {
                        ElementID = "box7"
                    }
                    if (x === 1) {
                        ElementID = "box16"
                    }
                    if (x === 2){
                        ElementID = "box25"
                    }
                }
                else if (parseInt(ArrayNumber) <= 80) {
                    if (x === 0) {
                        ElementID = "box8"
                    }
                    if (x === 1) {
                        ElementID = "box17"
                    }
                    if (x === 2){
                        ElementID = "box26"
                    }
                }
                else if (parseInt(ArrayNumber) <= 90) {
                    if (x === 0) {
                        ElementID = "box9"
                    }
                    if (x === 1) {
                        ElementID = "box18"
                    }
                    if (x === 2){
                        ElementID = "box27"
                    }
                }

                console.log(ArrayNumber)

                var i = 1

                document.getElementById(ElementID).innerText = ArrayNumber
                

                if (Numbers.includes((parseInt(ArrayNumber)))) {
                    document.getElementById(ElementID).style.backgroundColor = 'green'
                }
                y += 1
                console.log(y)
            }
            x += 1
            console.log(x)
        }
    }

    // Only works for Package 1 Currently 
    function DetermineBestTicket (Stage) {
        var ScoreArray = []

        console.log(Numbers)

        if (Stage === "FirstLine") {
         var BestTicket = gameState.BooksForCurrentGame.filter(books => {
             books.filter(tickets => {
                 var Score = 0
                 tickets.filter(lines => {
                     var i = 0
                     Score = 0
                     while (i < 5) {
                         if (Numbers.includes(parseInt(lines[i]))) {
                            Score += 1
                       }
                    i += 1
                    }
                    ScoreArray.push(Score)
                })
            })
        })
        }

        if (Stage === "DoubleLine") {
            var BestTicket = gameState.BooksForCurrentGame.filter(books => {
                books.filter(tickets => {
                    var FirstScore = 0
                    var SecondScore = 0
                    var ThirdScore = 0
                    var x = 0
    
                    while (x < 3) {
                        var i = 0
                        while (i < 5) {
                            if (Numbers.includes(parseInt(tickets[x][i]))) {
                                if (x === 0) {
                                    FirstScore += 1
                                }
                                if (x === 1) {
                                    SecondScore += 1
                                }
                                if (x === 2) {
                                    ThirdScore += 1
                                }
                            }
                          i += 1
                        }
                        x += 1
                    }

                    var OneAndTwo = FirstScore + SecondScore
                    var OneAndThree = FirstScore + ThirdScore
                    var TwoAndThree = SecondScore + ThirdScore
                    
                    var Score = Math.max(OneAndTwo, OneAndThree, TwoAndThree)
                    
                    ScoreArray.push(Score)
                })
            })
        }
        

        if (Stage === "FullHouse") {
        var BestTicket = gameState.BooksForCurrentGame.filter(books => {
            books.filter(tickets => {
                var Score = 0
                var i = 0
                var x = 0

                while (x < 3) {
                    var i = 0
                    while (i < 5) {
                        if (Numbers.includes(parseInt(tickets[x][i]))) {
                            console.log("Found A Match")
                            Score += 1
                        }
                      i += 1
                    }
                    x += 1
                }
                ScoreArray.push(Score)
                })
            })
        }

        var i = ScoreArray.indexOf(Math.max(...ScoreArray));
        
        var FirstIndex = 0
        var SecondIndex = 0

        if (Stage === "FirstLine") {
        if (i < 18) {
            FirstIndex = 0
            if (i < 3) {
                SecondIndex = 0
            }
            else if (i < 6) {
                SecondIndex = 1
            }
            else if (i < 9) {
                SecondIndex = 2
            }
            else if (i < 12) {
                SecondIndex = 3
            }
            else if (i < 15) {
                SecondIndex = 4
            }
            else if (i < 18) {
                SecondIndex = 5
            }
        }
        if (17 < i && i < 36) {
            FirstIndex = 1
            if (i < 21) {
                SecondIndex = 0
            }
            else if (i < 24) {
                SecondIndex = 1
            }
            else if (i < 27) {
                SecondIndex = 2
            }
            else if (i < 30) {
                SecondIndex = 3
            }
            else if (i < 33) {
                SecondIndex = 4
            }
            else if (i < 36) {
                SecondIndex = 5
            }
        }
        if (35 < i && i < 54) {
            FirstIndex = 2
            if (i < 39) {
                SecondIndex = 0
            }
            else if (i < 42) {
                SecondIndex = 1
            }
            else if (i < 45) {
                SecondIndex = 2
            }
            else if (i < 48) {
                SecondIndex = 3
            }
            else if (i < 51) {
                SecondIndex = 4
            }
            else if (i < 54) {
                SecondIndex = 5
            }
        }
    }
        else {
            if (i < 6) {
                FirstIndex = 0
                SecondIndex = i
            }
            
            else if (i < 12) {
                FirstIndex = 0
                if (i === 6) {
                    SecondIndex = 0
                }
                if (i === 7) {
                    SecondIndex = 1
                }
                if (i === 8) {
                    SecondIndex = 2
                }
                if (i === 9) {
                    SecondIndex = 3
                }
                if (i === 10) {
                    SecondIndex = 4
                }
                if (i === 11) {
                    SecondIndex = 5
                }
            }

            else if (i < 18) {
                FirstIndex = 0
                if (i === 12) {
                    SecondIndex = 0
                }
                if (i === 13) {
                    SecondIndex = 1
                }
                if (i === 14) {
                    SecondIndex = 2
                }
                if (i === 15) {
                    SecondIndex = 3
                }
                if (i === 16) {
                    SecondIndex = 4
                }
                if (i === 17) {
                    SecondIndex = 5
                }
            }
        }
        return gameState.BooksForCurrentGame[FirstIndex][SecondIndex]
    }

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
                        <td id="box1"></td>
                        <td id="box2"></td>
                        <td id="box3"></td>
                        <td id="box4"></td>
                        <td id="box5"></td>
                        <td id="box6"></td>
                        <td id="box7"></td>
                        <td id="box8"></td>
                        <td id="box9"></td>
                    </tr>
                
                    <tr className="table-secondary">
                        <td id="box10"></td>
                        <td id="box11"></td>
                        <td id="box12"></td>
                        <td id="box13"></td>
                        <td id="box14"></td>
                        <td id="box15"></td>
                        <td id="box16"></td>
                        <td id="box17"></td>
                        <td id="box18"></td>
                    </tr>
                
                    <tr className="table-secondary">
                            <td id="box19"></td>
                            <td id="box20"></td>
                            <td id="box21"></td>
                            <td id="box22"></td>
                            <td id="box23"></td>
                            <td id="box24"></td>
                            <td id="box25"></td>
                            <td id="box26"></td>
                            <td id="box27"></td>

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