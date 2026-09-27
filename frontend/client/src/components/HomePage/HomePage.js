// HomePage.js
import React, { useState, useEffect } from "react";
import Header from "./Header";
import Map from "./Map";
import Sidebar from "./Sidebar";
import "./HomePage.css";
import API_URL from "../../config";

const LS_KEY = "rated_itins";
const getMap = () => JSON.parse(localStorage.getItem(LS_KEY) || "{}");
const setMap = (m) => localStorage.setItem(LS_KEY, JSON.stringify(m));

function hasRatedLocal(userId, itineraryId) {
  const u = String(userId || "anon");
  const m = getMap();
  return !!m[u]?.[String(itineraryId)];
}

function markRatedLocal(userId, itineraryId) {
  const u = String(userId || "anon");
  const m = getMap();
  m[u] = m[u] || {};
  m[u][String(itineraryId)] = true;
  setMap(m);
}

function HomePage({
  onBack,
  user,
  onNavigateToProfile,
  onNavigateToCreate,
  onViewItinerary,
  onNavigateToCreated,
  onNavigateToSaved,
  onNavigateToCompleted,
  onNavigateToHome,
  showError,
  onLogout,
  onRateItinerary: externalRateHandler,
}) {
  // State for selected destinations and itineraries
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [allItineraries, setAllItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratedMap, setRatedMap] = useState({});
  const [ratingBusy, setRatingBusy] = useState(false);

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

  // Handle rating an itinerary
  const handleRateItinerary = async (
    itineraryId,
    rating,
    rating_count,
    total_rating
  ) => {
    if (ratedMap[itineraryId]) {
      showError?.("You've already rated this itinerary", "info");
      return;
    }

    setRatingBusy(true);
    try {
      // If there's an external (lifted) handler provided by App, call it and
      // then reload itineraries locally to refresh the list.
      if (typeof externalRateHandler === "function") {
        const updated = await externalRateHandler(itineraryId, rating);
        // Mark locally and refresh list so homepage cards show updated values
        markRatedLocal(user?.id, itineraryId);
        setRatedMap((m) => ({ ...m, [itineraryId]: true }));
        await loadItineraries();
        showError?.(`Thanks for your ${rating}-star rating!`, "success");
        return updated;
      }

      const payload = {
        id: Number(itineraryId),
        rating: Number(rating),
        rating_count: Number(rating_count),
        total_rating: Number(total_rating),
      };

      const res = await fetch(`${API_URL}/api/give-rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        if (res.status === 409) {
          // Server says already rated → lock locally too
          markRatedLocal(user?.id, itineraryId);
          setRatedMap((m) => ({ ...m, [itineraryId]: true }));
          showError?.("You've already rated this itinerary.", "info");
          return;
        }
        showError?.(
          `Failed to submit rating (${res.status}). ${
            msg || "Please try again."
          }`,
          "error"
        );
        return;
      }

      await res.json();

      // Success → remember locally and disable UI
      markRatedLocal(user?.id, itineraryId);
      setRatedMap((m) => ({ ...m, [itineraryId]: true }));

      loadItineraries?.();
      showError?.(`Thanks for your ${payload.rating}-star rating!`, "success");
    } catch (err) {
      console.error("Error submitting rating:", err);
      showError?.(
        "Error submitting rating. Please check your connection.",
        "error"
      );
    } finally {
      setRatingBusy(false);
    }
  };

  // Load all itineraries from API
  const loadItineraries = async () => {
    setIsLoading(true);
    try {
      console.log("=== DEBUG: Loading itineraries ===");

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
          };
        });

        console.log("=== DEBUG: Processed itineraries with destinations ===");
        processedItineraries.forEach((it, index) => {
          console.log(`Processed ${index}:`, {
            id: it.id,
            title: it.title,
            destinationsCount: it.destinations.length,
            destinations: it.destinations,
          });
        });

        setAllItineraries(processedItineraries);

        const primed = {};
        for (const it of processedItineraries) {
          primed[it.id] = hasRatedLocal(user?.id, it.id);
        }
        setRatedMap(primed);
      } else {
        console.error(
          "Failed to fetch itineraries from server, status:",
          response.status
        );
        setAllItineraries([]);
        if (typeof showError === "function") {
          showError("Failed to load itineraries from server.");
        }
      }
    } catch (error) {
      console.error("Error loading itineraries from server:", error);
      setAllItineraries([]);
      if (typeof showError === "function") {
        showError("Error loading itineraries. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const handleNavigateToHome = () => {
    console.log("Already on homepage");
  };

  const handleCreateNew = () => {
    if (onNavigateToCreate) {
      onNavigateToCreate();
    }
  };

  const handleViewItinerary = (itinerary) => {
    console.log("Viewing itinerary from homepage:", itinerary);
    if (onViewItinerary) {
      onViewItinerary(itinerary);
    }
  };

  // Handler for clicking on itinerary card
  const handleItineraryClick = (itineraryId) => {
    console.log("Itinerary clicked in homepage:", itineraryId);
    const itinerary = allItineraries.find((item) => item.id === itineraryId);
    if (itinerary && onViewItinerary) {
      console.log("Found itinerary to view:", itinerary);
      onViewItinerary(itinerary);
    }
  };

  // Load itineraries on component mount
  useEffect(() => {
    loadItineraries();
  }, []);

  console.log("HomePage render - itineraries count:", allItineraries.length);

  return (
    <div className="homepage">
      <div className="main-left">
        {/* Header component with navigation */}
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
        {/* Map component displaying destinations */}
        <Map selectedDestinations={selectedDestinations} />
      </div>

      <div className="sidebar-container">
        {/* Sidebar with itinerary listings and actions */}
        <Sidebar
          title="Itineraries"
          placeholder="Search itineraries..."
          itineraries={allItineraries}
          isLoading={isLoading}
          currentUser={user}
          onRateItinerary={handleRateItinerary}
          onViewItinerary={handleViewItinerary}
          onCreateNew={handleCreateNew}
          onItineraryClick={handleItineraryClick}
          showCreateNew={true}
        />
      </div>
    </div>
  );
}

export default HomePage;
