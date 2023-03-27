import React from "react";
import { MDBBtn, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput} from 'mdb-react-ui-kit';
import { Amplify, Hub, Auth} from 'aws-amplify';
import HostNavBar from "./HostNavBar";
import awsExports from "../aws-exports.js";

Amplify.configure(awsExports);

const initialGameState = {
    currentGame: 0,
    numberOfGames: 0,
    CurrentPrizeSL: 0,
    CurrentPrizeDL: 0,
    CurrentPrizeFH: 0,
    TotalCost: 0,
    games: [],
    configurationStage: "HowManyGames"
}

function HostGame () {

    var TotalCost = 0;

    const [user, setUser] = React.useState(null);

    const [gameState, updateGameState] = React.useState(initialGameState);

    const [isConfigured, updateIsConfigured] = React.useState(localStorage.getItem("isConfigured"))

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
    }

    React.useEffect(() => {
      getUser();
      ConfigurationSet();
    }, []);

    const onChange = (e) => {
        e.persist();
        updateGameState(() => ({ ...gameState, [e.target.name]: e.target.value}));
    };

    const onPrizeMoneyChange = (e) => {
        e.persist();
        console.log(e);
        if (!isNaN(e.target.value)) {
        const target = e.target.name;
        const index = e.target.attributes.getNamedItem('index').value;
        console.log(index)
        games[index][target] = e.target.value;

        updateGameState(() => ({...gameState, games: games}))
    }
    };

    const setNumberOfGames = async () => {
        const {numberOfGames} = gameState

        if (!isNaN(numberOfGames) && numberOfGames < 20 && numberOfGames != "") {

                var i = 1
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
        
        console.log(gameState);
    }

    const setPrizeMoney = async () => { 
        const {numberOfGames} = gameState
        var i = 0;


        while (i < numberOfGames) {
        var FirstLine = gameState.games[i]["PrizeFL"]
        FirstLine = parseInt(FirstLine);
        var SecondLine = gameState.games[i]["PrizeDL"]
        SecondLine = parseInt(SecondLine)
        var ThirdLine = gameState.games[i]["PrizeFH"]
        ThirdLine  = parseInt(ThirdLine)

        var PageCost = FirstLine + SecondLine + ThirdLine;

        TotalCost += PageCost

        i+=1;

        }

        if (user.attributes['custom:balance'] < TotalCost) {
            window.alert("You don't have enough balance to host this game ensure the total prize money is not greater than your balance")
        }

        else {
            var NewBalanceNum = parseInt(user.attributes["custom:balance"]) - TotalCost

            updateGameState(() => ({...gameState, TotalCost: TotalCost}))

            var NewBalanceString = "" + NewBalanceNum

            console.log(NewBalanceString);

           await Auth.updateUserAttributes(user, {'custom:balance':NewBalanceString});

            updateGameState(() => ({...gameState, configurationStage: "SetPricing"}));
        }
    }
    

    const {configurationStage} = gameState;
    const {games} = gameState

    console.log(games);

    if (isConfigured == "true") {
    return <h1> Configured </h1>
    }
    return (
    <>  
    {configurationStage === "HowManyGames" && (
    <>
                    <HostNavBar />
                        <div id="ConfigurationContainer">
                        <MDBContainer fluid>
                            <MDBRow className='d-flex justify-content-center align-items-center h-100'>
                                <MDBCol col='12'>
                                    <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px' }}>
                                        <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                                            <h2 className="fw-bold mb-2 text-center">How Many Games?</h2>
                                            <MDBInput wrapperClass='mb-4 w-100' onChange={onChange} name="numberOfGames" label='How Many games would you like' id='formControlLg' type='numberOfGames' size="lg" />
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
            <div id="PrizeMoneyConfiguration">
            <MDBContainer fluid>
            <MDBRow className='d-flex justify-content-center align-items-center h-100'>
                <MDBCol col='12'>
                    <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
                    <MDBCardBody className='p-5 w-100 d-flex flex-column'>     
                        <h2 className="fw-bold mb-2 text-center">Please Set your Prize Money for Each individual game</h2>
                    </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
            </MDBContainer>
            </div>
            {games.map((game, index) => {
                return (
    <div key={index} id="PrizeMoneyConfiguration">
    <MDBContainer fluid>
        <MDBRow className='d-flex justify-content-center align-items-center h-100'>
           <MDBCol col='12'>
               <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
                   <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                    <h2 key={games.gamename} className="fw-bold mb-2 text-center">{game.gamename}</h2>
                   <MDBInput  wrapperClass='mb-4 w-100' onChange={onPrizeMoneyChange} name="PrizeFL" label='Single Line Prize Money?' id='formControlLg' index={index} size="lg" />
                   <MDBInput  wrapperClass='mb-4 w-100' onChange={onPrizeMoneyChange} name="PrizeDL" label='Double Line Prize Money?' id='formControlLg' index={index} size="lg" />
                   <MDBInput  wrapperClass='mb-4 w-100' onChange={onPrizeMoneyChange} name="PrizeFH" label='Full House Prize Money?' id='formControlLg' index={index} size="lg" />
                   </MDBCardBody>
                </MDBCard>
            </MDBCol>
       </MDBRow>
    </MDBContainer>
    </div>
        );
                })}
    <div id="PrizeMoneyConfiguration">
        <MDBContainer fluid>
            <MDBRow className='d-flex justify-content-center align-items-center h-100'>
                <MDBCol col='12'>
                    <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
                    <MDBCardBody className='p-5 w-100 d-flex flex-column'>     
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
        <h2> You are at the Pricing Stage </h2>
        </>
    )}
    </>

    )
};

export default HostGame;