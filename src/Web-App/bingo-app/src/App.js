import { Amplify, Hub, Auth} from 'aws-amplify';
import awsExports from './aws-exports';

import React, {useEffect, useState} from 'react';

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

export default function App() {
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
        console.log("CheckUser Faile", err);
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
        

        case "signIn_failure":
          if (data.payload.name === "NotAuthorizedException") {
            error_message = "Password Does not match those on the system for specified email"
          }

          console.log(data)
          
          break;

        case "signUp_failure":
          console.log(data)
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

  const onChangeCustom = (e) => {
    e.persist();
    updateFormState(() => ({ ...formState, ['custom:'+ e.target.name]: e.target.value}))
  }

  const {formType} = formState;

  const signUp = async () => {
    try {
    const {username, password, birthdate, name, city} = formState

    await Auth.signUp({username, password, attributes: {birthdate, name, 'custom:city': city}})

    updateFormState(() => ({ ...formState, formType:"confirmSignUp"}));
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
      if (err.name === "ResourceNotFoundException" || "AuthError") {
        window.alert("Please Enter an email and password before trying to signIn or reset Password")
      }
      if (err.name === "AuthError") {
        window.alert("Please Enter a Password before you submit")
      }
    }
  };
  
  const signIn = async () => {
    try{
    const {username, password} = formState;

    await Auth.signIn(username, password);

    updateFormState(() => ({ ...formState, formType: 'signedIn'}));
    }
    catch (err) {
      if (err.name === "UserNotConfirmedException") {
      updateFormState(() => ({ ...formState, formType: 'confirmSignUp'}))
      }
    }
  };
  
  const confirmSignUp = async () => {
    const { username, authCode } = formState;

    await Auth.confirmSignUp(username, authCode);

    updateFormState(() => ({ ...formState, formType: "signIn" }));
  };

  const forgotPassword = async () => {
    const {username} = formState;

    await Auth.forgotPassword(username);

    updateFormState(() => ({ ...formState, formType: "forgotPassword"}));
  };

  const confirmNewPassword = async () => {
    const {username, authCode, password} = formState

    await Auth.forgotPasswordSubmit(username, authCode, password)

    updateFormState(() => ({ ...formState, formType: "signIn"}))
  };
  const resendVerificationCode = async () => {
    const {username} = formState;

    await Auth.resendSignUp(username)

    updateFormState(() => ({ ...formState, formType: "confirmSignUp"}))
  };

  return (
    <>

    {formType === "signUp" && (
      <div className='form-box'>
        <input name="username" onChange={onChange} placeholder='email' />
        <input name="password" type='password' onChange={onChange} placeholder='password'/>
        <input name="birthdate" type="birthdate" onChange={onChange} placeholder='Date Of Birth'/>
        <input name="name" type="name" onChange={onChange} placeholder="name"/>
        <input name="city" type="city" onChange={onChange} placeholder="city"/>

        <button onClick={signUp}> Sign Up </button>

        <p>Already signed up?</p>
        
        <button
          onClick={() =>
              updateFormState(() => ({
                ...formState,
                formType: "signIn",
              }))
            }
          >
            Sign In instead
          </button>
        </div>
      )}

      {formType === "confirmSignUp" && (
        <div>
          <input
            name="authCode"
            onChange={onChange}
            placeholder="confirm auth code"
          />
          <button onClick={confirmSignUp}>Confirm Sign up</button>
          <button onClick={resendVerificationCode}>Resend Verification Code?</button>
        </div>
      )}

      {formType === "signIn" && (
        <div>
          <input name="username" onChange={onChange} placeholder="username" />
          <input
            name="password"
            type="password"
            onChange={onChange}
            placeholder="password"
          />
          <button onClick={signIn}>Sign In</button>
          <button onClick={forgotPassword}>Forgot Password</button>

          <p>No account yet?</p>

          <button
            onClick={() =>
              updateFormState(() => ({
                ...formState,
                formType: "signUp",
              }))
            }
          >
            Sign Up now
          </button>
        </div>
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
        <div>
          <input name="username" onChange={onChange} placeholder="username" />
          <input name="password" type="password" onChange={onChange} placeholder="New password" />
          <input name="authCode" onChange={onChange} placeholder="confirm auth code" />

          <button onClick={confirmNewPassword}>Update Password</button>
        </div>
      )}
      <hr />
    </>
  );
}