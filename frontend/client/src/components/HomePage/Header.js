// Header.js
import React, { useState, useRef, useEffect } from "react";
import "./Header.css";
import API_URL from "../../config";

function Header({
  onBack,
  user,
  onNavigateToProfile,
  onNavigateToHome,
  onNavigateToCreated,
  onNavigateToSaved,
  onNavigateToCompleted,
  onLogout,
}) {
  // State for dropdown and tooltip visibility
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dropdownRef = useRef(null);
  const tooltipTimeoutRef = useRef(null);

  // Updated logout function
  const handleLogout = async () => {
    console.log("Logout button clicked");

    try {
      // Use the correct endpoint from your server.js
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      console.log("Logout response status:", response.status);

      if (response.ok) {
        console.log("Logout successful on backend");
        if (onLogout) {
          onLogout();
        }
      } else {
        console.error("Logout failed on backend - status:", response.status);
        // Try the other endpoint as fallback
        try {
          const fallbackResponse = await fetch(`${API_URL}/api/logout`, {
            method: "POST",
            credentials: "include",
          });
          if (fallbackResponse.ok) {
            console.log("Fallback logout successful");
            if (onLogout) {
              onLogout();
            }
          } else {
            console.error("Fallback logout also failed");
          }
        } catch (fallbackError) {
          console.error("Fallback logout error:", fallbackError);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setShowDropdown(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleTitleClick = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleHomepageClick = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
    setShowDropdown(false);
  };

  const handleAccountClick = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
    setShowDropdown(false);
  };

  const handleCreatedItinerariesClick = () => {
    if (onNavigateToCreated) {
      onNavigateToCreated();
    }
    setShowDropdown(false);
  };

  const handleSavedItinerariesClick = () => {
    if (onNavigateToSaved) {
      onNavigateToSaved();
    }
    setShowDropdown(false);
  };

  const handleCompletedItinerariesClick = () => {
    if (onNavigateToCompleted) {
      onNavigateToCompleted();
    }
    setShowDropdown(false);
  };

  // Show/hide title tooltip with delay
  const showTitleTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(true);
  };

  const hideTitleTooltip = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 100);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="header">
      {/* Back button */}
      <button className="back-button" onClick={handleBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        Back
      </button>

      {/* Clickable title with tooltip */}
      <div
        className="header-title-container"
        onMouseEnter={showTitleTooltip}
        onMouseLeave={hideTitleTooltip}
      >
        <h2 className="header-title-clickable" onClick={handleTitleClick}>
          What To Do - New York City
        </h2>
        {showTooltip && <div className="title-tooltip">Go to Homepage</div>}
      </div>

      {/* Account dropdown menu */}
      <div className="account-container" ref={dropdownRef}>
        <button className="account-button" onClick={toggleDropdown}>
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          )}
        </button>

        {/* Dropdown menu options */}
        {showDropdown && (
          <div className="dropdown-menu">
            {/* Homepage navigation */}
            <div className="dropdown-item" onClick={handleHomepageClick}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              Homepage
            </div>
            <div className="dropdown-divider"></div>

            {/* Account navigation */}
            <div className="dropdown-item" onClick={handleAccountClick}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
              Account
            </div>

            {/* Created itineraries navigation */}
            <div
              className="dropdown-item"
              onClick={handleCreatedItinerariesClick}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
              Created Itineraries
            </div>

            {/* Saved itineraries navigation */}
            <div
              className="dropdown-item"
              onClick={handleSavedItinerariesClick}
            >
              <svg
                width="18px"
                height="18px"
                viewBox="0 -960 960 960"
                fill="currentColor"
              >
                <path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm200-440 100-60 100 60v-280H440v280Z" />
              </svg>
              Saved Itineraries
            </div>
            <div className="dropdown-divider"></div>

            {/* Completed itineraries navigation */}
            <div
              className="dropdown-item"
              onClick={handleCompletedItinerariesClick}
            >
              <svg
                width="18px"
                height="18px"
                viewBox="0 -960 960 960"
                fill="currentColor"
              >
                <path d="m424-318 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm280-670q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790Z" />
              </svg>
              Completed Itineraries
            </div>
            <div className="dropdown-divider"></div>

            {/* Logout option */}
            <div className="dropdown-item logout" onClick={handleLogout}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
