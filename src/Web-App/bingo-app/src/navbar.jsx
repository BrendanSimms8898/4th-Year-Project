import React from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/HostHomePage">Host</Link>
        </li>
        <li>
          <Link to="/PlayerHomePage">Player</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;