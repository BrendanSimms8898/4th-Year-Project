import { Amplify, Auth} from 'aws-amplify';
import awsExports from './aws-exports';
import React, {useState} from 'react';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import {Routes, Route,BrowserRouter} from 'react-router-dom';
import 'react-toastify'
import HostHome from './components/HostHome.js';
import HostGame from './components/HostGame';
import Reports from './components/Reports';
import JoinGame from './components/JoinGame';
import PlayerHome from './components/PlayerHome';
import BalanceManager from './components/BalanceManager.js';
import HostProfile from './components/HostProfile.js';
import PlayerProfile from './components/PlayerProfile.js';
import Authentication from './components/Authentication';
import AddBalance from './components/AddBalance';
import WithdrawBalance from './components/WithdrawBalance'


Amplify.configure(awsExports);

export default function App () { 

  const [user, updateUser] = useState(null);


  const getUser = async () => {
    const user = await Auth.currentAuthenticatedUser().catch(console.log("user is not valid"));
  
    updateUser(user);
    
  }

  if (user != null) {
  const id = user.attributes.email
  }
  
  React.useEffect(() => {
    getUser();
  }, []);

  if (user != null) {
  if (localStorage.getItem("isLoggedIn") === "true"){
    try {
    if (user.attributes['custom:UserType'] === "Host") {
      return (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HostHome/>}></Route>
            <Route path="/:id" element={<HostGame />}></Route>
            <Route path="Reports" element={<Reports />}></Route>
            <Route path="Profile" element={<HostProfile/>}></Route>
            <Route path="Balance" element={<BalanceManager/>}></Route>
            <Route path="AddBalance" element={<AddBalance/>}></Route>
            <Route path="WithdrawBalance" element={<WithdrawBalance/>}></Route>
            <Route path="HostHome" element={<HostHome/>}></Route>
          </Routes>
        </BrowserRouter>
      )
    }
    if (user.attributes['custom:UserType'] === "Player") {
      return (
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<PlayerHome/>}></Route>
          <Route path="PlayerHome" element={<PlayerHome />}></Route>
          <Route path="JoinGame" element={<JoinGame />}></Route>
          <Route path="Reports" element={<Reports />}></Route>
          <Route props={user} path="/Profile" element={<PlayerProfile/>}></Route>
          <Route path="Balance" element={<BalanceManager/>}></Route>
          <Route path="AddBalance" element={<AddBalance/>}></Route>
          <Route path="WithdrawBalance" element={<WithdrawBalance/>}></Route>
        </Routes>
      </BrowserRouter>
      )
    }
  }
  catch (err) {
    getUser();
  }
  }
}
  else {
    getUser();
  }

  return (
    <>
    <Authentication/>
    </>
  );
}
