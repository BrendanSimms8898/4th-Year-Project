import React from "react";
import HostNavBar from "./HostNavBar";
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBBtn} from 'mdb-react-ui-kit';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Amplify, Auth} from 'aws-amplify';
import awsExports from "../aws-exports.js";
import {Outlet, Link} from 'react-router-dom';


Amplify.configure(awsExports);

export default function BalanceManager() {
    return(
    <div id="navcontainer">
    <>
    <HostNavBar/>
    <div id="AddBalanceContainer">
    <MDBContainer fluid>
        <MDBRow className='d-flex justify-content-center align-items-center h-100'>
            <MDBCol col='12'>
                <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px' }}>
                    <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                        <h2 className="fw-bold mb-2 text-center">Add Funds</h2>
                        <Link to="/AddBalance">
                            <MDBBtn className="mb-4 text-center w-100" size='lg' >Deposit</MDBBtn>
                        </Link>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>
        </MDBRow>
    </MDBContainer>
    </div>
    <div id="WithdrawContainer">
        <MDBContainer fluid>
            <MDBRow className='d-flex justify-content-center align-items-center h-100'>
                <MDBCol col='12'>
                    <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px' }}>
                        <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                            <h2 className="fw-bold mb-2 text-center">Withdraw Funds</h2>
                            <MDBBtn className="mb-4" size='lg'>Withdraw</MDBBtn>
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