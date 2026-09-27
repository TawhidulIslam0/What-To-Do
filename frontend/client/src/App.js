// App.js
import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./App.css";
import WelcomePage from "./components/WelcomePage/WelcomePage.js";
import LoginPage from "./components/LoginPage/LoginPage";
import SignupPage from "./components/SignupPage/SignupPage";
import AccountSetupPage from "./components/AccountSetupPage/AccountSetupPage";
import UserProfilePage from "./components/UserProfilePage/UserProfilePage";
import Homepage from "./components/HomePage/HomePage";
import CreateItineraryPage from "./components/CreateItineraryPage/CreateItineraryPage";
import ViewItineraryPage from "./components/ViewItineraryPage/ViewItineraryPage";
import EditItineraryPage from "./components/EditItineraryPage/EditItineraryPage";
import CreatedItinerariesPage from "./components/CreatedItinerariesPage/CreatedItinerariesPage";
import SavedItinerariesPage from "./components/SavedItinerariesPage/SavedItinerariesPage.js";
import ErrorPopup from "./components/ErrorPopup/ErrorPopup";
import { useErrorPopup } from "./hooks/useErrorPopup";
import CompletedItinerariesPage from "./components/CompletedItinerariesPage/CompletedItinerariesPage.js";
import API_URL from "./config.js";

function App() {
  const [currentPage, setCurrentPage] = useState("welcome");
  const [pageHistory, setPageHistory] = useState(["welcome"]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState(null);
  const { error, showError, clearError } = useErrorPopup();

  // Check for existing user session on app start
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/me`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setCurrentPage("homepage");
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
        showError("Failed to check user session. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, [showError]);

  // Navigation function to switch between pages
  const navigateTo = (page) => {
    setPageHistory((prev) => [...prev, page]);
    setCurrentPage(page);
  };

  // Handle back navigation using page history
  const handleBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCurrentPage(previousPage);
    } else {
      setCurrentPage("welcome");
    }
  };

  // Authentication handlers
  const handleLogin = (userData) => {
    setUser(userData);
    navigateTo("homepage");
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setIsNewAccount(true);
    navigateTo("setup");
  };

  const handleSetupComplete = (userData) => {
    setUser(userData);
    setIsNewAccount(false);
    navigateTo("homepage");
  };

  const handleProfileUpdate = (userData) => {
    setUser(userData);
  };

  // Handle Google OAuth login
  const handleGoogleLogin = (googleData) => {
    const userObject = parseJwt(googleData.credential);
    const userData = {
      id: userObject.sub,
      name: userObject.name,
      email: userObject.email,
      picture: userObject.picture,
      provider: "google",
    };
    setUser(userData);
    navigateTo("homepage");
  };

  // Parse JWT token from Google OAuth
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      showError("Failed to process login. Please try again.");
      return null;
    }
  };

  // Navigation handlers
  const switchToSignup = () => {
    navigateTo("signup");
  };

  const switchToLogin = () => {
    navigateTo("login");
  };

  const switchToHomepage = () => {
    navigateTo("homepage");
  };

  const switchToProfile = () => {
    if (user) {
      navigateTo("profile");
    } else {
      showError("Please log in to view your profile.");
      navigateTo("login");
    }
  };

  const switchToAccountSetup = () => {
    navigateTo("setup");
  };

  const switchToCreateItinerary = () => {
    navigateTo("create-itinerary");
  };

  const switchToViewItinerary = (itinerary) => {
    setSelectedItinerary(itinerary);
    navigateTo("view-itinerary");
  };

  const switchToEditItinerary = (itinerary) => {
    setEditingItinerary(itinerary);
    navigateTo("edit-itinerary");
  };

  const switchToCreatedItineraries = () => {
    if (user) {
      navigateTo("created-itineraries");
    } else {
      showError("Please log in to view your created itineraries.");
      navigateTo("login");
    }
  };

  const switchToSavedItineraries = () => {
    if (user) {
      navigateTo("saved-itineraries");
    } else {
      showError("Please log in to view your saved itineraries.");
      navigateTo("login");
    }
  };

  const switchToCompletedItineraries = () => {
    if (user) {
      navigateTo("completed-itineraries");
    } else {
      showError("Please log in to view your completed itineraries.");
      navigateTo("login");
    }
  };

  // Show loading screen while checking user session
  if (isLoading) {
    return (
      <div className="app">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#FFFDF0",
            fontFamily: "PoiretOne, cursive",
            fontSize: "1.2rem",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  // Handle user logout
  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setUser(null);
        setIsNewAccount(false);
        setCurrentPage("welcome");
        setPageHistory(["welcome"]);
      } else {
        showError("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      showError("Logout failed. Please try again.");
    }
  };

  // Shared handler for rating an itinerary
  const handleRateItinerary = async (itineraryId, rating) => {
    try {
      const payload = { id: Number(itineraryId), rating: Number(rating) };
      const res = await fetch(`${API_URL}/api/give-rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Failed to submit rating:", res.status, text);

        // Return a proper error object that components can handle
        if (res.status === 409) {
          return { status: 409, ok: false, message: "Already rated" };
        }
        return { ok: false, status: res.status, message: text };
      }

      const data = await res.json();
      console.log("Rating response:", data);

      // Return updated rating info to callers so they can update local UI optimistically
      return {
        ok: true,
        overallRating:
          typeof data.rating === "number" ? data.rating : undefined,
        ratingCount:
          typeof data.rating_count === "number" ? data.rating_count : undefined,
        totalRating:
          typeof data.total_rating === "number" ? data.total_rating : undefined,
      };
    } catch (err) {
      console.error("Error in shared handleRateItinerary:", err);
      return { ok: false, error: err.message };
    }
  };

  const refreshUserData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/me`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user); // Update user state
          console.log("✅ User data refreshed:", data.user);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  // Render the current active page based on state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "login":
        return (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignup={switchToSignup}
            onBack={handleBack}
            onGoogleLogin={handleGoogleLogin}
            showError={showError}
          />
        );
      case "signup":
        return (
          <SignupPage
            onSignup={handleSignup}
            onSwitchToLogin={switchToLogin}
            onBack={handleBack}
            onGoogleLogin={handleGoogleLogin}
            showError={showError}
          />
        );
      case "setup":
        if (isNewAccount) {
          return (
            <AccountSetupPage
              user={user}
              onComplete={handleSetupComplete}
              onBack={handleBack}
              showError={showError}
            />
          );
        } else {
          navigateTo("homepage");
          return null;
        }
      case "profile":
        return (
          <UserProfilePage
            user={user}
            onBack={handleBack}
            onUpdate={handleProfileUpdate}
            onNavigateToCreated={switchToCreatedItineraries}
            onViewItinerary={switchToViewItinerary}
            onNavigateToHome={switchToHomepage}
            onLogout={handleLogout}
            onNavigateToSaved={switchToSavedItineraries}
            onNavigateToCompleted={switchToCompletedItineraries}
            showError={showError}
            onRateItinerary={handleRateItinerary}
          />
        );
      case "homepage":
        return (
          <Homepage
            onBack={handleBack}
            user={user}
            onNavigateToProfile={switchToProfile}
            onNavigateToCreate={switchToCreateItinerary}
            onViewItinerary={switchToViewItinerary}
            onNavigateToCreated={switchToCreatedItineraries}
            onNavigateToSaved={switchToSavedItineraries}
            onNavigateToCompleted={switchToCompletedItineraries}
            showError={showError}
            onLogout={handleLogout}
            onRateItinerary={handleRateItinerary}
          />
        );
      case "create-itinerary":
        return (
          <CreateItineraryPage
            onBack={handleBack}
            user={user}
            onNavigateToProfile={switchToProfile}
            onNavigateToHome={switchToHomepage}
            onNavigateToCreated={switchToCreatedItineraries}
            onNavigateToSaved={switchToSavedItineraries}
            onNavigateToCompleted={switchToCompletedItineraries}
            showError={showError}
            onLogout={handleLogout}
          />
        );
      case "view-itinerary":
        return (
          <ViewItineraryPage
            itinerary={selectedItinerary}
            onBack={handleBack}
            user={user}
            onNavigateToProfile={switchToProfile}
            onNavigateToHome={switchToHomepage}
            onNavigateToCreated={switchToCreatedItineraries}
            onNavigateToSaved={switchToSavedItineraries}
            onNavigateToCompleted={switchToCompletedItineraries}
            onNavigateToEdit={switchToEditItinerary}
            showError={showError}
            onLogout={handleLogout}
            onRateItinerary={handleRateItinerary}
            onRefreshUser={refreshUserData}
          />
        );
      case "edit-itinerary":
        return (
          <EditItineraryPage
            itinerary={editingItinerary}
            onBack={handleBack}
            user={user}
            onNavigateToProfile={switchToProfile}
            onNavigateToHome={switchToHomepage}
            onNavigateToCreated={switchToCreatedItineraries}
            onNavigateToSaved={switchToSavedItineraries}
            onNavigateToCompleted={switchToCompletedItineraries}
            showError={showError}
            onLogout={handleLogout}
          />
        );
      case "created-itineraries":
        return (
          <CreatedItinerariesPage
            onBack={handleBack}
            user={user}
            onLogout={handleLogout}
            onNavigateToProfile={switchToProfile}
            onNavigateToHome={switchToHomepage}
            onViewItinerary={switchToViewItinerary}
            onNavigateToCreate={switchToCreateItinerary}
            onNavigateToCreated={switchToCreatedItineraries}
            onNavigateToSaved={switchToSavedItineraries}
            onNavigateToCompleted={switchToCompletedItineraries}
            showError={showError}
            onRateItinerary={handleRateItinerary}
          />
        );
      case "saved-itineraries":
        return (
          <SavedItinerariesPage
            onBack={handleBack}
            user={user}
            onNavigateToProfile={switchToProfile}
            onNavigateToHome={switchToHomepage}
            onViewItinerary={switchToViewItinerary}
            onNavigateToCreated={switchToCreatedItineraries}
            onNavigateToSaved={switchToSavedItineraries}
            onNavigateToCompleted={switchToCompletedItineraries}
            showError={showError}
            onLogout={handleLogout}
            onRateItinerary={handleRateItinerary}
          />
        );
      case "completed-itineraries":
        return (
          <CompletedItinerariesPage
            onBack={handleBack}
            user={user}
            onNavigateToProfile={switchToProfile}
            onNavigateToHome={switchToHomepage}
            onViewItinerary={switchToViewItinerary}
            onNavigateToCreated={switchToCreatedItineraries}
            onNavigateToSaved={switchToSavedItineraries}
            onNavigateToCompleted={switchToCompletedItineraries}
            showError={showError}
            onLogout={handleLogout}
          />
        );
      case "welcome":
      default:
        return (
          <WelcomePage
            onSwitchToLogin={switchToLogin}
            onSwitchToSignup={switchToSignup}
            onSwitchToHomepage={switchToHomepage}
            onSwitchToAccountSetup={switchToAccountSetup}
          />
        );
    }
  };

  return (
    <GoogleOAuthProvider
      clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}
    >
      <div className="app">
        {renderCurrentPage()}

        {/* Global error popup component */}
        <ErrorPopup error={error} onClose={clearError} />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
