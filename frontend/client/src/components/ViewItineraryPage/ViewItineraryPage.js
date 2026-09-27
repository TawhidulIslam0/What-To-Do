// ViewItineraryPage.js
import React, { useState, useEffect } from "react";
import Header from "../HomePage/Header";
import Map from "../HomePage/Map";
import ViewItinerarySidebar from "./ViewItinerarySidebar";
import "../HomePage/HomePage.css";
import API_URL from "../../config";

function ViewItineraryPage({
  itinerary,
  user,
  onBack,
  onNavigateToProfile,
  onNavigateToHome,
  onNavigateToCreated,
  onNavigateToSaved,
  onNavigateToCompleted,
  onNavigateToEdit,
  onRateItinerary,
  onLogout,
  onRefreshUser,
}) {
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allItineraries, setAllItineraries] = useState([]);

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

  // Load all itineraries from API
  const loadItineraries = async () => {
    setIsLoading(true);
    try {
      console.log("=== DEBUG: Loading itineraries for ViewItineraryPage ===");

      const response = await fetch(`${API_URL}/api/itineraries`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      console.log("API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("=== DEBUG: Raw API response ===", data);

        let itinerariesFromDB = [];

        // Handle different API response structures
        if (Array.isArray(data)) {
          itinerariesFromDB = data;
        } else if (data && Array.isArray(data.itineraries)) {
          itinerariesFromDB = data.itineraries;
        } else if (data && Array.isArray(data.data)) {
          itinerariesFromDB = data.data;
        } else {
          console.error("Unexpected API response structure:", data);
          itinerariesFromDB = [];
        }

        // Process and format itinerary data with proper destination handling
        const processedItineraries = itinerariesFromDB.map((itinerary) => {
          // Process destinations to ensure consistent format
          let processedDestinations = [];
          if (itinerary.destinations) {
            if (Array.isArray(itinerary.destinations)) {
              processedDestinations = itinerary.destinations.map((dest) => ({
                ...dest,
                lat:
                  parseFloat(dest.lat) || parseFloat(dest.latitude) || 40.7831,
                lng:
                  parseFloat(dest.lng) ||
                  parseFloat(dest.longitude) ||
                  -73.9712,
                id: dest.id || Math.random().toString(36).substr(2, 9),
              }));
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

          return {
            ...itinerary,
            tags: processTags(itinerary.tags),
            title: itinerary.title || "Untitled Itinerary",
            description: itinerary.description || "No description",
            duration: itinerary.duration || "1 day",
            price: itinerary.price || "$$",
            rating: itinerary.rating || 0,
            destinations: processedDestinations, // Use processed destinations
            createdBy: itinerary.authorid,
            authorid: itinerary.authorid,
            authorname: itinerary.authorname || "Unknown",
          };
        });

        console.log("=== DEBUG: Processed itineraries ===");
        processedItineraries.forEach((it, index) => {
          console.log(`Processed ${index}:`, {
            id: it.id,
            title: it.title,
            destinationsCount: it.destinations.length,
            destinations: it.destinations,
            rating: it.rating,
          });
        });

        setAllItineraries(processedItineraries);

        // Find the specific itinerary we're looking for
        if (itinerary && itinerary.id) {
          const foundItinerary = processedItineraries.find(
            (it) => it.id === itinerary.id
          );
          if (foundItinerary) {
            console.log("Found itinerary in API data:", foundItinerary);
            setCurrentItinerary(foundItinerary);
          } else {
            console.log("Itinerary not found in API data, using passed data");
            setCurrentItinerary(itinerary);
          }
        } else {
          console.log("No itinerary ID provided, using passed data");
          setCurrentItinerary(itinerary);
        }
      } else {
        console.error(
          "Failed to fetch itineraries from server, status:",
          response.status
        );
        // Fallback to passed itinerary data
        setCurrentItinerary(itinerary);
      }
    } catch (error) {
      console.error("Error loading itineraries from server:", error);
      // Fallback to passed itinerary data
      setCurrentItinerary(itinerary);
    } finally {
      setIsLoading(false);
    }
  };

  // Load itineraries on component mount
  useEffect(() => {
    loadItineraries();
  }, [itinerary]);

  // Lifted rating handler
  const handleRateItinerary = async (id, rating) => {
    if (!onRateItinerary) return;

    try {
      const updated = await onRateItinerary(id, rating);

      // Update local state to trigger re-render
      setCurrentItinerary((prev) => ({
        ...prev,
        rating: updated?.overallRating ?? prev.rating,
      }));

      return updated;
    } catch (err) {
      console.error("Error updating rating:", err);
      return null;
    }
  };

  // Map destinations for map display
  const mapDestinations = currentItinerary?.destinations || [];

  console.log("ViewItineraryPage - Final state:", {
    currentItinerary,
    mapDestinations,
    destinationsCount: mapDestinations.length,
    isLoading,
  });

  if (isLoading) {
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
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(113, 193, 157, 0.3) 0%, rgba(113, 193, 157, 0.5) 100%)",
              borderRadius: "16px",
              color: "white",
            }}
          >
            Loading itinerary...
          </div>
        </div>
        <div className="sidebar-container">
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#525252",
            }}
          >
            Loading itinerary details...
          </div>
        </div>
      </div>
    );
  }

  if (!currentItinerary) {
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
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(113, 193, 157, 0.3) 0%, rgba(113, 193, 157, 0.5) 100%)",
              borderRadius: "16px",
              color: "white",
            }}
          >
            Itinerary not found
          </div>
        </div>
        <div className="sidebar-container">
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#525252",
            }}
          >
            <h2>Itinerary Not Found</h2>
            <p>The requested itinerary could not be loaded.</p>
            <button className="save-btn" onClick={onBack}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <Map selectedDestinations={mapDestinations} isViewMode={true} />
      </div>

      <div className="sidebar-container">
        <ViewItinerarySidebar
          itinerary={currentItinerary}
          onBack={onBack}
          user={user}
          onNavigateToEdit={onNavigateToEdit}
          onRateItinerary={handleRateItinerary}
          onRefreshUser={onRefreshUser}
        />
      </div>
    </div>
  );
}

export default ViewItineraryPage;
