import React from "react";
import { MDBBtn, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput} from 'mdb-react-ui-kit';
import { Amplify, Hub, Auth} from 'aws-amplify';
import HostNavBar from "./HostNavBar";
import awsExports from "../aws-exports.js";
import HorizontalScroll from 'react-horizontal-scrolling'
import WebSocket from 'ws';
import { Button } from "@mui/material";
import axios from 'axios'
import zIndex from "@mui/material/styles/zIndex";

Amplify.configure(awsExports);

const initialGameState = {
    currentGame: 0,
    numberOfGames: 0,
    CurrentPrizeSL: 0,
    CurrentPrizeDL: 0,
    CurrentPrizeFH: 0,
    TotalCost: 0,
    games: [],
    configurationStage: "HowManyGames",
    Package1: 0,
    Package2: 0,
    Package3: 0,
    Package4: 0,
    TotalSpend: 0,
}

const numbers = []

const Players = []



function HostGame () {
    var TotalCost = 0;

    const [user, setUser] = React.useState(null);

    const [gameState, updateGameState] = React.useState(initialGameState);

    const [isConfigured, updateIsConfigured] = React.useState(localStorage.getItem("isConfigured"))

    const [isWebSocket, updateIsWebsocket] = React.useState(null);

    const Books = []

    const PermBooks = []

    const [PlayersInSession, updatePlayersInSession] = React.useState([])

    const [Numbers, updateNumbers] = React.useState([])

    const getUser = async () => {
      const user = await Auth.currentAuthenticatedUser();

      setUser(user);
    }

    function SetGameObject (name) {
        const currentGameObject = {
            gamename: name,
            PrizeFL: "",
            PrizeDL: "",
            PrizeFH: ""
        }

        return currentGameObject
    }
    
    const ConfigurationSet = async () => {
        updateIsConfigured(localStorage.getItem("isConfigured"));

        console.log(isConfigured);

        if (localStorage.getItem("isConfigured") == "true") {
        }
    }

    if (gameState.configurationStage == "GameStart" && isWebSocket == null) {
        const { io } = require("socket.io-client");

        const socket = io("ws://localhost:1025/", {
            extraHeaders: {
                "useridtoken": user.signInUserSession.idToken.jwtToken,
                "usertype": user.attributes['custom:UserType'],
                "username": user.attributes.email,
                "package1": gameState.Package1,
                "package2": gameState.Package2,
                "package3": gameState.Package3,
                "package4": gameState.Package4,
              }
        });

        updateIsWebsocket(socket);
    }

    function ArrayToString(arg1, Books) {
        var HowMany = 0;

        var i = 0

        if (arg1 === "Package1") {
            HowMany = 3
            HowMany = HowMany * gameState.games.length
        }
        if (arg1 === "Package2") {
            HowMany = 6
            HowMany = HowMany * gameState.games.length
        }
        if (arg1 === "Package3") {
            HowMany = 9
            HowMany = HowMany * gameState.games.length
        }
        if (arg1 === "Package4") {
            HowMany = 12
            HowMany = HowMany * gameState.games.length
        }
        
        console.log(Books)

        var ArrayString = ""
        
        while (i < HowMany) {
            var x = 0
            while (x < 6) {
                var z = 0;
                while (z < 3) {
                    var a = 0
                    while (a < 5) {
                        ArrayString = ArrayString + " " + Books[0][i][x][z][a]
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

    function WhatNumberWhatChanges (Number) {
        var i = 1
        var ballGraphicElement = document.getElementById('ballGraphic')
        var ballGraphicText = document.getElementById('ballText')

        console.log(Numbers.length)

        console.log(gameState.currentGame)
        
        console.log(Number)

        if (numbers.length === 0 && gameState.currentGame !== 1) {
            var x = 1
            
            while (x <= 90) {
                var IDstring = "box" + x

                document.getElementById(IDstring).style.backgroundColor = ''


                x += 1
            }
        }

        while (i <= 90) {
            var IDstring = "box" + i
            if (Number === i) {
                document.getElementById(IDstring).style.backgroundColor = 'green'
            }
        i += 1
    }

    console.log(Number)
    if (Number < 10 && Number !== null){
        console.log("Im In this condition")
        ballGraphicText.className = "single"
    }
    if (Number > 10 && Number !== null){
        ballGraphicText.className = ""
    }
    if (Number === null){
        console.log("Im In the correct IF condition")
        ballGraphicElement.className = "valign-wrapper"
        ballGraphicText.className = ""
    }
    else if (Number < 18){
        console.log("Im In this condition")
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

    React.useEffect(() => {
      getUser();
      ConfigurationSet();
      if (isWebSocket != null) {
        isWebSocket.on("GenerateBooks", (Package, PlayerSocket) => {
        console.log("Recieved Books Message")
        GenerateBooks(Package).then(value => {
            Books.push(value)
            console.log(Books)

            if (Books[0] != null) {
                var ArrayString = ArrayToString(Package, Books);
            }
            
            if (ArrayString != null) {
                isWebSocket.emit("SendBooks", ArrayString, PlayerSocket, Package)
            }

            PermBooks.push(Books)

            Books.splice(0, Books.length)

            console.log(Books)
        })
    });

        isWebSocket.on("AddPlayer", (playerBook, playerUsername) => {
            console.log("Player Has Books and has joined")
            if (playerBook === true) {
                Players.push(playerUsername)
                const newList = Players.slice(0, Players.length)               
                updatePlayersInSession(newList)

                console.log(Players)
                console.log(PlayersInSession)
            }
        });

        isWebSocket.on("PlayerCheck", (PlayerSocket, BooksToCheck, SelectedPackage, Stage, Game) => {

            console.log(PlayerSocket)
            console.log(BooksToCheck)
            console.log(SelectedPackage)
            console.log(Stage)

            var NumberOfBooks = 0

            if (SelectedPackage === "Package1") {
                NumberOfBooks = 3
            }
            if (SelectedPackage === "Package2") {
                NumberOfBooks = 6
            }
            if (SelectedPackage === "Package3") {
                NumberOfBooks = 9
            }
            if (SelectedPackage === "Package4") {
                NumberOfBooks = 12
            }
            
            const temp = BooksToCheck.split(' ')
            var CurrentLine = []
            var CurrentTicket = []
            var CurrentBook = []
            var WinnerBooks = []
            var x = 1

            while (x < temp.length) {
              if (x != 0) {
                CurrentLine.push(parseInt(temp[x]))
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
                WinnerBooks.push(CurrentBook)
                CurrentBook = []
              }
              x += 1
            }

            console.log(WinnerBooks)

            var i = 0

            var Prize = 0

            if (Stage === "FirstLine") {
                console.log("Im In the First If")
                Prize = gameState.games[Game - 1]["PrizeFL"]
            }
            if (Stage === "DoubleLine") {
                Prize = gameState.games[Game - 1]["PrizeDL"]
            }
            if (Stage === "FullHouse") {
                Prize = gameState.games[Game - 1]["PrizeFH"]
            }

            console.log("Prize Money is " + Prize)

            if (isWebSocket !== null) {        
            isWebSocket.emit("Winner", Prize, PlayerSocket)
            }
        });

        isWebSocket.on("SuccesfulWinner", () =>  {
            console.log("User Wants Next Stage")

            window.alert("We are moving onto the Next Stage")

            isWebSocket.emit("UpdatePlayer", gameState.games.length)
        })

        isWebSocket.on("NextGame", (CurrentGame) => {
            if (gameState.games.length > CurrentGame) {
                console.log("Theres More Games to Play")
                CurrentGame = CurrentGame + 1

                var NewNumbersList = []

                NewNumbersList = NewNumbersList.slice(0, NewNumbersList.length)

                updateNumbers(NewNumbersList)

                numbers.splice(0, numbers.length)

                console.log(Numbers)

                WhatNumberWhatChanges(null, Numbers)

                updateGameState(() => ({...gameState, CurrentPrizeSL: gameState.games[CurrentGame - 1]["PrizeFL"], CurrentPrizeDL: gameState.games[CurrentGame - 1]["PrizeDL"], CurrentPrizeFH: gameState.games[CurrentGame - 1]["PrizeFH"], CurrentGame: CurrentGame, configurationStage: "Completed"}))
            }

            else {
                console.log("Session Is Over")

                isWebSocket.emit("EndSession")

                window.alert("The Session is Over.")
            
                window.location.reload()
            }
        })
    }
    }, [isWebSocket], [PlayersInSession], [Numbers]);

    const onChange = (e) => {
        e.persist();
        updateGameState(() => ({ ...gameState, [e.target.name]: e.target.value}));
    };

    const onPrizeMoneyChange = (e) => {
        e.persist();
        if (!isNaN(e.target.value)) {
        const target = e.target.name;
        const index = e.target.attributes.getNamedItem('index').value;
        games[index][target] = e.target.value;

        updateGameState(() => ({...gameState, games: games}))
    }
    };

    async function GenerateBooks (arg1) {
        var HowMany = 0
        var HowManyGames = gameState.numberOfGames

        if (arg1 === "Package1") {
            HowMany = 3
        }
        if (arg1 === "Package2") {
            HowMany = 6
        }
        if (arg1 === "Package3") {
            HowMany = 9
        }
        if (arg1 === "Package4") {
            HowMany = 12
        }

        console.log(HowMany)

        var x = 0
        var i = 0

        var BookContainer = []

        while (x < HowManyGames) {
            i = 0

            while (i < HowMany) {
                var tmp = await axios.get('https://2jrse7zc2ggh7fwtvuvq5ikjj40gtnfj.lambda-url.us-east-1.on.aws/') 

                BookContainer.push(tmp.data);
        
                i += 1;
            }

            x += 1
        }
        
        console.log(BookContainer)

        return BookContainer
    }

    const setNumberOfGames = async () => {
        const {numberOfGames} = gameState

        if (!isNaN(numberOfGames) && numberOfGames < 20 && numberOfGames != "" && numberOfGames != 0) {

                var i = 1

                if (games.length != 0) {
                    games.length = 0;
                }

                while (i <= numberOfGames) {
                    var gameObject = SetGameObject("Game" + i);

                    games.push(gameObject);

                    i = i + 1;
                    
                }

                updateGameState(() => ({ ...gameState, games: games}))
                updateGameState(() => ({ ...gameState, configurationStage: "WhatPrizeMoney"})) 
        }
        else {
            window.alert("Must be a valid number and must be less than 20.")
        }
        
    }

    const StartGame = async () => {
        updateGameState(() => ({ ...gameState, configurationStage: "Completed", currentGame: 1, CurrentPrizeSL: gameState.games[0]["PrizeFL"], CurrentPrizeDL: gameState.games[0]["PrizeDL"], CurrentPrizeFH: gameState.games[0]["PrizeFH"]})) 
        if (isWebSocket != null) {
        isWebSocket.emit("GameStart")
        }

        console.log(gameState)
    }

    const setPrizeMoney = async () => { 
        const {numberOfGames} = gameState
        var i = 0;
        var AllFilledIn = false;

        while (i < numberOfGames) {
        var FirstLine = gameState.games[i]["PrizeFL"]
        FirstLine = parseInt(FirstLine);
        var SecondLine = gameState.games[i]["PrizeDL"]
        SecondLine = parseInt(SecondLine)
        var ThirdLine = gameState.games[i]["PrizeFH"]
        ThirdLine  = parseInt(ThirdLine)

        var PageCost = FirstLine + SecondLine + ThirdLine;


        TotalCost += PageCost

        localStorage.setItem("TotalCost", TotalCost)


        i+=1;
        }

        if (user.attributes['custom:balance'] < TotalCost) {
            window.alert("You don't have enough balance to host this game ensure the total prize money is not greater than your balance")
        }

        else {
            var NewBalanceNum = parseInt(user.attributes["custom:balance"]) - TotalCost

            updateGameState(() => ({...gameState, TotalCost: TotalCost}))

            var NewBalanceString = "" + NewBalanceNum

           await Auth.updateUserAttributes(user, {'custom:balance':NewBalanceString});

            updateGameState(() => ({...gameState, configurationStage: "SetPricing"}));
        }
    }

    const SetPackages = async() => {
        updateGameState(() => ({...gameState, configurationStage: "GameStart"}));
        localStorage.setItem("isConfigured", "true")
    }

    const ResetConfiguration = async() => {
        localStorage.setItem("isConfigured", "false");

        var MoneyToAddToBalance = localStorage.getItem("TotalCost")
        var NewBalanceNum = 0;

        console.log(user.attributes["custom:balance"])

        NewBalanceNum = (parseInt(user.attributes["custom:balance"]) - parseInt(localStorage.getItem("TotalCost"))) + parseInt(MoneyToAddToBalance)

        console.log(NewBalanceNum);

        var NewBalanceString = "" + NewBalanceNum

        await Auth.updateUserAttributes(user, {'custom:balance': NewBalanceString})

        window.location.reload();
 

    }

    async function GetNumber () {
        const Response = await axios.get('https://ek2cght22ssiuo7t4wewmu2iba0fhtlh.lambda-url.us-east-1.on.aws/') 
        
        return Response.data
}

    function NumberAlreadyCalled(number) {
        var i = 0
        var number_already_called = false

        while (i < numbers.length) {
            if (number === numbers[i]) {
                number_already_called = true
            }

            i+=1
        }

        return number_already_called
    }
    
    async function getNextNumber() {
        var NextNumber = await GetNumber();

        while (true) {
            console.log(NextNumber)
        if (NumberAlreadyCalled(NextNumber) != false) {
            NextNumber = await GetNumber();
        }

        else {
            break
        }

        }
        console.log(numbers);

        
        numbers.push(NextNumber)
        const NewList = numbers.slice(0, numbers.length)

        updateNumbers(NewList)
        WhatNumberWhatChanges(NextNumber)

        if (isWebSocket !== null) {
        isWebSocket.emit("NextNumber", NextNumber)
        }
    }

    console.log(numbers)
    console.log(PermBooks)
          

    const {configurationStage} = gameState;
    const {games} = gameState
    const {currentGame} = gameState

    console.log(user);
    console.log(gameState);
    
    return (
    <>  
    {configurationStage === "HowManyGames" && (
    <>
                    <HostNavBar />
                        <div id="ConfigurationContainer">
                        <MDBContainer fluid>
                            <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
                                <MDBCol col='12'>
                                    <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px' }}>
                                        <MDBCardBody className='p-5 vw-30 d-flex flex-column'>
                                            <h2 className="fw-bold mb-2 text-center">How Many Games?</h2>
                                            <MDBInput wrapperClass='mb-4 vw-30' onChange={onChange} name="numberOfGames" label='How Many games would you like' id='formControlLg' type='numberOfGames' size="lg" />
                                            <MDBBtn className="mb-4" size='lg' onClick={setNumberOfGames}>Confirm Number of Games</MDBBtn>
                                        </MDBCardBody>
                                    </MDBCard>
                                </MDBCol>
                            </MDBRow>
                        </MDBContainer>
                        </div>
    </>
    )}

    {configurationStage === "WhatPrizeMoney" && (
        <>
            <HostNavBar/>
            <div id="PrizeMoneyConfigurationTitle">
            <MDBContainer fluid>
            <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
                <MDBCol col='12'>
                    <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
                    <MDBCardBody className='p-5 vw-30 d-flex flex-column'>     
                        <h2 className="fw-bold mb-2 text-center">Please Set your Prize Money for Each individual game</h2>
                    </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
            </MDBContainer>
            </div>
            <div id="PrizeMoneyConfiguration">
            <HorizontalScroll>
            {games.map((game, index) => {
                return (
    <MDBContainer fluid>
        <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
           <MDBCol col='12'>
               <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
                   <MDBCardBody className='p-5 vw-30 d-flex flex-column'>
                    <h2 key={games.gamename} className="fw-bold mb-2 text-center">{game.gamename}</h2>
                   <MDBInput  wrapperClass='mb-4 vw-30' onChange={onPrizeMoneyChange} name="PrizeFL" label='Single Line Prize Money?' id='formControlLg' index={index} size="lg" />
                   <MDBInput  wrapperClass='mb-4 vw-30' onChange={onPrizeMoneyChange} name="PrizeDL" label='Double Line Prize Money?' id='formControlLg' index={index} size="lg" />
                   <MDBInput  wrapperClass='mb-4 vw-30' onChange={onPrizeMoneyChange} name="PrizeFH" label='Full House Prize Money?' id='formControlLg' index={index} size="lg" />
                   </MDBCardBody>
                </MDBCard>
            </MDBCol>
       </MDBRow>
    </MDBContainer>
        );
                })}
    </HorizontalScroll>
    </div>
    <div id="PrizeMoneyConfigurationSubmit">
        <MDBContainer fluid>
            <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
                <MDBCol col='12'>
                    <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
                    <MDBCardBody className='p-5 vw-30 d-flex flex-column'>     
                        <MDBBtn className="mb-4" size='lg' onClick={setPrizeMoney}>Confirm Prize Money</MDBBtn>
                    </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    </div>
    </>
    )}
    {configurationStage == "SetPricing" && (
        <>
        <HostNavBar/>
        <div id="ConfigurationContainer">
        <MDBContainer fluid>
            <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
                <MDBCol col='12'>
                    <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
                    <MDBCardBody className='p-5 vw-30 d-flex flex-column'>     
                    <MDBInput  wrapperClass='mb-4 vw-30' onChange={onChange} name="Package1" label='How Much would you like Package 1 to cost?' id='formControlLg' size="lg" />
                    <MDBInput  wrapperClass='mb-4 vw-30' onChange={onChange} name="Package2" label='How Much would you like Package 2 to cost?' id='formControlLg' size="lg" />
                    <MDBInput  wrapperClass='mb-4 vw-30' onChange={onChange} name="Package3" label='How Much would you like Package 3 to cost?' id='formControlLg' size="lg" />
                    <MDBInput  wrapperClass='mb-4 vw-30' onChange={onChange} name="Package4" label='How Much would you like Package 4 to cost?' id='formControlLg' size="lg" />
                    <MDBBtn className="mb-4" size='lg' onClick={SetPackages}>Confirm Package Costs</MDBBtn>
                    </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
        </div>
        </>
    )}
    {configurationStage === "GameStart" && (
        <>
        <HostNavBar/>
        <div id="Gamestart">
        
        <div id="PlayerList">
        <MDBContainer fluid>
            <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
                <MDBCol col='12'>
                    <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '200vw'}}>
                    <MDBCardBody className='vw-50 d-flex flex-column'>
                    <div className="tableFixHead">    
                        <table className="table">
                        <thead>
                        
                            <tr class="table-light">
                            <th scope="col">#</th>
                            <th scope="col">Username</th>
                            </tr>
                        </thead>
                        <tbody>
                        
                        {PlayersInSession.map((player, index) => {
                            return (
                                <tr class="table-light">
                                <th scope="row">{index + 1}</th>
                                <td>{player}</td>
                                </tr>
                                )
                            })}
                            
                        </tbody>
                        </table>
                        </div>
                    </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
        </div>

            <section class="text-center">
                <div class="game-start-rows">
                    <div class="col-lg-4 col-md-12 mb-4">
                        <div class="card">
                        <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
                        </div>
                        <div class="game-start-card-body">
                            <MDBBtn className="mb-4" size='lg' onClick={StartGame}>Start Game</MDBBtn>
                        </div>
                    </div>
                    </div>

                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card">
                        <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 col-md-6 mb-4">
              <div class="card">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
                </div>
                <div class="game-start-card-body">
                    <MDBBtn className="mb-4" size='lg' onClick={ResetConfiguration}>Reset Configuration</MDBBtn>
                </div>
              </div>
            </div>
            </div>
            </section>
            </div>
        </>
    )}

    {configurationStage === "Completed" && (
        <>
        <HostNavBar/>
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
                  <MDBBtn className="mb-4" size='lg' onClick={getNextNumber}>Next Number</MDBBtn>

                </div>
              </div>
            </div>

            <div class="col-lg-4 col-md-6 mb-4">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
                </div>
                <div id="currentBall" class="valign-wrapper"><div id="ballGraphic" class="valign-wrapper"><span id="ballText">{Numbers[Numbers.length - 1]}</span></div><span id="callNumber"></span></div>
            </div>

          </div>
        </section>
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
					<td id="box8">8</td>
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
			
				<tr className="table-secondary">
                        <td id="box31">31</td>
						<td id="box32">32</td>
						<td id="box33">33</td>
						<td id="box34">34</td>
						<td id="box35">35</td>
						<td id="box36">36</td>
						<td id="box37">37</td>
						<td id="box38">38</td>
						<td id="box39">39</td>
                        <td id="box40">40</td>

				</tr>
			
				<tr className="table-secondary">
                        <td id="box41">41</td>
                        <td id="box42">42</td>
                        <td id="box43">43</td>
                        <td id="box44">44</td>
                        <td id="box45">45</td>
                        <td id="box46">46</td>
						<td id="box47">47</td>
						<td id="box48">48</td>
						<td id="box49">49</td>
						<td id="box50">50</td>
                </tr>
                <tr className="table-secondary">
                        <td id="box51">51</td>
						<td id="box52">52</td>
						<td id="box53">53</td>
						<td id="box54">54</td>
                        <td id="box55">55</td>
                        <td id="box56">56</td>
                        <td id="box57">57</td>
                        <td id="box58">58</td>
                        <td id="box59">59</td>
                        <td id="box60">60</td>
                </tr>
                <tr className="table-secondary">
                        <td id="box61">61</td>
						<td id="box62">62</td>
						<td id="box63">63</td>
						<td id="box64">64</td>
						<td id="box65">65</td>
						<td id="box66">66</td>
						<td id="box67">67</td>
						<td id="box68">68</td>
						<td id="box69">69</td>
                        <td id="box70">70</td>
				</tr>
			
				<tr className="table-secondary">
                        <td id="box71">71</td>
                        <td id="box72">72</td>
                        <td id="box73">73</td>
                        <td id="box74">74</td>
                        <td id="box75">75</td>
                        <td id="box76">76</td>
						<td id="box77">77</td>
						<td id="box78">78</td>
						<td id="box79">79</td>
						<td id="box80">80</td>
                </tr>
                <tr className="table-secondary">
						<td id="box81">81</td>
                        <td id="box82">82</td>
                        <td id="box83">83</td>
                        <td id="box84">84</td>
						<td id="box85">85</td>
						<td id="box86">86</td>
						<td id="box87">87</td>
                        <td id="box88">88</td>
                        <td id="box89">89</td>
                        <td id="box90">90</td>
				</tr>
                </tbody>
			</table>
        </>
    )}
    </>
    );
};

export default HostGame;