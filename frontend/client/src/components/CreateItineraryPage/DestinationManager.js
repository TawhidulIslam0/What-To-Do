// DestinationManager.js
import React, { useState, useRef, useEffect } from "react";
import "./DestinationManager.css";
import DestinationSearch from "./DestinationSearch";
import DestinationsList from "./DestinationList";

function DestinationManager({
  itineraryData,
  onUpdate,
  onStartLocationSelection,
  isSelectingLocation,
}) {
  // Ensure destinations is always an array
  const safeDestinations = Array.isArray(itineraryData?.destinations) ? itineraryData.destinations : [];

  // State for current step and search visibility
  const [currentStep, setCurrentStep] = useState(1);
  const [showSearch, setShowSearch] = useState(false);

  console.log("DestinationManager props:", {
    destinations: safeDestinations,
    isSelectingLocation,
  });

  // Update current step based on number of destinations
  useEffect(() => {
    setCurrentStep(safeDestinations.length + 1);
  }, [safeDestinations.length]);

  // Show search interface for adding destinations
  const handleAddDestination = () => {
    console.log("Add destination clicked");
    setShowSearch(true);
  };

  // Handle when a destination is selected from search
  const handleDestinationSelected = (newDestination) => {
    console.log("Destination selected in manager:", newDestination);
    const updatedDestinations = [
      ...(itineraryData?.destinations || []),
      newDestination,
    ];
    onUpdate("destinations", updatedDestinations);
    setCurrentStep((prev) => prev + 1);
    setShowSearch(false);
  };

  // Remove a destination from the list
  const handleRemoveDestination = (destinationId) => {
    console.log("Removing destination:", destinationId);
    const updatedDestinations = (itineraryData?.destinations || []).filter(
      (dest) => dest.id !== destinationId
    );
    onUpdate("destinations", updatedDestinations);
    setCurrentStep(updatedDestinations.length + 1);
  };

  // Move destination up or down in the order
  const handleMoveDestination = (index, direction) => {
    console.log("Moving destination:", index, direction);
    const newDestinations = [...(itineraryData?.destinations || [])];
    const newIndex = index + direction;

    if (newIndex >= 0 && newIndex < newDestinations.length) {
      [newDestinations[index], newDestinations[newIndex]] = [
        newDestinations[newIndex],
        newDestinations[index],
      ];

      // Update order property for all destinations
      newDestinations.forEach((dest, idx) => {
        dest.order = idx;
      });

      onUpdate("destinations", newDestinations);
    }
  };

  // Update destination information (name, etc.)
  const handleUpdateDestination = (destinationId, updates) => {
    console.log("Updating destination:", destinationId, updates);
    const updatedDestinations = (itineraryData?.destinations || []).map(
      (dest) => (dest.id === destinationId ? { ...dest, ...updates } : dest)
    );
    onUpdate("destinations", updatedDestinations);
  };

  // Clear all destinations from the itinerary
  const handleClearDestinations = () => {
    console.log("Clearing all destinations");
    onUpdate("destinations", []);
    setCurrentStep(1);
  };

  // Switch to map selection mode
  const handleMapSelection = () => {
    console.log("Starting map selection from DestinationManager");
    onStartLocationSelection();
    setShowSearch(false);
  };

  // Cancel the search interface
  const cancelSearch = () => {
    console.log("Canceling search");
    setShowSearch(false);
  };

  return (
    <div className="input-group">
      <label className="form-label">Destinations</label>

      {/* Show either search interface or add button */}
      {!showSearch ? (
        <div className="destination-controls">
          <button
            className="add-destination-btn"
            onClick={handleAddDestination}
          >
            Add Destination
          </button>

          {/* Show clear button only when there are destinations */}
          {(itineraryData?.destinations?.length || 0) > 0 && (
            <button
              className="clear-destinations-btn"
              onClick={handleClearDestinations}
            >
              Clear All
            </button>
          )}
        </div>
      ) : (
        <DestinationSearch
          currentStep={currentStep}
          onDestinationSelected={handleDestinationSelected}
          onMapSelection={handleMapSelection}
          onCancel={cancelSearch}
        />
      )}

      {/* Display list of destinations */}
      <DestinationsList
        destinations={itineraryData?.destinations || []}
        onRemoveDestination={handleRemoveDestination}
        onMoveDestination={handleMoveDestination}
        onUpdateDestination={handleUpdateDestination}
      />
    </div>
  );
}

export default DestinationManager;
