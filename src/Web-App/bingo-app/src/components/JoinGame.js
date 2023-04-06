import React from "react";
import PlayerNavBar from "./PlayerNavBar"
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn} from 'mdb-react-ui-kit';
import WebSocket from 'ws';
import { Amplify, Hub, Auth} from 'aws-amplify';
import awsExports from "../aws-exports.js";

var socket = null;

const initialState = {
    gametojoin: "",
    books: [],
    formState: "SearchForGame",
    Package1: "",
    Package2: "",
    Package3: "",
    Package4: "",
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

    const JoinAGame = async() => {
        var isError = false;
        try {
            const { io } = require("socket.io-client");

            socket = io("ws://localhost:1025/", {
            
            extraHeaders: {
                "useridtoken": user.signInUserSession.idToken.jwtToken,
                "usertype": user.attributes['custom:UserType'],
                "username": user.attributes.email,
                "roomtojoin": gameState.gametojoin
            }
        });
        }

        catch (err) {
            window.alert(`A game does not currently exist under username: ${gameState.gametojoin}`)
            isError = true;
        }

        socket.once("Packages", (arg1, arg2, arg3, arg4) => {
            arg1 = "" + arg1
            arg2 = "" + arg2
            arg3 = "" + arg3
            arg4 = "" + arg4
            console.log(arg1)
            console.log(typeof arg1)
            updateGameState(() => ({...gameState, Package1: arg1, Package2: arg2, Package3: arg3, Package4: arg4, formState: "PurchasePackage"}))
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
            <MDBBtn className="mb-4" size='lg' >Submit</MDBBtn>
            </MDBCardBody>
            </MDBCard>
            </div>
            <div id="Card2">
        <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
        <h2 className="fw-bold mb-2 text-center">Package2</h2>
            <MDBCardBody className='p-5 w-100 d-flex flex-column'>
            <MDBBtn className="mb-4" size='lg' >Submit</MDBBtn>
            </MDBCardBody>
            </MDBCard>
            </div>
            <div id="Card3">
        <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
        <h2 className="fw-bold mb-2 text-center">Package3</h2>
            <MDBCardBody className='p-5 w-100 d-flex flex-column'>
            <MDBBtn className="mb-4" size='lg' >Submit</MDBBtn>
            </MDBCardBody>
            </MDBCard>
            </div>
            <div id="Card4">
        <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
        <h2 className="fw-bold mb-2 text-center">Package4</h2>
            <MDBCardBody className='p-5 w-100 d-flex flex-column'>
            <MDBBtn className="mb-4" size='lg' >Submit</MDBBtn>
            </MDBCardBody>
            </MDBCard>
            </div>
        </>
        )}
        </>
    )
};

export default JoinGame;