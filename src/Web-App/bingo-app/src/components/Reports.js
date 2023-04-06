import React from "react";
import HostNavBar from "./HostNavBar";
import PlayerNavBar from "./PlayerNavBar";
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
                <h1>We are in reports</h1>
                </>
            )
        }
        if (user.attributes['custom:UserType'] === "Player") {
            return (
                <>
                <PlayerNavBar/>
                <h1>We are in reports</h1>
                </>
            )
        }

    }
};

export default Reports;