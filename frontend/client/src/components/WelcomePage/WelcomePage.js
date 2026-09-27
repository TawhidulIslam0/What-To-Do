// src/components/WelcomePage/WelcomePage.js
import React from "react";
import "./WelcomePage.css";

const WelcomePage = ({
  onSwitchToLogin,
  onSwitchToSignup,
  onSwitchToHomepage,
  onSwitchToAccountSetup,
}) => {
  return (
    <div className="welcome-page">
      <div className="welcome-container">
        {/* Welcome header with app title and description */}
        <div className="welcome-header">
          <h2 className="welcome-subtitle">Welcome to</h2>
          <h1 className="welcome-title">What To Do</h1>
          <p className="welcome-description">
            A community to find and share new fun things to do
          </p>
        </div>

        {/* Authentication and navigation buttons */}
        <div className="welcome-buttons">
          {/* Main login button */}
          <button
            className="welcome-button login-button"
            onClick={onSwitchToLogin}
          >
            Log In
          </button>

          {/* Main signup button */}
          <button
            className="welcome-button signup-button"
            onClick={onSwitchToSignup}
          >
            Sign Up
          </button>

          {/* Temporary bypass buttons for development/testing */}
          <button
            className="welcome-button temp-bypass-button"
            onClick={onSwitchToHomepage}
          >
            Go to Homepage
          </button>

          <button
            className="welcome-button temp-bypass-button"
            onClick={onSwitchToAccountSetup}
          >
            Go to Account Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
