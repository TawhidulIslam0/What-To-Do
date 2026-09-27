// src/components/EditItineraryPage/EditItinerarySidebar.js
import React, { useState } from "react";
import "../CreateItineraryPage/CreateItinerarySidebar.css";
import "../CreateItineraryPage/FormStyles.css";
import ItineraryForm from "../CreateItineraryPage/ItineraryForm";
import DestinationManager from "../CreateItineraryPage/DestinationManager";
import TagsManager from "../CreateItineraryPage/TagsManager";
import API_URL from "../../config";

// Helper function to ensure data is always an array
const ensureArray = (data) => {
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

function EditItinerarySidebar({
  onStartLocationSelection,
  isSelectingLocation,
  onItineraryUpdate,
  onItineraryCancel,
  itineraryData,
  onUpdate,
  user,
  showError,
  originalItinerary,
}) {
  // Local state for itinerary data if parent doesn't provide it
  const [localItineraryData, setLocalItineraryData] = useState({
    title: "",
    description: "",
    tags: [],
    duration: "1 day",
    price: "$$",
    rating: 0,
    rating_count: 0,
    total_rating: 0,
    destinations: [],
  });

  // Use parent data if available, otherwise use local state
  const actualItineraryData = {
    ...(itineraryData || localItineraryData),
    tags: ensureArray(itineraryData?.tags || localItineraryData.tags),
    destinations: ensureArray(
      itineraryData?.destinations || localItineraryData.destinations
    ),
  };

  console.log("EditItinerarySidebar data:", {
    actualItineraryData,
    destinationsType: typeof actualItineraryData.destinations,
    destinationsIsArray: Array.isArray(actualItineraryData.destinations),
    destinationsLength: actualItineraryData.destinations?.length,
  });

  // Error handling function
  const handleShowError = (message, type = "error") => {
    if (typeof showError === "function") {
      showError(message, type);
    } else {
      console.log(`${type}: `, message);
    }
  };

  // Handle updating itinerary on server
  const handleUpdate = async () => {
    console.log("Updating itinerary with data:", actualItineraryData);

    if (!user || !user.id) {
      handleShowError("You must be logged in to edit an itinerary.", "warning");
      return;
    }

    const title = actualItineraryData.title || "";
    const destinations = ensureArray(actualItineraryData.destinations);

    if (!title.trim()) {
      handleShowError("Please add a title for your itinerary.", "warning");
      return;
    }

    if (destinations.length === 0) {
      handleShowError(
        "Please add at least one destination to your itinerary.",
        "warning"
      );
      return;
    }

    try {
      console.log("Sending update request...");
      const res = await fetch(`${API_URL}/api/update-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: actualItineraryData.id,
          title: actualItineraryData.title,
          description: actualItineraryData.description,
          tags: JSON.stringify(actualItineraryData.tags || []),
          duration: actualItineraryData.duration,
          price: actualItineraryData.price,
          rating: actualItineraryData.rating || 0,
          rating_count: actualItineraryData.rating_count || 0,
          total_rating: actualItineraryData.total_rating || 0,
          destinations: JSON.stringify(actualItineraryData.destinations || []),
        }),
      });

      console.log("Update response status:", res.status);

      const response = await res.json();
      console.log("Update response:", response);

      if (res.ok && response.ok) {
        const updatedItinerary = {
          ...actualItineraryData,
          updatedAt: new Date().toISOString(),
        };

        console.log("Calling onItineraryUpdate with:", updatedItinerary);
        onItineraryUpdate(updatedItinerary);
        handleShowError("Itinerary updated successfully!", "success");
      } else {
        // Handle specific error cases
        if (res.status === 401) {
          handleShowError(
            "You must be logged in to edit an itinerary.",
            "warning"
          );
        } else if (res.status === 403) {
          handleShowError("You can only edit your own itineraries.", "warning");
        } else if (response.errors && response.errors.length > 0) {
          handleShowError(response.errors[0], "error");
        } else {
          handleShowError(
            "Failed to update itinerary on server. Please try again.",
            "error"
          );
        }
      }
    } catch (err) {
      console.error("Network error updating itinerary:", err);
      handleShowError(
        "Error updating itinerary. Please check your connection and try again.",
        "error"
      );
    }
  };

  // Update itinerary data in parent or local state
  const updateItineraryData = (field, value) => {
    console.log("Updating itinerary data:", field, value);
    if (onUpdate) {
      onUpdate(field, value);
    } else {
      setLocalItineraryData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Check if itinerary can be saved (has title and destinations)
  const canSave =
    actualItineraryData.title?.trim() &&
    ensureArray(actualItineraryData.destinations).length > 0;

  return (
    <div className="create-itinerary-sidebar">
      <div className="create-header">
        <h1>Edit Itinerary</h1>
      </div>

      <div className="create-form-card">
        {/* Form for itinerary basic info (title, description, etc.) */}
        <ItineraryForm
          itineraryData={actualItineraryData}
          onUpdate={updateItineraryData}
        />

        {/* Component for managing destinations */}
        <DestinationManager
          itineraryData={actualItineraryData}
          onUpdate={updateItineraryData}
          onStartLocationSelection={onStartLocationSelection}
          isSelectingLocation={isSelectingLocation}
        />

        {/* Component for managing tags */}
        <TagsManager
          itineraryData={actualItineraryData}
          onUpdate={updateItineraryData}
        />
      </div>

      {/* Action buttons at bottom */}
      <div className="create-actions">
        <button className="cancel-btn" onClick={onItineraryCancel}>
          Cancel
        </button>
        <button className="save-btn" onClick={handleUpdate} disabled={!canSave}>
          Update Itinerary (
          {ensureArray(actualItineraryData.destinations).length} destinations)
        </button>
      </div>

      <div className="scroll-spacer"></div>
    </div>
  );
}

export default EditItinerarySidebar;
