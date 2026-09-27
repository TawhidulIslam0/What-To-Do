// src/components/UserProfilePage/ItineraryView.js
import React from "react";
import ItineraryCard from "../HomePage/ItineraryCard";
import "./ItineraryView.css";

const ItineraryView = ({
  activeTab,
  onTabClick,
  userItineraries = [],
  savedItineraries = [],
  completedItineraries = [],
  user,
  onViewItinerary,
  onNavigateToCreated,
  onNavigateToSaved,
  onNavigateToCompleted,
  onRateItinerary,
}) => {
  // Handle itinerary card click and pass data to parent component
  const handleItineraryClick = (itineraryId) => {
    console.log("Itinerary clicked in profile view:", itineraryId);

    // Search in both user itineraries and saved itineraries
    let itinerary = userItineraries.find((item) => item.id === itineraryId);
    if (!itinerary) {
      itinerary = savedItineraries.find((item) => item.id === itineraryId);
    }
    if (!itinerary) {
      itinerary = completedItineraries.find((item) => item.id === itineraryId);
    }

    if (itinerary && onViewItinerary) {
      console.log("Found itinerary to view from profile:", itinerary);
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

  // Handle "See More" button click based on active tab
  const handleSeeMore = () => {
    switch (activeTab) {
      case "itineraries":
        if (onNavigateToCreated) {
          onNavigateToCreated();
        }
        break;
      case "saved":
        if (onNavigateToSaved) {
          onNavigateToSaved();
        }
        break;
      case "completed":
        if (onNavigateToCompleted) {
          onNavigateToCompleted();
        }
        break;
      default:
        break;
    }
  };

  // Determine if "See More" button should be shown
  const shouldShowSeeMore = () => {
    switch (activeTab) {
      case "itineraries":
        return userItineraries.length > 3;
      case "saved":
        return savedItineraries.length > 3; // Check saved itineraries count
      case "completed":
        return completedItineraries.length > 3; // Check completed itineraries count
      default:
        return false;
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "itineraries":
        // Display user's created itineraries or empty state
        if (userItineraries.length === 0) {
          return (
            <div className="grid-placeholder">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z" />
              </svg>
              <p>You haven't created any itineraries yet.</p>
              <p
                style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "10px" }}
              ></p>
            </div>
          );
        }
        return (
          <div className="itineraries-grid">
            {userItineraries.slice(0, 3).map((itinerary) => (
              <div key={itinerary.id} className="itinerary-grid-item">
                <ItineraryCard
                  itineraryId={itinerary.id}
                  title={itinerary.title}
                  rating={itinerary.rating}
                  description={itinerary.description}
                  tags={itinerary.tags}
                  duration={itinerary.duration}
                  price={itinerary.price}
                  onClick={handleItineraryClick}
                  createdBy={itinerary.createdBy}
                  currentUser={user}
                  onRateItinerary={onRateItinerary}
                />
              </div>
            ))}
          </div>
        );

      case "saved":
        // Display saved itineraries or empty state
        if (savedItineraries.length === 0) {
          return (
            <div className="grid-placeholder">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              </svg>
              <p>No saved itineraries yet</p>
              <p
                style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "10px" }}
              >
                Save itineraries you like to find them here later
              </p>
            </div>
          );
        }
        return (
          <div className="itineraries-grid">
            {savedItineraries.slice(0, 3).map((itinerary) => (
              <div key={itinerary.id} className="itinerary-grid-item">
                <ItineraryCard
                  itineraryId={itinerary.id}
                  title={itinerary.title}
                  rating={itinerary.rating}
                  description={itinerary.description}
                  tags={itinerary.tags}
                  duration={itinerary.duration}
                  price={itinerary.price}
                  onClick={handleItineraryClick}
                  createdBy={itinerary.createdBy}
                  currentUser={user}
                  onRateItinerary={onRateItinerary}
                />
              </div>
            ))}
          </div>
        );

      case "completed":
        if (completedItineraries.length === 0) {
          return (
            <div className="grid-placeholder">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm5.04-11.28V8.7c-.4-.39-1.03-.39-1.42 0L10.33 14l-2.6-2.62a.996.996 0 0 0-1.41 0 .984.984 0 0 0-.01 1.4l.01.01 3.3 3.34a1 1 0 0 0 1.42.01l6-6.01a.996.996 0 0 0 0-1.41" />
              </svg>
              <p>No completed itineraries</p>
              <p
                style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "10px" }}
              >
                Mark itineraries as completed to see them here
              </p>
            </div>
          );
        }
        return (
          <div className="itineraries-grid">
            {completedItineraries.slice(0, 3).map((itinerary) => (
              <div key={itinerary.id} className="itinerary-grid-item">
                <ItineraryCard
                  itineraryId={itinerary.id}
                  title={itinerary.title}
                  rating={itinerary.rating}
                  description={itinerary.description}
                  tags={itinerary.tags}
                  duration={itinerary.duration}
                  price={itinerary.price}
                  onClick={handleItineraryClick}
                  createdBy={itinerary.createdBy}
                  currentUser={user}
                  onRateItinerary={onRateItinerary}
                />
              </div>
            ))}
          </div>
        );

      default:
        // Fallback for unknown tab
        return (
          <div className="grid-placeholder">
            <p>Select a tab to view content</p>
          </div>
        );
    }
  };

  return (
    <div className="itinerary-container">
      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${
            activeTab === "itineraries" ? "active" : ""
          }`}
          onClick={() => onTabClick("itineraries")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z" />
          </svg>
          Itineraries ({userItineraries.length})
        </button>
        <button
          className={`tab-button ${activeTab === "saved" ? "active" : ""}`}
          onClick={() => onTabClick("saved")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
          </svg>
          Saved ({savedItineraries.length}) {/* Updated count */}
        </button>
        <button
          className={`tab-button ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => onTabClick("completed")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm5.04-11.28V8.7c-.4-.39-1.03-.39-1.42 0L10.33 14l-2.6-2.62a.996.996 0 0 0-1.41 0 .984.984 0 0 0-.01 1.4l.01.01 3.3 3.34a1 1 0 0 0 1.42.01l6-6.01a.996.996 0 0 0 0-1.41" />
          </svg>
          Completed ({completedItineraries.length}) {/* Updated count */}
        </button>
      </div>

      {/* Dynamic Content Area */}
      <div className="content-grid">{renderContent()}</div>

      {/* See More Button - conditionally rendered */}
      {shouldShowSeeMore() && (
        <button className="see-more-button" onClick={handleSeeMore}>
          See More
        </button>
      )}
    </div>
  );
};

export default ItineraryView;
