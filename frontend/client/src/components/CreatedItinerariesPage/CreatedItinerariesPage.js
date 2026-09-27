// CreatedItinerariesPage.js
import React, { useState, useEffect } from "react";
import Header from "../HomePage/Header";
import Map from "../HomePage/Map";
import Sidebar from "../HomePage/Sidebar";
import "../HomePage/HomePage.css";
import "./CreatedItinerariesPage.css";
import API_URL from "../../config";

function CreatedItinerariesPage({
  onBack,
  user,
  onNavigateToProfile,
  onNavigateToHome,
  onViewItinerary,
  onNavigateToCreate,
  onNavigateToSaved,
  onLogout,
  onNavigateToCreated,
  onNavigateToCompleted,
  showError,
  onRateItinerary,
}) {
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [userItineraries, setUserItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Process tags from various formats (array, string, JSON string)
  const processTags = (tags) => {
    if (!tags) return [];

    if (Array.isArray(tags)) {
      return tags;
    }

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

  // Process destinations like HomePage does
  const processDestinations = (destinations) => {
    if (!destinations) return [];

    let processedDestinations = [];

    if (Array.isArray(destinations)) {
      processedDestinations = destinations.map((dest) => ({
        ...dest,
        lat: parseFloat(dest.lat) || parseFloat(dest.latitude) || 40.7831,
        lng: parseFloat(dest.lng) || parseFloat(dest.longitude) || -73.9712,
        id: dest.id || Math.random().toString(36).substr(2, 9),
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
          }));
        }
      } catch (e) {
        console.warn("Failed to parse destinations:", e);
      }
    }

    return processedDestinations;
  };

  // Load user's created itineraries on component mount
  useEffect(() => {
    loadUserItineraries();
  }, [user]);

  // Main function to load user itineraries from API
  const loadUserItineraries = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching user itineraries for user:", user?.id);

      // get the user's itinerary IDs
      const userResponse = await fetch(`${API_URL}/api/my-itineraries`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("User itineraries API Response:", userData);

        let userItineraryIds = [];

        if (userData.ok && Array.isArray(userData.itineraries)) {
          userItineraryIds = userData.itineraries.map((it) => it.id);
        } else {
          console.error("Unexpected API response structure:", userData);
          userItineraryIds = [];
        }

        // fetch all itineraries to get complete data including ratings
        const allResponse = await fetch(`${API_URL}/api/itineraries`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (allResponse.ok) {
          const allData = await allResponse.json();
          console.log("All itineraries API Response:", allData);

          let allItinerariesFromDB = [];

          // Handle different API response structures
          if (Array.isArray(allData)) {
            allItinerariesFromDB = allData;
          } else if (allData && Array.isArray(allData.itineraries)) {
            allItinerariesFromDB = allData.itineraries;
          } else if (allData && Array.isArray(allData.data)) {
            allItinerariesFromDB = allData.data;
          } else {
            console.error("Unexpected API response structure:", allData);
            allItinerariesFromDB = [];
          }

          // Filter to only user's itineraries and process them
          const userItinerariesFromDB = allItinerariesFromDB.filter((it) =>
            userItineraryIds.includes(it.id)
          );

          // Process and format itinerary data for display
          const processedItineraries = userItinerariesFromDB.map(
            (itinerary) => {
              // Process destinations to ensure consistent format
              let processedDestinations = [];
              if (itinerary.destinations) {
                if (Array.isArray(itinerary.destinations)) {
                  processedDestinations = itinerary.destinations.map(
                    (dest) => ({
                      ...dest,
                      lat:
                        parseFloat(dest.lat) ||
                        parseFloat(dest.latitude) ||
                        40.7831,
                      lng:
                        parseFloat(dest.lng) ||
                        parseFloat(dest.longitude) ||
                        -73.9712,
                      id: dest.id || Math.random().toString(36).substr(2, 9),
                    })
                  );
                } else if (typeof itinerary.destinations === "string") {
                  try {
                    const parsed = JSON.parse(itinerary.destinations);
                    if (Array.isArray(parsed)) {
                      processedDestinations = parsed.map((dest) => ({
                        ...dest,
                        lat:
                          parseFloat(dest.lat) ||
                          parseFloat(dest.latitude) ||
                          40.7831,
                        lng:
                          parseFloat(dest.lng) ||
                          parseFloat(dest.longitude) ||
                          -73.9712,
                        id: dest.id || Math.random().toString(36).substr(2, 9),
                      }));
                    }
                  } catch (e) {
                    console.warn("Failed to parse destinations:", e);
                  }
                }
              }

              // Ensure rating is properly parsed as a number
              const ratingValue = parseFloat(itinerary.rating) || 0;

              return {
                ...itinerary,
                tags: processTags(itinerary.tags),
                title: itinerary.title || "Untitled Itinerary",
                description: itinerary.description || "",
                duration: itinerary.duration || "1 day",
                price: itinerary.price || "$$",
                rating: ratingValue,
                destinations: processedDestinations,
                createdBy: itinerary.authorid,
                authorid: itinerary.authorid,
              };
            }
          );

          console.log(
            "Processed user itineraries with ratings:",
            processedItineraries
          );
          setUserItineraries(processedItineraries);
        } else {
          console.error("Failed to fetch all itineraries");
          setUserItineraries([]);
        }
      } else {
        console.error("Failed to fetch user itineraries from server");
        setUserItineraries([]);
        if (showError) {
          showError("Failed to load your itineraries from server.");
        }
      }
    } catch (error) {
      console.error("Error loading user itineraries from server:", error);
      setUserItineraries([]);
      if (showError) {
        showError(
          "Error loading your itineraries. Please check your connection."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const handleNavigateToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  // Handler for viewing itinerary details
  const handleViewItinerary = (itinerary) => {
    console.log("Viewing itinerary from created page:", itinerary);
    if (onViewItinerary) {
      onViewItinerary(itinerary);
    }
  };

  // Handler for creating new itinerary
  const handleCreateNew = () => {
    console.log("Create new clicked in CreatedItinerariesPage");
    if (onNavigateToCreate) {
      onNavigateToCreate();
    } else {
      console.error("onNavigateToCreate is not defined");
    }
  };

  // Handler for clicking on itinerary card
  const handleItineraryClick = (itineraryId) => {
    console.log("Itinerary clicked in created page:", itineraryId);
    const itinerary = userItineraries.find((item) => item.id === itineraryId);
    if (itinerary && onViewItinerary) {
      console.log("Found itinerary to view:", itinerary);
      onViewItinerary(itinerary);
    }
  };

  // Main page layout
  return (
    <div className="homepage">
      <div className="main-left">
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
        <Map selectedDestinations={selectedDestinations} />
      </div>

      <div className="sidebar-container">
        <Sidebar
          title="My Created Itineraries"
          placeholder="Search my itineraries..."
          itineraries={userItineraries}
          isLoading={isLoading}
          currentUser={user}
          onRateItinerary={onRateItinerary}
          onViewItinerary={onViewItinerary}
          onCreateNew={handleCreateNew}
          onItineraryClick={handleItineraryClick}
          showCreateNew={true}
        />
      </div>
    </div>
  );
}

export default CreatedItinerariesPage;
