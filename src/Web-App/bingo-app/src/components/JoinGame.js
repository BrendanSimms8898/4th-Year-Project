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

    const getUser = async () => {
        const user = await Auth.currentAuthenticatedUser();
  
        setUser(user);
        
    }
    
    React.useEffect(() => {
        getUser();
      }, []);

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
            
            updateGameState(() => ({...gameState, books: AllBooks, formState: "WaitingForHostToStartGame"}))
      })
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
            <MDBRow className='d-flex justify-content-center align-items-center h-100'>
               <MDBCol col='12'>
                   <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
                   <h2 className="fw-bold mb-2 text-center">Enter the users name you wish to join</h2>
                       <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                       <MDBInput onChange={onChange} wrapperClass='mb-4 w-100' name="amount" label='Username' size="lg" />
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
        <div id="Card1">
        <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
        <h2 className="fw-bold mb-2 text-center">Package1</h2>
            <MDBCardBody className='p-5 w-100 d-flex flex-column'>
            <h4 className="PackagePrice">{gameState.Package1}</h4>
            <MDBBtn className="mb-4" size='lg' value="Package1" onClick={UpdatePackageSelect}>Select</MDBBtn>
            </MDBCardBody>
            </MDBCard>
            </div>
            <div id="Card2">
        <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
        <h2 className="fw-bold mb-2 text-center">Package2</h2>
            <MDBCardBody className='p-5 w-100 d-flex flex-column'>
            <h4 className="PackagePrice">{gameState.Package2}</h4>
            <MDBBtn className="mb-4" size='lg' value="Package2" onClick={UpdatePackageSelect}>Select</MDBBtn>
            </MDBCardBody>
            </MDBCard>
            </div>
            <div id="Card3">
        <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
        <h2 className="fw-bold mb-2 text-center">Package3</h2>
            <MDBCardBody className='p-5 w-100 d-flex flex-column'>
            <h4 className="PackagePrice">{gameState.Package3}</h4>
            <MDBBtn className="mb-4" size='lg' value="Package3" onClick={UpdatePackageSelect}>Select</MDBBtn>
            </MDBCardBody>
            </MDBCard>
            </div>
            <div id="Card4">
        <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
            <h2 className="fw-bold mb-2 text-center">Package4</h2>
            <MDBCardBody className='p-5 w-100 d-flex flex-column'>
            <h4 className="PackagePrice">{gameState.Package4}</h4>
            <MDBBtn className="mb-4" size='lg' value="Package4" onClick={UpdatePackageSelect}>Select</MDBBtn>
            </MDBCardBody>
            </MDBCard>
            </div>
        <div id="PackageSubmit">
        <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
            <MDBCardBody className='p-5 w-100 d-flex flex-column'>
            <MDBBtn className="mb-4" size='lg' onClick={PackageSubmit}>Submit</MDBBtn>
            </MDBCardBody>
            </MDBCard>
        </div>
        </>
        )}
        </>
    )
};

export default JoinGame;