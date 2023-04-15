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

var CurrentStage = "FirstLine"

const JoinGame = () => {
    const [user, setUser] = React.useState(null);

    const [gameState, updateGameState] = React.useState(initialState)

    const forcestate = React.useCallback(() => updateGameState({}), []);

    const [socket, setSocket] = React.useState(null);

    const [Number, updateNumber] = React.useState(null);

    const [bestTicket, updateBestTicket] = React.useState(null);

    const [Numbers, updateNumbers] = React.useState([]);

    const [WaitingNumbers, updateWaitingNumbers] = React.useState([]);

    const Books = []

    var TempNumbers = []

    const TempWaitingNumbers = []

    var BooksForGame = []

    var CheckIsValid = false

    const getUser = async () => {
        const user = await Auth.currentAuthenticatedUser();
  
        setUser(user);
        
    }

    console.log(CurrentStage)

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

            updateGameState((previous) => ({...previous, formState: "InGame", CurrentGame: 1, CurrentStage: "FirstLine"}))
        })

        socket.on("Winnings", (Amount) => {
            console.log(Amount)

            if (user !== null) {
                var AmountToBeAdded = Amount
                var NewUserBalance = parseInt(user.attributes["custom:balance"]) + parseInt(AmountToBeAdded)
                var StringNewBalance = "" + NewUserBalance
                try {
                Auth.updateUserAttributes(user, {'custom:balance':StringNewBalance})
                }
                catch (err) {
                    window.alert(err)
                }

                socket.emit("NextStage")
            }
        })

        socket.on("UpdateStage", (HowManyGames) => {
            console.log("We have updated stage")
            
            if (CurrentStage === "FirstLine") {
            CurrentStage = "DoubleLine"
            console.log(gameState)
            }

            else if (CurrentStage === "DoubleLine") {
            CurrentStage = "FullHouse"
            }
            else if (CurrentStage === "FullHouse" && HowManyGames !== gameState.CurrentGame){
            CurrentStage = "FirstLine"
            }
            else if (gameState.CurrentStage === "FullHouse" && HowManyGames === gameState.CurrentGame) {
            updateGameState(() => ({...gameState, formState: "SessionCompleted"}))
            }

            console.log(gameState)
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
        if (bestTicket !== null) {
        ClearTicketUI();
        updateTicketUI();
        updateWaitingOnNumbers(bestTicket);
        }
    }, [Number])

    React.useEffect(() => {
        console.log(WaitingNumbers)
    }, [WaitingNumbers])

    React.useEffect(() => {
        console.log("Use Effect For Current Stage Triggered")
    }, [gameState.CurrentStage])

    React.useEffect(() => {
        if (TempWaitingNumbers.length !== 0) {
        console.log("TempWaitingNumbers UseEffect Activated")
        }
    }, [TempWaitingNumbers])

    React.useEffect(() => {
        if (gameState.books !== null & gameState.CurrentGame !== 0) {
            var GameBooks = BooksForCurrentGame(gameState.CurrentGame)

            updateGameState((previous) => ({...previous, BooksForCurrentGame: GameBooks}))
        }

    }, [gameState.CurrentGame]) 

    React.useEffect(() => {
        if (Numbers.length !== 0){

            console.log(CurrentStage)

            var NewBestTicket = DetermineBestTicket(CurrentStage)
            
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

    async function CheckButton () {
        console.log(CheckIsValid)

        CheckValid()

        console.log(CheckIsValid)
        if (CheckIsValid === true){
            if (socket !== null) {
                var ArrayString = DeconstructTheBooks()
                console.log(ArrayString)
                socket.emit("Check", ArrayString, gameState.SelectedPackage, CurrentStage, gameState.CurrentGame)
            }
        }

        CheckIsValid = false
    }

    function DeconstructTheBooks () {
        var HowMany = 0;

        var i = 0

        if (gameState.SelectedPackage === "Package1") {
            HowMany = 3
        }
        if (gameState.SelectedPackage === "Package2") {
            HowMany = 6
        }
        if (gameState.SelectedPackage === "Package3") {
            HowMany = 9
        }
        if (gameState.SelectedPackage === "Package4") {
            HowMany = 12
        }

        var ArrayString = ""
        
        while (i < HowMany) {
            var x = 0
            while (x < 6) {
                var z = 0;
                while (z < 3) {
                    var a = 0
                    while (a < 5) {
                        ArrayString = ArrayString + " " + gameState.books[i][x][z][a]
                        a += 1
                    }
                    z += 1
                }
                x +=1  
            }
            i += 1
        }

        return ArrayString
    }

    function CheckValid () {
        if (CurrentStage === "FirstLine") {
        var IsBest = gameState.books.filter(books => {
            books.filter(tickets => {
                tickets.filter(lines => {
                    var i = 0
                    var Score = 0
                     while (i < 5) {
                        if (Numbers.includes(parseInt(lines[i]))) {
                            Score += 1
                       }
                    i += 1
                    }

                    if (Score === 5) {
                        CheckIsValid = true
                    }
                })
            })
        })
        }

        if (CurrentStage === "DoubleLine") {
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

                    var FirstAndSecond = FirstScore + SecondScore
                    var FirstAndThird = FirstScore + ThirdScore
                    var SecondAndThird = SecondScore + ThirdScore
                    if (FirstAndSecond === 10 || FirstAndThird === 10 || SecondAndThird === 10) {
                        CheckIsValid = true
                    }
                })
            })
        }

        if (CurrentStage === "FullHouse") {
            var BestTicket = gameState.BooksForCurrentGame.filter(books => {
                books.filter(tickets => {
                    var Score = 0
                    var i = 0
                    var x = 0
    
                    while (x < 3) {
                        var i = 0
                        while (i < 5) {
                            if (Numbers.includes(parseInt(tickets[x][i]))) {
                                Score += 1
                            }
                          i += 1
                        }
                        x += 1
                    }
                    if (Score === 15) {
                        CheckIsValid = true
                    }
                    })
                })
        }

        console.log(CheckIsValid)
    }

    function updateWaitingOnNumbers (HighestScoringTicket) {
        var LastNumber = null
        if (CurrentStage === "FirstLine") {
            var Counter = 0
            var BestTicket = HighestScoringTicket.filter(lines => {
                var score = 0
                var i = 0
                var x = 0
                Counter += 1
                while (i < 5) {
                    if (Numbers.includes(parseInt(lines[i]))) {
                        score += 1
                    }

                    if (score === 4) {
                        while (x < 5) {
                        if (!(Numbers.includes(parseInt(lines[x])))) {
                            LastNumber = parseInt(lines[x])
                        }
                        x += 1
                        }
                    }
                    i += 1
                }
            })
        }

        if (CurrentStage === "DoubleLine") {
            var FirstScore = 0
            var SecondScore = 0
            var ThirdScore = 0
            var TicketsToCheck = []
            var x = 0

            while (x < 3) {
                var i = 0
                while (i < 5) {
                    if (Numbers.includes(parseInt(HighestScoringTicket[x][i]))) {
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

            if (Score === 9) {
                if (OneAndTwo === Score) {
                    TicketsToCheck.push(HighestScoringTicket[0])
                    TicketsToCheck.push(HighestScoringTicket[1])
                }
                if (OneAndThree === Score) {
                    TicketsToCheck.push(HighestScoringTicket[0])
                    TicketsToCheck.push(HighestScoringTicket[2])
                }
                if (TwoAndThree === Score) {
                    TicketsToCheck.push(HighestScoringTicket[1])
                    TicketsToCheck.push(HighestScoringTicket[2])
                }


                x = 0
                while (x < 2) {
                    i = 0
                    while (i < 5) {
                        if (!(Numbers.includes(parseInt(TicketsToCheck[x][i])))) {
                            LastNumber = parseInt(TicketsToCheck[x][i])
                        }
                        i += 1
                    }
                    x += 1
                }
            }
        }

        if (CurrentStage === "FullHouse") {
            var score = 0
            var x = 0

            while (x < 3) {
                i = 0
                while (i < 5) {
                    if (Numbers.includes(parseInt(HighestScoringTicket[x][i]))) {
                        score += 1
                    }
                    i += 1     
                }
                x += 1
            }

            if (score === 14) {
                x = 0
                while (x < 3) {
                    i = 0
                    while (i < 5) {
                        if (!(Numbers.includes(parseInt(HighestScoringTicket[x][i])))) {
                            LastNumber = parseInt(HighestScoringTicket[x][i])
                        }
                        i += 1
                    }
                    x += 1
                }
            }
        }
    
        if (LastNumber !== null) {
        TempWaitingNumbers.push(LastNumber)

        console.log(TempWaitingNumbers)

        var TempList = TempWaitingNumbers.slice(0, TempWaitingNumbers.length)
        updateWaitingNumbers(TempList)
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


                var i = 1

                document.getElementById(ElementID).innerText = ArrayNumber
                

                if (Numbers.includes((parseInt(ArrayNumber)))) {
                    document.getElementById(ElementID).style.backgroundColor = 'green'
                }
                y += 1
            }
            x += 1
        }
    }

    function DetermineBestTicket (Stage) {
        var MaxScore = 0
        var ScoreArray = []

        if (Stage === "FirstLine") {
            MaxScore = 5
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
                MaxScore = 10
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

                    console.log(ScoreArray)
                })
                
            })
        }
        

        if (Stage === "FullHouse") {
            MaxScore = 15
        var BestTicket = gameState.BooksForCurrentGame.filter(books => {
            books.filter(tickets => {
                var Score = 0
                var i = 0
                var x = 0

                while (x < 3) {
                    var i = 0
                    while (i < 5) {
                        if (Numbers.includes(parseInt(tickets[x][i]))) {
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

        if (53 < i && i < 72) {
            FirstIndex = 3
            if (i < 57) {
                SecondIndex = 0
            }
            else if (i < 60) {
                SecondIndex = 1
            }
            else if (i < 63) {
                SecondIndex = 2
            }
            else if (i < 66) {
                SecondIndex = 3
            }
            else if (i < 69) {
                SecondIndex = 4
            }
            else if (i < 72) {
                SecondIndex = 5
            }
        }
        if (71 < i && i < 90) {
            FirstIndex = 4
            if (i < 75) {
                SecondIndex = 0
            }
            else if (i < 78) {
                SecondIndex = 1
            }
            else if (i < 81) {
                SecondIndex = 2
            }
            else if (i < 84) {
                SecondIndex = 3
            }
            else if (i < 87) {
                SecondIndex = 4
            }
            else if (i < 90) {
                SecondIndex = 5
            }
        }
        if (89 < i && i < 108) {
            FirstIndex = 5
            if (i < 93) {
                SecondIndex = 0
            }
            else if (i < 96) {
                SecondIndex = 1
            }
            else if (i < 99) {
                SecondIndex = 2
            }
            else if (i < 102) {
                SecondIndex = 3
            }
            else if (i < 105) {
                SecondIndex = 4
            }
            else if (i < 108) {
                SecondIndex = 5
            }
        }
        if (107 < i && i < 126) {
            FirstIndex = 6
            if (i < 111) {
                SecondIndex = 0
            }
            else if (i < 114) {
                SecondIndex = 1
            }
            else if (i < 117) {
                SecondIndex = 2
            }
            else if (i < 120) {
                SecondIndex = 3
            }
            else if (i < 123) {
                SecondIndex = 4
            }
            else if (i < 126) {
                SecondIndex = 5
            }
        }
        if (125 < i && i < 144) {
            FirstIndex = 7
            if (i < 129) {
                SecondIndex = 0
            }
            else if (i < 132) {
                SecondIndex = 1
            }
            else if (i < 135) {
                SecondIndex = 2
            }
            else if (i < 138) {
                SecondIndex = 3
            }
            else if (i < 141) {
                SecondIndex = 4
            }
            else if (i < 144) {
                SecondIndex = 5
            }
        }
        if (143 < i && i < 162) {
            FirstIndex = 8
            if (i < 147) {
                SecondIndex = 0
            }
            else if (i < 150) {
                SecondIndex = 1
            }
            else if (i < 153) {
                SecondIndex = 2
            }
            else if (i < 156) {
                SecondIndex = 3
            }
            else if (i < 159) {
                SecondIndex = 4
            }
            else if (i < 162) {
                SecondIndex = 5
            }
        }
        if (161 < i && i < 180) {
            FirstIndex = 9
            if (i < 165) {
                SecondIndex = 0
            }
            else if (i < 168) {
                SecondIndex = 1
            }
            else if (i < 171) {
                SecondIndex = 2
            }
            else if (i < 174) {
                SecondIndex = 3
            }
            else if (i < 177) {
                SecondIndex = 4
            }
            else if (i < 180) {
                SecondIndex = 5
            }
        }
        if (179 < i && i < 198) {
            FirstIndex = 10
            if (i < 183) {
                SecondIndex = 0
            }
            else if (i < 186) {
                SecondIndex = 1
            }
            else if (i < 189) {
                SecondIndex = 2
            }
            else if (i < 192) {
                SecondIndex = 3
            }
            else if (i < 195) {
                SecondIndex = 4
            }
            else if (i < 198) {
                SecondIndex = 5
            }
        }
        if (197 < i && i < 216) {
            FirstIndex = 11
            if (i < 201) {
                SecondIndex = 0
            }
            else if (i < 204) {
                SecondIndex = 1
            }
            else if (i < 207) {
                SecondIndex = 2
            }
            else if (i < 210) {
                SecondIndex = 3
            }
            else if (i < 213) {
                SecondIndex = 4
            }
            else if (i < 216) {
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
                FirstIndex = 1
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
                FirstIndex = 2
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
            else if (i < 24) {
                FirstIndex = 3
                if (i === 18) {
                    SecondIndex = 0
                }
                if (i === 19) {
                    SecondIndex = 1
                }
                if (i === 20) {
                    SecondIndex = 2
                }
                if (i === 21) {
                    SecondIndex = 3
                }
                if (i === 22) {
                    SecondIndex = 4
                }
                if (i === 23) {
                    SecondIndex = 5
                }
            }
            else if (i < 30) {
                FirstIndex = 4
                if (i === 24) {
                    SecondIndex = 0
                }
                if (i === 25) {
                    SecondIndex = 1
                }
                if (i === 26) {
                    SecondIndex = 2
                }
                if (i === 27) {
                    SecondIndex = 3
                }
                if (i === 28) {
                    SecondIndex = 4
                }
                if (i === 29) {
                    SecondIndex = 5
                }
            }
            else if (i < 36) {
                FirstIndex = 5
                if (i === 30) {
                    SecondIndex = 0
                }
                if (i === 31) {
                    SecondIndex = 1
                }
                if (i === 32) {
                    SecondIndex = 2
                }
                if (i === 33) {
                    SecondIndex = 3
                }
                if (i === 34) {
                    SecondIndex = 4
                }
                if (i === 35) {
                    SecondIndex = 5
                }
            }
            else if (i < 42) {
                FirstIndex = 6
                if (i === 36) {
                    SecondIndex = 0
                }
                if (i === 37) {
                    SecondIndex = 1
                }
                if (i === 38) {
                    SecondIndex = 2
                }
                if (i === 39) {
                    SecondIndex = 3
                }
                if (i === 40) {
                    SecondIndex = 4
                }
                if (i === 41) {
                    SecondIndex = 5
                }
            }
            else if (i < 48) {
                FirstIndex = 7
                if (i === 42) {
                    SecondIndex = 0
                }
                if (i === 43) {
                    SecondIndex = 1
                }
                if (i === 44) {
                    SecondIndex = 2
                }
                if (i === 45) {
                    SecondIndex = 3
                }
                if (i === 46) {
                    SecondIndex = 4
                }
                if (i === 47) {
                    SecondIndex = 5
                }
            }
            else if (i < 54) {
                FirstIndex = 8
                if (i === 48) {
                    SecondIndex = 0
                }
                if (i === 49) {
                    SecondIndex = 1
                }
                if (i === 50) {
                    SecondIndex = 2
                }
                if (i === 51) {
                    SecondIndex = 3
                }
                if (i === 52) {
                    SecondIndex = 4
                }
                if (i === 53) {
                    SecondIndex = 5
                }
            }
            else if (i < 60) {
                FirstIndex = 9
                if (i === 54) {
                    SecondIndex = 0
                }
                if (i === 55) {
                    SecondIndex = 1
                }
                if (i === 56) {
                    SecondIndex = 2
                }
                if (i === 57) {
                    SecondIndex = 3
                }
                if (i === 58) {
                    SecondIndex = 4
                }
                if (i === 59) {
                    SecondIndex = 5
                }
            }
            else if (i < 66) {
                FirstIndex = 10
                if (i === 60) {
                    SecondIndex = 0
                }
                if (i === 61) {
                    SecondIndex = 1
                }
                if (i === 62) {
                    SecondIndex = 2
                }
                if (i === 63) {
                    SecondIndex = 3
                }
                if (i === 64) {
                    SecondIndex = 4
                }
                if (i === 65) {
                    SecondIndex = 5
                }
            }
            else if (i < 72) {
                FirstIndex = 11
                if (i === 66) {
                    SecondIndex = 0
                }
                if (i === 67) {
                    SecondIndex = 1
                }
                if (i === 68) {
                    SecondIndex = 2
                }
                if (i === 69) {
                    SecondIndex = 3
                }
                if (i === 70) {
                    SecondIndex = 4
                }
                if (i === 71) {
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
                    <MDBBtn className="mb-4" size='lg' onClick={CheckButton}>Check Number </MDBBtn>
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