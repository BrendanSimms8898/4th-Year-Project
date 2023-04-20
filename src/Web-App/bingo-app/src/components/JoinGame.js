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

var CurrentGame = 0

var BooksForGame = []

var TempNumbersContainer = []

const JoinGame = () => {
    const [user, setUser] = React.useState(null);

    const [gameState, updateGameState] = React.useState(initialState)

    const [socket, setSocket] = React.useState(null);

    const [Number, updateNumber] = React.useState(null);

    const [bestTicket, updateBestTicket] = React.useState(null);

    const [Numbers, updateNumbers] = React.useState([]);

    const [WaitingNumbers, updateWaitingNumbers] = React.useState([]);

    const [currentGame, updateCurrentGame] = React.useState(0);

    const Books = []

    var TempBooksForGame = []

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
                    Index = 3 + ((CurrentGame - 1) * 3)
                    StartPoint = 3 * (CurrentGame - 1)
                }
            }
            if (gameState.SelectedPackage === "Package2") {
                Index = 6
                if (CurrentGame != 1) {
                    Index = 6 + ((CurrentGame - 1) * 6)
                    StartPoint = 6 * (CurrentGame - 1)
                 }
            }
            if (gameState.SelectedPackage === "Package3") {
                Index = 9
                if (CurrentGame != 1) {
                    Index = 9 + ((CurrentGame - 1) * 9)
                    StartPoint = 9 * (CurrentGame - 1)
                }
             }
             if (gameState.SelectedPackage === "Package4") {
                 Index = 12
                 if (CurrentGame != 1) {
                     Index = 12 + ((CurrentGame - 1) * 12)
                     StartPoint = 12 * (CurrentGame - 1)
                 }
             }

             TempBooksForGame = gameState.books.slice(StartPoint, Index)

             return TempBooksForGame
     }
    
    React.useEffect(() => {
        getUser();

        if (socket !== null) {
        socket.on("PlayerNextNumber", (LatestNumber) => {
            console.log(TempNumbersContainer)

            var NewNumber = LatestNumber
            TempNumbersContainer.push(NewNumber)
            const NewNumberList = TempNumbersContainer.slice(0, TempNumbersContainer.length)
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
            CurrentGame = 1
            updateCurrentGame([])
        })

        socket.on("Winnings", (Amount) => {
            console.log(Amount)
            window.alert("You Just won €" + Amount + " for winning the " + CurrentStage)

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
            if (CurrentStage === "FirstLine") {
            CurrentStage = "DoubleLine"
            window.alert("Someone has won Single Line, Now moving on to Double Line")
            updateWaitingNumbers([])
            }

            else if (CurrentStage === "DoubleLine") {
            CurrentStage = "FullHouse"
            window.alert("Someone has won Double Line, Now moving on to Full House")
            updateWaitingNumbers([])
            }

            else if (CurrentStage === "FullHouse"){
            if (socket !== null) {
                socket.emit("AdvanceGame", CurrentGame)
            }

            CurrentStage = "FirstLine"

            var TempGameNumber = CurrentGame + 1

            console.log(TempGameNumber)

            CurrentGame = 0

            CurrentGame = TempGameNumber

            if (CurrentGame <= HowManyGames) {
                window.alert("Now Moving on to Game " + CurrentGame)
            }

            updateCurrentGame(null)

            console.log(CurrentGame)
            }
        })

        socket.on("SessionOver", () => {
            socket.disconnect()

            window.alert("This Session Is over if you won your prize money has been added to your account")

            window.location.reload()
        })
    }

      }, [socket]);
     
    React.useEffect(() => {
        
        if (bestTicket !== null) {
            ClearTicketUI();
            updateTicketUI();
        }

        console.log(bestTicket)

    }, [bestTicket])

    React.useEffect(() => {
        if (bestTicket !== null && Number !== null) {
        ClearTicketUI();
        updateTicketUI();
        updateWaitingOnNumbers(BooksForGame);
        PlayAudio(Number)
        }

        console.log(Number)
    }, [Number])

    React.useEffect(() => {
        console.log(WaitingNumbers)
        updateWaitingUI();

    }, [WaitingNumbers])

    React.useEffect(() => {
        if (gameState.books !== null & CurrentGame !== 0) {
            var GameBooks = BooksForCurrentGame(CurrentGame)

            BooksForGame = GameBooks

            console.log(BooksForGame)
        }

        if (CurrentGame > 1) {
            updateNumbers([])
            updateNumber(null)
            updateBestTicket(null)
            updateWaitingNumbers([])
            TempNumbersContainer = []

            ClearTicketUI();
            ClearBallUI();
        }
    }, [currentGame]) 

    React.useEffect(() => {
        if (Numbers.length !== 0){

            console.log(BooksForGame)

            console.log(CurrentStage)

            var NewBestTicket = DetermineBestTicket(CurrentStage)
            
            updateBestTicket(NewBestTicket)

            PlayAudio(Number)
        }

        console.log(Numbers)

    }, [Numbers])

    function ClearBallUI () {
        var ballGraphicElement = document.getElementById('ballGraphic')
        var ballGraphicText = document.getElementById('ballText')
        ballGraphicElement.className = "valign-wrapper"
        ballGraphicText.className = ""
        
    }

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
                socket.emit("Check", ArrayString, gameState.SelectedPackage, CurrentStage, CurrentGame)
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
        var IsBest = BooksForGame.filter(books => {
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
            var BestTicket = BooksForGame.filter(books => {
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
            var BestTicket = BooksForGame.filter(books => {
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

    function updateWaitingOnNumbers (BooksForCurrentGame) {
        var LastNumber = []
        if (CurrentStage === "FirstLine") {
            var Counter = 0
            var BestTicket = BooksForCurrentGame.filter(books => {
                books.filter(ticket => {
                    ticket.filter( lines => {
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
                                    LastNumber.push(parseInt(lines[x]))
                                }
                                x += 1
                                }
                            }
                            i += 1
                        }
                    })
                })  
            })
        }

        if (CurrentStage === "DoubleLine") {
            var x = 0

                BooksForCurrentGame.filter(books => {
                    books.filter(tickets => {
                        var FirstScore = 0
                        var SecondScore = 0
                        var ThirdScore = 0
                        var Score = 0
                        var OneAndTwo = 0
                        var OneAndThree = 0
                        var TwoAndThree = 0
                        var TicketsToCheck = []
                x = 0
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

            OneAndTwo = FirstScore + SecondScore
            OneAndThree = FirstScore + ThirdScore
            TwoAndThree = SecondScore + ThirdScore
            
            Score = Math.max(OneAndTwo, OneAndThree, TwoAndThree)

            console.log(Score)

            if (Score === 9) {
                if (OneAndTwo === Score) {
                    TicketsToCheck.push(tickets[0])
                    TicketsToCheck.push(tickets[1])
                }
                if (OneAndThree === Score) {
                    TicketsToCheck.push(tickets[0])
                    TicketsToCheck.push(tickets[2])
                }
                if (TwoAndThree === Score) {
                    TicketsToCheck.push(tickets[1])
                    TicketsToCheck.push(tickets[2])
                }


                console.log(TicketsToCheck)

                x = 0
                while (x < 2) {
                    i = 0
                    while (i < 5) {
                        if (!(Numbers.includes(parseInt(TicketsToCheck[x][i])))) {
                            if (!(LastNumber.includes(parseInt(TicketsToCheck[x][i]))))
                            LastNumber.push(parseInt(TicketsToCheck[x][i]))
                        }
                        i += 1
                    }
                    x += 1
                }
            }

            })
        })
        }

        if (CurrentStage === "FullHouse") {
            BooksForCurrentGame.filter(books => {
                books.filter(tickets => {
                    var x = 0
                    var score = 0
            while (x < 3) {
                var i = 0
                while (i < 5) {
                    if (Numbers.includes(parseInt(tickets[x][i]))) {
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
                        if (!(Numbers.includes(parseInt(tickets[x][i])))) {
                            if (!(LastNumber.includes(parseInt(tickets[x][i])))) {
                            LastNumber.push(parseInt(tickets[x][i]))
                            }
                        }
                        i += 1
                    }
                    x += 1
                }
            }
            })
        })
        }

        if (LastNumber !== null) {
            var TempList = LastNumber.slice(0, LastNumber.length)

            console.log(TempList)
            console.log(LastNumber)

            updateWaitingNumbers(TempList)
        }
    }
    
    function updateWaitingUI() {
        var i = 0


        if (WaitingNumbers.length !== 0){
            while (i < WaitingNumbers.length){
            var waitingballGraphicElement = document.querySelectorAll("[id='waitingballGraphic']")
            var waitingballGraphicText = document.querySelectorAll("[id='waitingballText']")
            console.log(waitingballGraphicText)

                for(var x = 0; x < waitingballGraphicElement.length; x++){
                
 
                    console.log(WaitingNumbers[i])
        

                    if (WaitingNumbers[i] < 10){
                        for(var z = 0; z < waitingballGraphicText.length; z++){
                            console.log(waitingballGraphicText[z].innerText)
                            if (parseInt(waitingballGraphicText[z].innerText) < 10 ){
                                waitingballGraphicText[z].className = "single"
                            }
                            else {
                                waitingballGraphicText[z].className = ""
                            }
                        }
                    }
                    if (WaitingNumbers[i] < 18){
                        waitingballGraphicElement[x].className = "valign-wrapper blue"
        
                    }
                    else if (WaitingNumbers[i] < 36){
                        waitingballGraphicElement[x].className = "valign-wrapper green"
        
                    }
                    else if (WaitingNumbers[i] < 54){
                        waitingballGraphicElement[x].className = "valign-wrapper orange"
        
                    }
                    else if (WaitingNumbers[i] < 72){
                        waitingballGraphicElement[x].className = "valign-wrapper white"
        
                    }
                    else if (WaitingNumbers[i] < 91){
                        waitingballGraphicElement[x].className = "valign-wrapper red"
        
                    }
                    i += 1
                }
            }
            

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
                var ballGraphicElement = document.getElementById('ballGraphic')
                var ballGraphicText = document.getElementById('ballText')

                document.getElementById(ElementID).innerText = ArrayNumber
                

                if (Numbers.includes((parseInt(ArrayNumber)))) {
                    document.getElementById(ElementID).style.backgroundColor = 'green'



                    if (Number < 10){
                        ballGraphicText.className = "single"
                    }
                    if (Number > 10){
                        ballGraphicText.className = ""
                    }
                    if (Number < 18){
                        ballGraphicElement.className = "valign-wrapper blue"
                    }
                    else if (Number < 36){
                        ballGraphicElement.className = "valign-wrapper green"
                    }
                    else if (Number < 54){
                        ballGraphicElement.className = "valign-wrapper orange"
                    }
                    else if (Number < 72){
                        ballGraphicElement.className = "valign-wrapper white"
                    }
                    else if (Number < 91){
                        ballGraphicElement.className = "valign-wrapper red"
                    }

                }
                y += 1
            }
            x += 1
        }
    }

    function DetermineBestTicket (Stage) {
        var Multiplier = 0
        var ScoreArray = []

        if (gameState.SelectedPackage === "Package1") {
            Multiplier = 1
        }

        if (gameState.SelectedPackage === "Package2") {
            Multiplier = 2
        }

        if (gameState.SelectedPackage === "Package3") {
            Multiplier = 3
        }

        if (gameState.SelectedPackage === "Package4") {
            Multiplier = 4
        }

        if (Stage === "FirstLine") {
         var BestTicket = BooksForGame.filter(books => {
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
            var BestTicket = BooksForGame.filter(books => {
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
        var BestTicket = BooksForGame.filter(books => {
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

        console.log(Stage)
        console.log(BooksForGame)
        console.log(FirstIndex)
        console.log(SecondIndex)

        return BooksForGame[FirstIndex][SecondIndex]
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

    function PlayAudio (Number) {
        var AudioNumber = 1
                while (AudioNumber <= 90) {
                if (parseInt(Number) === AudioNumber) {

                    var audio = document.getElementById(`Number_${AudioNumber}_Audio`)

                    audio.play()

                    console.log(document.getElementById(`Number_${AudioNumber}_Audio`))

                }
                AudioNumber += 1
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
        <div id = "package-page">
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
            <audio src="./AudioFiles/Number_1.mp3" id="Number_1_Audio"></audio>
            <audio src="./AudioFiles/Number_2.mp3" id="Number_2_Audio"></audio>
            <audio src="./AudioFiles/Number_3.mp3" id="Number_3_Audio"></audio>
            <audio src="./AudioFiles/Number_4.mp3" id="Number_4_Audio"></audio>
            <audio src="./AudioFiles/Number_5.mp3" id="Number_5_Audio"></audio>
            <audio src="./AudioFiles/Number_6.mp3" id="Number_6_Audio"></audio>
            <audio src="./AudioFiles/Number_7.mp3" id="Number_7_Audio"></audio>
            <audio src="./AudioFiles/Number_8.mp3" id="Number_8_Audio"></audio>
            <audio src="./AudioFiles/Number_9.mp3" id="Number_9_Audio"></audio>
            <audio src="./AudioFiles/Number_10.mp3" id="Number_10_Audio"></audio>
            <audio src="./AudioFiles/Number_11.mp3" id="Number_11_Audio"></audio>
            <audio src="./AudioFiles/Number_12.mp3" id="Number_12_Audio"></audio>
            <audio src="./AudioFiles/Number_13.mp3" id="Number_13_Audio"></audio>
            <audio src="./AudioFiles/Number_14.mp3" id="Number_14_Audio"></audio>
            <audio src="./AudioFiles/Number_15.mp3" id="Number_15_Audio"></audio>
            <audio src="./AudioFiles/Number_16.mp3" id="Number_16_Audio"></audio>
            <audio src="./AudioFiles/Number_17.mp3" id="Number_17_Audio"></audio>
            <audio src="./AudioFiles/Number_18.mp3" id="Number_18_Audio"></audio>
            <audio src="./AudioFiles/Number_19.mp3" id="Number_19_Audio"></audio>
            <audio src="./AudioFiles/Number_20.mp3" id="Number_20_Audio"></audio>
            <audio src="./AudioFiles/Number_21.mp3" id="Number_21_Audio"></audio>
            <audio src="./AudioFiles/Number_22.mp3" id="Number_22_Audio"></audio>
            <audio src="./AudioFiles/Number_23.mp3" id="Number_23_Audio"></audio>
            <audio src="./AudioFiles/Number_24.mp3" id="Number_24_Audio"></audio>
            <audio src="./AudioFiles/Number_25.mp3" id="Number_25_Audio"></audio>
            <audio src="./AudioFiles/Number_26.mp3" id="Number_26_Audio"></audio>
            <audio src="./AudioFiles/Number_27.mp3" id="Number_27_Audio"></audio>
            <audio src="./AudioFiles/Number_28.mp3" id="Number_28_Audio"></audio>
            <audio src="./AudioFiles/Number_29.mp3" id="Number_29_Audio"></audio>
            <audio src="./AudioFiles/Number_30.mp3" id="Number_30_Audio"></audio>
            <audio src="./AudioFiles/Number_31.mp3" id="Number_31_Audio"></audio>
            <audio src="./AudioFiles/Number_32.mp3" id="Number_32_Audio"></audio>
            <audio src="./AudioFiles/Number_33.mp3" id="Number_33_Audio"></audio>
            <audio src="./AudioFiles/Number_34.mp3" id="Number_34_Audio"></audio>
            <audio src="./AudioFiles/Number_35.mp3" id="Number_35_Audio"></audio>
            <audio src="./AudioFiles/Number_36.mp3" id="Number_36_Audio"></audio>
            <audio src="./AudioFiles/Number_37.mp3" id="Number_37_Audio"></audio>
            <audio src="./AudioFiles/Number_38.mp3" id="Number_38_Audio"></audio>
            <audio src="./AudioFiles/Number_39.mp3" id="Number_39_Audio"></audio>
            <audio src="./AudioFiles/Number_40.mp3" id="Number_40_Audio"></audio>
            <audio src="./AudioFiles/Number_41.mp3" id="Number_41_Audio"></audio>
            <audio src="./AudioFiles/Number_42.mp3" id="Number_42_Audio"></audio>
            <audio src="./AudioFiles/Number_43.mp3" id="Number_43_Audio"></audio>
            <audio src="./AudioFiles/Number_44.mp3" id="Number_44_Audio"></audio>
            <audio src="./AudioFiles/Number_45.mp3" id="Number_45_Audio"></audio>
            <audio src="./AudioFiles/Number_46.mp3" id="Number_46_Audio"></audio>
            <audio src="./AudioFiles/Number_47.mp3" id="Number_47_Audio"></audio>
            <audio src="./AudioFiles/Number_48.mp3" id="Number_48_Audio"></audio>
            <audio src="./AudioFiles/Number_49.mp3" id="Number_49_Audio"></audio>
            <audio src="./AudioFiles/Number_50.mp3" id="Number_50_Audio"></audio>
            <audio src="./AudioFiles/Number_51.mp3" id="Number_51_Audio"></audio>
            <audio src="./AudioFiles/Number_52.mp3" id="Number_52_Audio"></audio>
            <audio src="./AudioFiles/Number_53.mp3" id="Number_53_Audio"></audio>
            <audio src="./AudioFiles/Number_54.mp3" id="Number_54_Audio"></audio>
            <audio src="./AudioFiles/Number_55.mp3" id="Number_55_Audio"></audio>
            <audio src="./AudioFiles/Number_56.mp3" id="Number_56_Audio"></audio>
            <audio src="./AudioFiles/Number_57.mp3" id="Number_57_Audio"></audio>
            <audio src="./AudioFiles/Number_58.mp3" id="Number_58_Audio"></audio>
            <audio src="./AudioFiles/Number_59.mp3" id="Number_59_Audio"></audio>
            <audio src="./AudioFiles/Number_60.mp3" id="Number_60_Audio"></audio>
            <audio src="./AudioFiles/Number_61.mp3" id="Number_61_Audio"></audio>
            <audio src="./AudioFiles/Number_62.mp3" id="Number_62_Audio"></audio>
            <audio src="./AudioFiles/Number_63.mp3" id="Number_63_Audio"></audio>
            <audio src="./AudioFiles/Number_64.mp3" id="Number_64_Audio"></audio>
            <audio src="./AudioFiles/Number_65.mp3" id="Number_65_Audio"></audio>
            <audio src="./AudioFiles/Number_66.mp3" id="Number_66_Audio"></audio>
            <audio src="./AudioFiles/Number_67.mp3" id="Number_67_Audio"></audio>
            <audio src="./AudioFiles/Number_68.mp3" id="Number_68_Audio"></audio>
            <audio src="./AudioFiles/Number_69.mp3" id="Number_69_Audio"></audio>
            <audio src="./AudioFiles/Number_70.mp3" id="Number_70_Audio"></audio>
            <audio src="./AudioFiles/Number_71.mp3" id="Number_71_Audio"></audio>
            <audio src="./AudioFiles/Number_72.mp3" id="Number_72_Audio"></audio>
            <audio src="./AudioFiles/Number_73.mp3" id="Number_73_Audio"></audio>
            <audio src="./AudioFiles/Number_74.mp3" id="Number_74_Audio"></audio>
            <audio src="./AudioFiles/Number_75.mp3" id="Number_75_Audio"></audio>
            <audio src="./AudioFiles/Number_76.mp3" id="Number_76_Audio"></audio>
            <audio src="./AudioFiles/Number_77.mp3" id="Number_77_Audio"></audio>
            <audio src="./AudioFiles/Number_78.mp3" id="Number_78_Audio"></audio>
            <audio src="./AudioFiles/Number_79.mp3" id="Number_79_Audio"></audio>
            <audio src="./AudioFiles/Number_80.mp3" id="Number_80_Audio"></audio>
            <audio src="./AudioFiles/Number_81.mp3" id="Number_81_Audio"></audio>
            <audio src="./AudioFiles/Number_82.mp3" id="Number_82_Audio"></audio>
            <audio src="./AudioFiles/Number_83.mp3" id="Number_83_Audio"></audio>
            <audio src="./AudioFiles/Number_84.mp3" id="Number_84_Audio"></audio>
            <audio src="./AudioFiles/Number_85.mp3" id="Number_85_Audio"></audio>
            <audio src="./AudioFiles/Number_86.mp3" id="Number_86_Audio"></audio>
            <audio src="./AudioFiles/Number_87.mp3" id="Number_87_Audio"></audio>
            <audio src="./AudioFiles/Number_88.mp3" id="Number_88_Audio"></audio>
            <audio src="./AudioFiles/Number_89.mp3" id="Number_89_Audio"></audio>
            <audio src="./AudioFiles/Number_90.mp3" id="Number_90_Audio"></audio>
            <section class="text-center">

          <div class="waitingrows">
            <div class="col-lg-4 col-md-12 mb-4">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
              </div>
            </div>

            <div class="col-lg-4 col-md-6 mb-4">

                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
                </div>
                <div id="currentBall" class="valign-wrapper"><div id="ballGraphic" class="valign-wrapper"><span id="ballText">{Number}</span></div><span id="callNumber"></span></div>

            </div>

            <div class="col-lg-4 col-md-6 mb-4">
              <div class="card">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
                </div>
                <div class="game-card-body">
                    <MDBBtn className="mb-4" size='lg' onClick={CheckButton}>Check</MDBBtn>
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
            <div class="rows">
            <div class="col-lg-4 col-md-12 mb-4">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
              </div>
            </div>

            <div class="col-lg-4 col-md-6 mb-4">

                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
                </div>
                <div id="waitingBall"  class="valign-wrapper">
                    {WaitingNumbers.slice(0, 4).map((num) => {
                        return(
                        <>
                        <div id="waitingballGraphic" class="valign-wrapper"><span id="waitingballText">{num}</span></div><span id="waitingcallNumber"></span>
                        </>
                        )
                        })}
                    </div>

            </div>

            <div class="col-lg-4 col-md-6 mb-4">
            </div>
          </div>
            </>

        )}

        {formState === "SessionEnd" && (
        <>
        <PlayerNavBar/>

        <h2> Game Is Over </h2>
        </>
        )}

        </>
    )

};

export default JoinGame;