import React from "react";
import PlayerNavBar from "./PlayerNavBar";
import bingoImage from "./player-bingo.png";
import { motion } from "framer-motion";
import "./JoinGame.js";
import { Outlet, Link } from 'react-router-dom';

const PlayerHome = () => {
  return (
    <>
      <PlayerNavBar />
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        marginTop: "50px" 
      }}>
        <motion.img 
          src={bingoImage} 
          alt="Bingo Game" 
          style={{ borderRadius: "10px" }}
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            transition: { duration: 0.5, delay: 0.5, ease: "easeOut" }
          }}
        />
        <motion.h1 
          style={{ 
            marginTop: "8vh",
            textAlign: "center",
            fontSize: "4rem", 
            color: "#4c4c4c",
            textShadow: "2px 2px 2px rgba(0,0,0,0.2)",
            fontFamily: "Arial, sans-serif"
          }}
          initial={{ x: -200 }}
          animate={{ 
            x: 0,
            transition: { duration: 0.5, delay: 1, ease: "easeOut" }
          }}
        >
          Play Bingo Online!
        </motion.h1>
        <motion.p 
          style={{ 
            margin: "4vh 0", 
            fontSize: "1.5rem",
            textAlign: "center",
            color: "#4c4c4c",
            textShadow: "2px 2px 2px rgba(0,0,0,0.2)",
            fontFamily: "Arial, sans-serif"
          }}
          initial={{ x: -200 }}
          animate={{ 
            x: 0,
            transition: { duration: 0.5, delay: 1.5, ease: "easeOut" }
          }}
        >
          Join the fun and excitement of bingo from the comfort of your home.
        </motion.p>
        <Link to={`/joingame`}>
        <motion.button 
          style={{ 
            marginTop: "1vh",
            padding: "15px 30px", 
            fontSize: "1.5rem", 
            backgroundColor: "#508bfc", 
            color: "white", 
            border: "none", 
            borderRadius: "10px", 
            cursor: "pointer",
            boxShadow: "2px 2px 2px rgba(0,0,0,0.2)",
            fontFamily: "Arial, sans-serif"
          }}
          whileHover={{ 
            scale: 1.1,
            transition: { duration: 0.2 }
          }}
          initial={{ y: 1000 }}
          animate={{ 
            y: 0,
            transition: { duration: 0.5, delay: 2, ease: "easeOut" }
          }}
        >
          Play Now
        </motion.button>
        </Link>
      </div>
    </>
  );
};

export default PlayerHome;
