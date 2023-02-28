import { Amplify, Hub, Auth} from 'aws-amplify';
import awsExports from './aws-exports';
import React, {useEffect, useState} from 'react';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBIcon,
  MDBCheckbox
}
from 'mdb-react-ui-kit';
import { maxHeight, maxWidth } from '@mui/system';

Amplify.configure(awsExports);

const initialFormState = {
  username: "",
  password: "",
  authCode: "",
  name: "",
  birthdate: "",
  city: "",
  formType: "signUp"
}

var error_message = ""

export default function App () {
  const [formState, updateFormState] = useState(initialFormState)
  
  const [user, updateUser] = useState(null);

  const checkUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();

      updateUser(user);

      console.log("got user", user)

      updateFormState(() => ({ ...formState, formType: "signedIn"}));
    } 
    catch (err) {
        console.log("CheckUser Failed", err);
        updateFormState(() => ({ ...formState, formType: "signIn"}));
    }
  };

  const setAuthListener = async () => {
    Hub.listen("auth", (data) => {
      switch(data.payload.event) {
        case "signOut":
          console.log(data);

          updateFormState(() => ({ ...formState, formType: "signIn", }));

          break

        case "signIn":
          console.log(data)

          break;

        case "signUp":
          console.log(data)

          break;
        

        case "signIn_failure":
          if (data.payload.name === "NotAuthorizedException") {
            error_message = "Password Does not match those on the system for specified email"
          }

          if (data.payload.name === "UserNotFoundException") {
            error_message = "There is no account with this username"
          }

          console.log(data)
          
          break;
      };
    });
  };

  useEffect(() => {
    checkUser();
    setAuthListener();
  }, []);

  const onChange = (e) => {
    e.persist();
    updateFormState(() => ({ ...formState, [e.target.name]: e.target.value}));
  };

  const {formType} = formState;

  const signUp = async () => {
    try {
    const {username, password, birthdate, name, city} = formState

    if (birthdate === "" || name === "" || city === "") {
      window.alert("Please Fill in birthdate, name and city to complete SignUp")
    }
    else {
    await Auth.signUp({username, password, attributes: {birthdate, name, 'custom:city': city}})

    updateFormState(() => ({ ...formState, formType:"confirmSignUp"}));
    }
    }
    catch (err) {
      if (err.name === "InvalidParameterException") {
        window.alert("Please use a valid email address")
      }
      if (err.name === "UsernameExistsException") {
        var ResetPassword = window.confirm("This User already exists, would you like to reset your password?")
      }
      if (ResetPassword === true) {
        updateFormState(() => ({ ...formState, formType:"forgotPassword"}))
      }
      if (err.name === "AuthError") {
        window.alert("Please fill the entire before before registering")
      }
    }
  };
  
  const signIn = async () => {
    const {username, password} = formState;
    var LoggedIn = true;

    try {
    await Auth.signIn(username, password);
    }
    catch (err) {
      window.alert(err)
      LoggedIn = false
    }
    if (LoggedIn === true) {
    updateFormState(() => ({ ...formState, formType: 'signedIn'}));
    }
  };
  
  const confirmSignUp = async () => {
    const { username, authCode } = formState;

    var ConfirmedSignUp = true
    try {
    await Auth.confirmSignUp(username, authCode);
    }
    catch (err) {
      window.alert("verification code does not match.")
      ConfirmedSignUp = false
    }
    if (ConfirmedSignUp === true) {
    updateFormState(() => ({ ...formState, formType: "signIn" }));
    }
  };

  const forgotPassword = async () => {
    const {username} = formState;
    var UserNameProvided = true

    try {
    await Auth.forgotPassword(username);
    }
    catch (err) {
      window.alert(err)
      UserNameProvided = false
    }
    if (UserNameProvided === true) {
    updateFormState(() => ({ ...formState, formType: "forgotPassword"}));
    }
  };

  const confirmNewPassword = async () => {
    const {username, authCode, password} = formState
    var PasswordChanged = true

    try {
    await Auth.forgotPasswordSubmit(username, authCode, password)
    }
    catch (err) {
      window.alert(err)
      PasswordChanged = false
    }
    if (PasswordChanged === true) {
    updateFormState(() => ({ ...formState, formType: "signIn"}))
    }
  };

  const resendVerificationCode = async () => {
    const {username} = formState;

    await Auth.resendSignUp(username)

    updateFormState(() => ({ ...formState, formType: "confirmSignUp"}))
  };

  return (
    <>

    {formType === "signUp" && (
                <body style={{backgroundColor:"#508bfc"}}>
                <div id="Authentication-container">
                  <MDBContainer fluid>
                    <MDBRow className='d-flex justify-content-center align-items-center h-100'>
                      <MDBCol col='12'>
                        <MDBCard className='bg-white my-5 mx-auto' style={{borderRadius: '1rem', maxWidth: '500px'}}>
                          <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                            <h2 className="fw-bold mb-2 text-center">Sign Up</h2>
                            <MDBInput wrapperClass='mb-4 w-100' onChange={onChange} name="username" label='Email address' id='formControlLg' type='username' size="lg"/>
                            <MDBInput wrapperClass='mb-4 w-100' onChange={onChange} name="password" label='Password' id='formControlLg' type='password' size="lg"/>
                            <MDBInput wrapperClass='mb-4 w-100' onChange={onChange} name="birthdate" label='Date Of Birth' id='formControlLg' type='birthdate' size="lg"/>
                            <MDBInput wrapperClass='mb-4 w-100' onChange={onChange} name="name" label='Full Name' id='formControlLg' type='name' size="lg"/>
                            <MDBInput wrapperClass='mb-4 w-100' onChange={onChange} name="city" label='City' id='formControlLg' type='city' size="lg"/>
                            <MDBBtn className="mb-4" size='lg' onClick={signUp}>Sign Up</MDBBtn>
                            <div className="text-center">
                            <p>Already signed up?</p>
                            </div>
                            <MDBBtn className="mb-4" size='lg' onClick={() =>
                                updateFormState(() => ({
                                  ...formState,
                                  formType: "signIn",
                                }))
                              }>
                                Sign Up now
                                </MDBBtn>
                              </MDBCardBody>
                            </MDBCard>
                          </MDBCol>
                      </MDBRow>
                  </MDBContainer>
                </div>
              </body>
      )}

      {formType === "confirmSignUp" && (
          <body style={{backgroundColor:"#508bfc"}}>
          <div id="Authentication-container">
            <MDBContainer fluid>
              <MDBRow className='d-flex justify-content-center align-items-center h-100'>
                <MDBCol col='12'>
                  <MDBCard className='bg-white my-5 mx-auto' style={{borderRadius: '1rem', maxWidth: '500px'}}>
                    <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                      <h2 className="fw-bold mb-2 text-center">Confirm Sign Up</h2>
                      <MDBInput wrapperClass='mb-4 w-100' onChange={onChange} name="authCode" label='Verification Code' id='formControlLg' size="lg"/>
                      <MDBBtn className="mb-4" size='lg' onClick={confirmSignUp}>Confirm Sign Up</MDBBtn>
                      <MDBBtn className="mb-4" size='lg' onClick={resendVerificationCode}>Resend Verification Code?</MDBBtn>
                        </MDBCardBody>
                      </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
          </div>
        </body>

      )}

      {formType === "signIn" && (
          <body style={{backgroundColor:"#508bfc"}}>
            <div id="Authentication-container">
              <MDBContainer fluid>
                <MDBRow className='d-flex justify-content-center align-items-center h-100'>
                  <MDBCol col='12'>
                    <MDBCard className='bg-white my-5 mx-auto' style={{borderRadius: '1rem', maxWidth: '500px'}}>
                      <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                        <h2 className="fw-bold mb-2 text-center">Sign In</h2>
                        <MDBInput wrapperClass='mb-4 w-100' onChange={onChange} name="username" label='Email address' id='formControlLg' type='username' size="lg"/>
                        <MDBInput wrapperClass='mb-4 w-100' onChange={onChange} name="password" label='Password' id='formControlLg' type='password' size="lg"/>
                        <MDBBtn className="mb-4" size='lg' onClick={signIn}>Sign in</MDBBtn>
                        <MDBBtn className="mb-4" size='lg' onClick={forgotPassword}>Forgot Password</MDBBtn>
                        <div className="text-center">
                        <p>No account yet?</p>
                        </div>
                        <MDBBtn className="mb-4" size='lg' onClick={() =>
                            updateFormState(() => ({
                              ...formState,
                              formType: "signUp",
                            }))
                          }>
                            Sign Up now
                            </MDBBtn>
                          </MDBCardBody>
                        </MDBCard>
                      </MDBCol>
                  </MDBRow>
              </MDBContainer>
            </div>
          </body>
      )}

      {formType === "signedIn" && (
        <div>
          <h2>
            Welcome the app!
          </h2>

          <button
            onClick={() => {
              Auth.signOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
      {formType === "forgotPassword" && (
          <body style={{backgroundColor:"#508bfc"}}>
          <div id="Authentication-container">
            <MDBContainer fluid>
              <MDBRow className='d-flex justify-content-center align-items-center h-100'>
                <MDBCol col='12'>
                  <MDBCard className='bg-white my-5 mx-auto' style={{borderRadius: '1rem', maxWidth: '500px'}}>
                    <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                      <h2 className="fw-bold mb-2 text-center">Forgot Password?</h2>
                      <MDBInput wrapperClass='mb-4 w-100' onChange={onChange} name="username" label='Email address' id='formControlLg' type='username' size="lg"/>
                      <MDBInput wrapperClass='mb-4 w-100' onChange={onChange} name="password" label='New Password' id='formControlLg' type='password' size="lg"/>
                      <MDBInput wrapperClass='mb-4 w-100' onChange={onChange} name="authCode" label='Verification Code' id='formControlLg' size="lg"/>
                      <MDBBtn className="mb-4" size='lg' onClick={confirmNewPassword}>Update Password</MDBBtn>
                        </MDBCardBody>
                      </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
          </div>
        </body>

      )}
      <hr />
    </>
  );
}
