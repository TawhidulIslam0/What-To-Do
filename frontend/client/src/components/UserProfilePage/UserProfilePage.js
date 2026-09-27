// src/components/UserProfilePage/UserProfilePage.js
import React, { useState, useEffect } from "react";
import Header from "../HomePage/Header";
import ProfileInfo from "./ProfileInfo";
import ProfileStats from "./ProfileStats";
import ItineraryView from "./ItineraryView";
import "./UserProfilePage.css";
import API_URL from "../../config";

const UserProfilePage = ({
  onBack,
  onUpdate,
  user,
  onNavigateToProfile,
  onNavigateToCreate,
  onViewItinerary,
  onNavigateToCreated,
  onNavigateToSaved,
  onNavigateToHome,
  onNavigateToCompleted,
  showError,
  onLogout,
  onRateItinerary,
}) => {
  // State for edit mode, loading, active tab, and user itineraries
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("itineraries");
  const [userItineraries, setUserItineraries] = useState([]);
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [completedItineraries, setCompletedItineraries] = useState([]);

  // Helper to process tags from various formats (array, JSON string, etc.)
  const processTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn("Failed to parse tags as JSON:", e);
        return [];
      }
    }
    return [];
  };

  // Process destinations
  const processDestinations = (destinations) => {
    if (!destinations) return [];

    let processedDestinations = [];

    if (Array.isArray(destinations)) {
      processedDestinations = destinations.map((dest) => ({
        ...dest,
        lat: parseFloat(dest.lat) || parseFloat(dest.latitude) || 40.7831,
        lng: parseFloat(dest.lng) || parseFloat(dest.longitude) || -73.9712,
        id: dest.id || Math.random().toString(36).substr(2, 9),
        name: dest.name || dest.formatted_address || "Unknown Location",
        address:
          dest.address || dest.formatted_address || "Address not available",
        rating: dest.rating || null,
      }));
    } else if (typeof destinations === "string") {
      try {
        const parsed = JSON.parse(destinations);
        if (Array.isArray(parsed)) {
          processedDestinations = parsed.map((dest) => ({
            ...dest,
            lat: parseFloat(dest.lat) || parseFloat(dest.latitude) || 40.7831,
            lng: parseFloat(dest.lng) || parseFloat(dest.longitude) || -73.9712,
            id: dest.id || Math.random().toString(36).substr(2, 9),
            name: dest.name || dest.formatted_address || "Unknown Location",
            address:
              dest.address || dest.formatted_address || "Address not available",
            rating: dest.rating || null,
          }));
        }
      } catch (e) {
        console.warn("Failed to parse destinations:", e);
      }
    }

    return processedDestinations;
  };

  // Load user data and itineraries on component mount
  useEffect(() => {
    if (user) {
      setIsLoading(false);
      loadUserItineraries();
      loadSavedItineraries(); // Load saved itineraries
      loadCompletedItineraries(); // Load completed itineraries
    } else {
      const timer = setTimeout(() => {
        if (!user) {
          console.error("No user data available");
          onBack();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, onBack]);

  // Fetch user's itineraries from backend API
  const loadUserItineraries = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching user itineraries for profile:", user?.id);

      // First get user itinerary IDs
      const userResponse = await fetch(`${API_URL}/api/my-itineraries`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("Profile user itineraries API Response:", userData);

        let userItineraryIds = [];

        if (userData.ok && Array.isArray(userData.itineraries)) {
          userItineraryIds = userData.itineraries.map((it) => it.id);
        }

        // Then get all itineraries for complete data
        const allResponse = await fetch(`${API_URL}/api/itineraries`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (allResponse.ok) {
          const allData = await allResponse.json();
          console.log("Profile all itineraries API Response:", allData);

          let allItinerariesFromDB = [];

          // Handle different API response structures
          if (Array.isArray(allData)) {
            allItinerariesFromDB = allData;
          } else if (allData && Array.isArray(allData.itineraries)) {
            allItinerariesFromDB = allData.itineraries;
          } else if (allData && Array.isArray(allData.data)) {
            allItinerariesFromDB = allData.data;
          }

          // Filter to user's itineraries
          const userItinerariesFromDB = allItinerariesFromDB.filter((it) =>
            userItineraryIds.includes(it.id)
          );

          // Process with complete data including ratings
          const processedItineraries = userItinerariesFromDB.map(
            (itinerary) => ({
              ...itinerary,
              tags: processTags(itinerary.tags),
              destinations: processDestinations(itinerary.destinations),
              title: itinerary.title || "Untitled Itinerary",
              description: itinerary.description || "",
              duration: itinerary.duration || "1 day",
              price: itinerary.price || "$$",
              rating: parseFloat(itinerary.rating) || 0,
              createdBy: itinerary.authorid || user?.id || "unknown",
              authorid: itinerary.authorid,
              authorname: itinerary.authorname || "Unknown",
            })
          );

          console.log(
            "User itineraries loaded for profile with ratings:",
            processedItineraries
          );
          setUserItineraries(processedItineraries);
        }
      }
    } catch (error) {
      console.error("Error loading user itineraries for profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's saved itineraries with complete data
  const loadSavedItineraries = async () => {
    try {
      console.log("Fetching saved itineraries for profile:", user?.id);

      // First get saved itinerary IDs
      const savedResponse = await fetch(`${API_URL}/api/my-saved-itineraries`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        console.log("Profile saved itineraries API Response:", savedData);

        let savedItineraryIds = [];

        if (savedData.ok && Array.isArray(savedData.itineraries)) {
          savedItineraryIds = savedData.itineraries.map((it) => it.id);
        }

        // Then get all itineraries for complete data
        const allResponse = await fetch(`${API_URL}/api/itineraries`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (allResponse.ok) {
          const allData = await allResponse.json();
          console.log(
            "Profile all itineraries for saved API Response:",
            allData
          );

          let allItinerariesFromDB = [];

          // Handle different API response structures
          if (Array.isArray(allData)) {
            allItinerariesFromDB = allData;
          } else if (allData && Array.isArray(allData.itineraries)) {
            allItinerariesFromDB = allData.itineraries;
          } else if (allData && Array.isArray(allData.data)) {
            allItinerariesFromDB = allData.data;
          }

          // Filter to saved itineraries
          const savedItinerariesFromDB = allItinerariesFromDB.filter((it) =>
            savedItineraryIds.includes(it.id)
          );

          // Process with complete data including ratings
          const processedSavedItineraries = savedItinerariesFromDB.map(
            (itinerary) => ({
              ...itinerary,
              tags: processTags(itinerary.tags),
              destinations: processDestinations(itinerary.destinations),
              title: itinerary.title || "Untitled Itinerary",
              description: itinerary.description || "",
              duration: itinerary.duration || "1 day",
              price: itinerary.price || "$$",
              rating: parseFloat(itinerary.rating) || 0,
              createdBy: itinerary.authorid || "unknown",
              authorid: itinerary.authorid,
              authorname: itinerary.authorname || "Unknown",
            })
          );

          console.log(
            "Saved itineraries loaded for profile with ratings:",
            processedSavedItineraries
          );
          setSavedItineraries(processedSavedItineraries);
        }
      }
    } catch (error) {
      console.error("Error loading saved itineraries for profile:", error);
    }
  };

  // Load completed itineraries
  const loadCompletedItineraries = async () => {
    try {
      console.log("Fetching completed itineraries for profile:", user?.id);

      // First get completed itinerary IDs
      const completedResponse = await fetch(
        `${API_URL}/api/my-completed-itineraries`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (completedResponse.ok) {
        const completedData = await completedResponse.json();
        console.log(
          "Profile completed itineraries API Response:",
          completedData
        );

        let completedItineraryIds = [];

        if (completedData.ok && Array.isArray(completedData.itineraries)) {
          completedItineraryIds = completedData.itineraries.map((it) => it.id);
        }

        // Then get all itineraries for complete data
        const allResponse = await fetch(`${API_URL}/api/itineraries`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (allResponse.ok) {
          const allData = await allResponse.json();
          console.log(
            "Profile all itineraries for completed API Response:",
            allData
          );

          let allItinerariesFromDB = [];

          // Handle different API response structures
          if (Array.isArray(allData)) {
            allItinerariesFromDB = allData;
          } else if (allData && Array.isArray(allData.itineraries)) {
            allItinerariesFromDB = allData.itineraries;
          } else if (allData && Array.isArray(allData.data)) {
            allItinerariesFromDB = allData.data;
          }

          // Filter to completed itineraries
          const completedItinerariesFromDB = allItinerariesFromDB.filter((it) =>
            completedItineraryIds.includes(it.id)
          );

          // Process with complete data including ratings
          const processedCompletedItineraries = completedItinerariesFromDB.map(
            (itinerary) => ({
              ...itinerary,
              tags: processTags(itinerary.tags),
              destinations: processDestinations(itinerary.destinations),
              title: itinerary.title || "Untitled Itinerary",
              description: itinerary.description || "",
              duration: itinerary.duration || "1 day",
              price: itinerary.price || "$$",
              rating: parseFloat(itinerary.rating) || 0,
              createdBy: itinerary.authorid || "unknown",
              authorid: itinerary.authorid,
              authorname: itinerary.authorname || "Unknown",
            })
          );

          console.log(
            "Completed itineraries loaded for profile with ratings:",
            processedCompletedItineraries
          );
          setCompletedItineraries(processedCompletedItineraries);
        }
      }
    } catch (error) {
      console.error("Error loading completed itineraries for profile:", error);
    }
  };

  // Profile editing handlers
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedUser) => {
    setIsEditing(false);
    onUpdate(updatedUser);
  };

  const handleComplete = (updatedUser) => {
    setIsEditing(false);
    onUpdate(updatedUser);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Tab navigation handler
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Navigation handlers
  const handleNavigateToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  // Handler for viewing itinerary
  const handleViewItinerary = (itinerary) => {
    console.log("Viewing itinerary from profile page:", itinerary);
    if (onViewItinerary) {
      // Ensure we pass the complete itinerary object with all processed data
      onViewItinerary({
        ...itinerary,
        // Make sure we have the essential fields
        title: itinerary.title || "Untitled Itinerary",
        description: itinerary.description || "",
        duration: itinerary.duration || "1 day",
        price: itinerary.price || "$$",
        rating: itinerary.rating || 0,
        tags: Array.isArray(itinerary.tags) ? itinerary.tags : [],
        destinations: Array.isArray(itinerary.destinations)
          ? itinerary.destinations
          : [],
        authorid: itinerary.authorid,
        authorname: itinerary.authorname || "Unknown",
      });
    }
  };

  // Loading state display
  if (isLoading || !user) {
    return (
      <div className="user-profile-page">
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#71C19D",
          }}
        >
          <div>Loading user data...</div>
          <button
            className="back-button"
            onClick={onBack}
            style={{ marginTop: "20px" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#71C19D">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page account-page">
      {/* Full Width Header */}
      <div className="profile-header-full">
        <Header
          onBack={onBack}
          user={user}
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToHome={onNavigateToHome}
          onNavigateToCreated={onNavigateToCreated}
          onNavigateToSaved={onNavigateToSaved}
          onNavigateToCompleted={onNavigateToCompleted}
          onLogout={onLogout}
        />
      </div>

      {/* Main Profile Content Area */}
      <div className="profile-content-main">
        {/* Edit Profile Button (only shown when not editing) */}
        {!isEditing && (
          <div className="edit-profile-top-right">
            <button className="edit-profile-btn-small" onClick={handleEdit}>
              Edit Profile
            </button>
          </div>
        )}

        {/* Profile Info Section (handles both view and edit modes) */}
        <ProfileInfo
          user={user}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        {/* Profile Stats Section (itineraries count, saved, recent) */}
        <ProfileStats
          userItineraries={userItineraries}
          savedItineraries={savedItineraries} // Pass saved itineraries
          completedItineraries={completedItineraries} // Pass completed itineraries
        />
      </div>

      {/* Itinerary Display Section with Tabs */}
      <ItineraryView
        activeTab={activeTab}
        onTabClick={handleTabClick}
        userItineraries={userItineraries}
        savedItineraries={savedItineraries} // Pass saved itineraries
        completedItineraries={completedItineraries} // Pass completed itineraries
        user={user}
        onViewItinerary={handleViewItinerary}
        onNavigateToCreated={onNavigateToCreated}
        onNavigateToSaved={onNavigateToSaved}
        onNavigateToCompleted={onNavigateToCompleted}
        onRateItinerary={onRateItinerary}
      />
    </div>
  );
};

export default UserProfilePage;
