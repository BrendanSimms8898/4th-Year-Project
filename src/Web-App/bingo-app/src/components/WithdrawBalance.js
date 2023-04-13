import React from "react";
import HostNavBar from "./HostNavBar";
import PlayerNavBar from "./PlayerNavBar";
import { Amplify, Auth} from 'aws-amplify';
import awsExports from "../aws-exports.js";
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn} from 'mdb-react-ui-kit';

Amplify.configure(awsExports);

export default function WithdrawBalance (){
    var amount = null
    
    const onChange = (event) => {
        event.persist();

        var bal = event.target.value

        amount = parseInt(bal)
        
    };

    const Submit = async () => {
        const NewBalanceNum = parseInt(user.attributes['custom:balance']) - amount
        const NewBalanceString = "" + NewBalanceNum

        await Auth.updateUserAttributes(user, {'custom:balance':NewBalanceString});

        window.location.reload();
    }
    
    const [user, setUser] = React.useState(null);

    const getUser = async () => {
        const user = await Auth.currentAuthenticatedUser();
  
        setUser(user);
        
    }
    
    React.useEffect(() => {
        getUser();
      }, []);
      
    if (user != null){
        if (user.attributes['custom:UserType'] === "Host") {
    return (
    <>
    <HostNavBar/>
    <div id="PaypalPage">
        <MDBContainer fluid>
        <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
           <MDBCol col='12'>
               <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
               <h2 className="fw-bold mb-2 text-center">How much would you like to withdraw?</h2>
                   <MDBCardBody className='p-5 vw-30 d-flex flex-column'>
                   <MDBInput onChange={onChange} wrapperClass='mb-4 vw-30' name="amount" label='€' size="lg" />
                   <MDBBtn className="mb-4" size='lg' onClick={Submit}>Submit</MDBBtn>
                   </MDBCardBody>
                </MDBCard>
            </MDBCol>
       </MDBRow>
    </MDBContainer>
    </div>
    </>
    );
    }
    if(user.attributes['custom:UserType'] === "Player"){
        return (
            <>
            <PlayerNavBar/>
            <div id="PaypalPage">
        <MDBContainer fluid>
        <MDBRow className='d-flex justify-content-center align-items-center vh-30'>
           <MDBCol col='12'>
               <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
               <h2 className="fw-bold mb-2 text-center">How much would you like to withdraw?</h2>
                   <MDBCardBody className='p-5 vw-30 d-flex flex-column'>
                   <MDBInput onChange={onChange} wrapperClass='mb-4 vw-30' name="amount" label='€' size="lg" />
                   <MDBBtn className="mb-4" size='lg' onClick={Submit}>Submit</MDBBtn>
                   </MDBCardBody>
                </MDBCard>
            </MDBCol>
       </MDBRow>
    </MDBContainer>
    </div>
            </>
        )
    }
}

};

