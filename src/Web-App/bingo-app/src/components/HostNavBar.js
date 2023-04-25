import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import {Outlet, Link} from 'react-router-dom';
import "./HostGame.js"
import {Auth, Amplify} from 'aws-amplify';
import awsExports from '../aws-exports.js';
import bingonav from './bingo-nav.png'
import AccountCircle from '@mui/icons-material/AccountCircle';
import mobilebingonav from "./mobile-bingo-nav.png"

Amplify.configure(awsExports);

const pages = ['HostGame', 'Reports'];
const settings = ['Profile', 'Balance', 'Logout'];

function HostNavBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [user, setUser] = React.useState(null);
 
  

  const getUser = async () => {
    const user = await Auth.currentAuthenticatedUser().catch(console.log("User is not Authenticated"));
  
    setUser(user);
    
  }
  
  React.useEffect(() => {
    getUser();
  }, []);


  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const SignOut = async () => {
    await Auth.signOut();
    setUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.setItem("isLoggedIn", "false");
    window.location.reload()
  }

  if (user != null) {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
        <img className='navlogo'
          src={bingonav} 
          alt="Bingo Game" 
          style={{}}
        />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/hosthome"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Bingo Bonanza
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              
                <MenuItem onClick={handleCloseNavMenu}>
              <Link to={"/Reports"}>
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'black', display: 'block' }}
              >
                Reports
              </Button>
              </Link>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu}>
                <Link to={`/${user.attributes.email}`}>
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'black', display: 'block' }}
              >
                HostGame
              </Button>
              </Link>
                </MenuItem>
            </Menu>
          </Box>
          <a href="/hosthome">
          <img className='mobilelogo'
          src={mobilebingonav} 
          alt="Bingo Game" 
          style={{}}
        />
        </a>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              <Link to={`/${user.attributes.email}`}>
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                HostGame
              </Button>
              </Link>
              <Link to={"/Reports"}>
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Reports
              </Button>
              </Link>
            <Outlet />
          </Box>


          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenUserMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
                <MenuItem onClick={handleCloseUserMenu}>
                  <div id="/SettingsMenu">
                  <Link to="/Profile">
                  <Button> Profile</Button>
                  </Link>
                  <Link to="/Balance">
                  <Button> Balance: {user.attributes['custom:balance']}</Button>
                  </Link>
                  <Button onClick={SignOut}> Logout</Button>
                  </div>
                </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
else {
  getUser();
}
}
export default HostNavBar;