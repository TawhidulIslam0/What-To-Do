// SavedItinerariesPage.js
import React, { useState, useEffect } from "react";
import Header from "../HomePage/Header";
import Map from "../HomePage/Map";
import Sidebar from "../HomePage/Sidebar";
import "../HomePage/HomePage.css";
import "./SavedItinerariesPage.css";
import API_URL from "../../config";

function SavedItinerariesPage({
  onBack,
  user,
  onNavigateToProfile,
  onNavigateToHome,
  onViewItinerary,
  onNavigateToSaved,
  onNavigateToCreated,
  onNavigateToCompleted,
  onLogout,
  showError,
  onRateItinerary,
}) {
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [savedItineraries, setSavedItineraries] = useState([]);
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

  // Load saved itineraries from backend API
  useEffect(() => {
    loadSavedItineraries();
  }, [user]);

  const loadSavedItineraries = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching saved itineraries for user:", user?.id);

      // get the user's saved itinerary IDs
      const savedResponse = await fetch(`${API_URL}/api/my-saved-itineraries`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        console.log("Saved itineraries API Response:", savedData);

        let savedItineraryIds = [];

        if (savedData.ok && Array.isArray(savedData.itineraries)) {
          savedItineraryIds = savedData.itineraries.map((it) => it.id);
        } else {
          console.error("Unexpected API response structure:", savedData);
          savedItineraryIds = [];
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

          // Filter to only saved itineraries and process them
          const savedItinerariesFromDB = allItinerariesFromDB.filter((it) =>
            savedItineraryIds.includes(it.id)
          );

          // Process and format itinerary data for display
          const processedItineraries = savedItinerariesFromDB.map(
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
            "Processed saved itineraries with ratings:",
            processedItineraries
          );
          setSavedItineraries(processedItineraries);
        } else {
          console.error("Failed to fetch all itineraries");
          setSavedItineraries([]);
        }
      } else {
        console.error("Failed to fetch saved itineraries from server");
        setSavedItineraries([]);
        if (showError) {
          showError("Failed to load saved itineraries from server.");
        }
      }
    } catch (error) {
      console.error("Error loading saved itineraries from server:", error);
      setSavedItineraries([]);
      if (showError) {
        showError(
          "Error loading saved itineraries. Please check your connection."
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
    console.log("Viewing itinerary from saved page:", itinerary);
    if (onViewItinerary) {
      onViewItinerary(itinerary);
    }
  };

  // Handler for clicking on itinerary card
  const handleItineraryClick = (itineraryId) => {
    console.log("Itinerary clicked in saved page:", itineraryId);
    const itinerary = savedItineraries.find((item) => item.id === itineraryId);
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
          title="My Saved Itineraries"
          placeholder="Search saved itineraries..."
          itineraries={savedItineraries}
          isLoading={isLoading}
          currentUser={user}
          onRateItinerary={onRateItinerary}
          onViewItinerary={onViewItinerary}
          onCreateNew={null}
          onItineraryClick={handleItineraryClick}
          showCreateNew={false}
        />
      </div>
    </div>
  );
}

export default SavedItinerariesPage;
