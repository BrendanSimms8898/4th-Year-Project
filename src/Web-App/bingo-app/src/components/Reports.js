import React from "react";
import HostNavBar from "./HostNavBar";
import { Amplify, Auth} from 'aws-amplify';
import awsExports from "../aws-exports.js";

Amplify.configure(awsExports);
const Reports = () => {
    const [user, setUser] = React.useState(null);

    
    const getUser = async () => {
        const user = await Auth.currentAuthenticatedUser();
  
        setUser(user);
        
    }
    
    React.useEffect(() => {
        getUser();
      }, []);

    
    if (user != null) {
        if (user.attributes['custom:UserType'] === "Host") {
            return (
                <>
                <HostNavBar/>
                <h1 id="comingsoon">Currently In Development</h1>
                </>
            )
        }
    }
};

export default Reports;