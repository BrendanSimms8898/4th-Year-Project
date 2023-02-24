import { Amplify } from 'aws-amplify';

import { Authenticator, useAuthenticator, CheckboxField} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

export default function App() {
  return (
    <Authenticator
      // Default to Sign Up screen
      initialState="signIN"
      // Customize `Authenticator.SignUp.FormFields`
      components={{
        SignUp: {
          FormFields() {
            const { validationErrors } = useAuthenticator();

            return (
              <>
                <Authenticator.SignUp.FormFields />
                <CheckboxField
                  errorMessage={validationErrors.acknowledgement}
                  hasError={!!validationErrors.acknowledgement}
                  name="acknowledgement"
                  value="yes"
                  label="I agree with the Terms & Conditions"
                />
              </>
            );
          },
        },
      }}
      services={{
        async validateCustomSignUp(formData) {
          if (!formData.acknowledgement) {
            return {
              acknowledgement: 'You must agree to the Terms & Conditions',
            };
          }
        },
      }}
    >
      {({ signOut }) => (
        <main>
          <h1>hi</h1>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}