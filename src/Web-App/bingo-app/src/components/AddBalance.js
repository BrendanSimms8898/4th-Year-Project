import React from "react";
import HostNavBar from "./HostNavBar";
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput} from 'mdb-react-ui-kit';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Amplify, Auth} from 'aws-amplify';
import awsExports from "../aws-exports.js";

Amplify.configure(awsExports);

export default function AddBalance() {
    const [user, setUser] = React.useState(null);

    console.log(user);

    var amount = ""

    const onChange = (event) => {
        event.persist();

        var bal = event.target.value

        amount = "" + bal
        
      };

    const getUser = async () => {
        const user = await Auth.currentAuthenticatedUser();
  
        setUser(user);
        
    }
    
    React.useEffect(() => {
        getUser();
      }, []);


    return (
        <>
        <HostNavBar/>
        <div id="PaypalPage">
        <MDBContainer fluid>
        <MDBRow className='d-flex justify-content-center align-items-center h-100'>
           <MDBCol col='12'>
               <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px'}}>
               <h2 className="fw-bold mb-2 text-center">How much would you like to add?</h2>
                   <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                   <MDBInput onChange={onChange} wrapperClass='mb-4 w-100' name="amount" label='€' size="lg" />
                   </MDBCardBody>
                </MDBCard>
            </MDBCol>
       </MDBRow>
    </MDBContainer>
        <div class="Paypalcontainer">
            <div class="Paypalcenter">
        <PayPalScriptProvider options={{ "client-id": "test", currency: "EUR",}}>
            <PayPalButtons
                createOrder={(data, actions) => {
                    return actions.order.create({
                        purchase_units: [
                            {
                                amount: {
                                    value: amount,
                                },
                            },
                        ],
                    });
                }}
                onApprove={(data, actions) => {
                    return actions.order.capture().then((details) => {
                        const AmountToBeAdded = details.purchase_units[0].amount.value;
                        var UserBalance = user.attributes['custom:balance']
                        var NewUserBalance = parseInt(user.attributes["custom:balance"]) + parseInt(AmountToBeAdded)
                        var StringNewBalance = "" + NewUserBalance
                        try {
                        Auth.updateUserAttributes(user, {'custom:balance':StringNewBalance}).then(window.location.reload())
                        }
                        catch (err) {
                            window.alert(err)
                        }
                    });
                }}
            />
        </PayPalScriptProvider>
        </div>
        </div>
        </div>

        </>
    );
    
}