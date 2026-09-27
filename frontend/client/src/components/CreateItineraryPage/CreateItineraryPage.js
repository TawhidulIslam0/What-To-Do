// CreateItineraryPage.js
import React, { useState } from "react";
import Header from "../HomePage/Header";
import Map from "../HomePage/Map";
import CreateItinerarySidebar from "./CreateItinerarySidebar";
import "../HomePage/HomePage.css";

function CreateItineraryPage({
  onBack,
  user,
  onNavigateToProfile,
  onNavigateToHome,
  onNavigateToCreated,
  onNavigateToSaved,
  onLogout,
  showError,
}) {
  // State for location selection mode and itinerary data
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [itineraryData, setItineraryData] = useState({
    title: "",
    description: "",
    tags: [],
    duration: "1 day",
    price: "$$",
    customTag: "",
    destinations: [],
  });

  console.log("CreateItineraryPage state:", {
    isSelectingLocation,
    itineraryData,
  });

  // Navigation handler
  const handleNavigateToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  // Start location selection mode on map
  const handleStartLocationSelection = () => {
    console.log("Starting location selection");
    setIsSelectingLocation(true);
  };

  // Handle location selection from map click
  const handleLocationSelected = (location) => {
    console.log("Location selected in CreateItineraryPage:", location);

    const newDestination = {
      id: Date.now() + Math.random(),
      name: location.name || "Selected Location",
      address:
        location.address ||
        `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      lat: location.lat,
      lng: location.lng,
      order: itineraryData.destinations.length,
      rating: null,
    };

    console.log("New destination created:", newDestination);

    setItineraryData((prev) => ({
      ...prev,
      destinations: [...prev.destinations, newDestination],
    }));

    setIsSelectingLocation(false);
  };

  // Cancel location selection mode
  const handleCancelLocationSelection = () => {
    console.log("Location selection canceled by clicking outside map");
    setIsSelectingLocation(false);
  };

  // Handle saving the completed itinerary
  const handleItinerarySave = (itineraryData) => {
    console.log("Saving itinerary in parent:", itineraryData);

    setItineraryData({
      title: "",
      description: "",
      tags: [],
      duration: "1 day",
      price: "$$",
      customTag: "",
      destinations: [],
    });
    setIsSelectingLocation(false);

    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  // Handle canceling itinerary creation
  const handleItineraryCancel = () => {
    console.log("Canceling itinerary creation");
    setItineraryData({
      title: "",
      description: "",
      tags: [],
      duration: "1 day",
      price: "$$",
      customTag: "",
      destinations: [],
    });
    setIsSelectingLocation(false);

    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  // Update specific field in itinerary data
  const updateItineraryData = (field, value) => {
    console.log("Updating itinerary data:", field, value);
    setItineraryData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update destination information
  const handleUpdateDestination = (destinationId, updates) => {
    console.log("Updating destination location:", destinationId, updates);
    const updatedDestinations = itineraryData.destinations.map((dest) =>
      dest.id === destinationId ? { ...dest, ...updates } : dest
    );
    setItineraryData((prev) => ({
      ...prev,
      destinations: updatedDestinations,
    }));
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
          onLogout={onLogout}
        />
        <Map
          onLocationSelect={handleLocationSelected}
          isSelectingMode={isSelectingLocation}
          selectedDestinations={itineraryData.destinations}
          onUpdateDestination={handleUpdateDestination}
          onCancelSelection={handleCancelLocationSelection}
        />
      </div>

      <div className="sidebar-container">
        <CreateItinerarySidebar
          onStartLocationSelection={handleStartLocationSelection}
          isSelectingLocation={isSelectingLocation}
          onItinerarySave={handleItinerarySave}
          onItineraryCancel={handleItineraryCancel}
          itineraryData={itineraryData}
          onUpdate={updateItineraryData}
          user={user}
          showError={showError}
        />
      </div>
    </div>
  );
}

export default CreateItineraryPage;