import React from "react";
import HostNavBar from "./HostNavBar";
import PlayerNavBar from "./PlayerNavBar";
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBBtn} from 'mdb-react-ui-kit';
import { Amplify, Auth} from 'aws-amplify';
import awsExports from "../aws-exports.js";
import {Link} from 'react-router-dom';


Amplify.configure(awsExports);

export default function BalanceManager() {
    const [user, setUser] = React.useState(null);

    const getUser = async () => {
        const user = await Auth.currentAuthenticatedUser();
  
        setUser(user);
        
    }
    
    React.useEffect(() => {
        getUser();
      }, []);

    
    if(user != null) {

    if (user.attributes['custom:UserType'] === "Host") {
    return(
    <div id="navcontainer">
    <>
    <HostNavBar/>
    <div id="navcontainer">
            <>
            <div id="AddBalanceContainer">
            <MDBContainer fluid>
                <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
                    <MDBCol col='12'>
                        <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px' }}>
                            <MDBCardBody className='p-5 vw-30 d-flex flex-column justify-content-center align-items-center'>
                                <h2 className="fw-bold mb-2 text-center">Add Funds</h2>
                                <Link to="/AddBalance">
                                    <MDBBtn className="mb-4 text-center vw-30" size='lg'>Deposit</MDBBtn>
                                </Link>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
            </div>
            <div id="WithdrawContainer">
                <MDBContainer fluid>
                    <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
                        <MDBCol col='12'>
                            <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px' }}>
                                <MDBCardBody className='p-5 vw-30 d-flex flex-column justify-content-center align-items-center'>
                                    <h2 className="fw-bold mb-2 text-center">Withdraw Funds</h2>
                                    <Link to="/WithdrawBalance">
                                        <MDBBtn className="mb-4 text-center vw-30" size='lg' >Withdraw</MDBBtn>
                                    </Link>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                        </MDBRow>
                    </MDBContainer>
                </div>
        
            </>
            </div>

    </>
    </div>
    )
    }

    if (user.attributes['custom:UserType'] === "Player") {
        return(
            <div id="navcontainer">
            <>
            <PlayerNavBar/>
            <div id="AddBalanceContainer">
            <MDBContainer fluid>
                <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
                    <MDBCol col='12'>
                        <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px' }}>
                            <MDBCardBody className='p-5 vw-30 d-flex flex-column justify-content-center align-items-center'>
                                <h2 className="fw-bold mb-2 text-center">Add Funds</h2>
                                <Link to="/AddBalance">
                                    <MDBBtn className="mb-4 text-center vw-30" size='lg'>Deposit</MDBBtn>
                                </Link>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
            </div>
            <div id="WithdrawContainer">
                <MDBContainer fluid>
                    <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
                        <MDBCol col='12'>
                            <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px' }}>
                                <MDBCardBody className='p-5 vw-30 d-flex flex-column justify-content-center align-items-center'>
                                    <h2 className="fw-bold mb-2 text-center">Withdraw Funds</h2>
                                    <Link to="/WithdrawBalance">
                                        <MDBBtn className="mb-4 text-center vw-30" size='lg' >Withdraw</MDBBtn>
                                    </Link>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                        </MDBRow>
                    </MDBContainer>
                </div>
        
            </>
            </div>
        )
    }
    }
}
