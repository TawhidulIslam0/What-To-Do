// CreateItinerarySidebar.js
import React, { useState } from "react";
import "./CreateItinerarySidebar.css";
import "./FormStyles.css";
import ItineraryForm from "./ItineraryForm";
import DestinationManager from "./DestinationManager";
import TagsManager from "./TagsManager";
import API_URL from "../../config";

function CreateItinerarySidebar({
  onStartLocationSelection,
  isSelectingLocation,
  onItinerarySave,
  onItineraryCancel,
  itineraryData,
  onUpdate,
  user,
  showError,
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
    title: itineraryData?.title || localItineraryData.title,
    description: itineraryData?.description || localItineraryData.description,
    tags: itineraryData?.tags || localItineraryData.tags,
    duration: itineraryData?.duration || localItineraryData.duration,
    price: itineraryData?.price || localItineraryData.price,
    destinations:
      itineraryData?.destinations || localItineraryData.destinations,
    rating: itineraryData?.rating || localItineraryData.rating,
    rating_count:
      itineraryData?.rating_count || localItineraryData.rating_count,
    total_rating:
      itineraryData?.total_rating || localItineraryData.total_rating,
  };

  // Error handling function
  const handleShowError = (message, type = "error") => {
    if (typeof showError === "function") {
      showError(message, type);
    } else {
      console.log(`${type}: `, message);
    }
  };

  // Handle saving itinerary to server
  const handleSave = async () => {
    console.log("Saving itinerary with data:", actualItineraryData);

    if (!user || !user.id) {
      handleShowError(
        "You must be logged in to create an itinerary.",
        "warning"
      );
      return;
    }

    const title = actualItineraryData.title || "";
    const destinations = actualItineraryData.destinations || [];

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
      const res = await fetch(`${API_URL}/api/create-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: actualItineraryData.title,
          description: actualItineraryData.description,
          tags: JSON.stringify(actualItineraryData.tags || []),
          duration: actualItineraryData.duration,
          price: actualItineraryData.price,
          rating: actualItineraryData.rating,
          rating_count: actualItineraryData.rating_count,
          total_rating: actualItineraryData.total_rating,
          destinations: JSON.stringify(actualItineraryData.destinations || []),
        }),
      });
      console.log(res.body.destinations);
      if (res.ok) {
        const response = await res.json();
        console.log("Itinerary saved to server:", response);

        if (response.ok && response.itineraryId) {
          const newItinerary = {
            id: response.itineraryId,
            title: actualItineraryData.title,
            description: actualItineraryData.description,
            tags: actualItineraryData.tags || [],
            duration: actualItineraryData.duration,
            price: actualItineraryData.price,
            destinations: actualItineraryData.destinations || [],
            rating: 0,
            rating_count: 0,
            total_rating: 0,
            createdAt: new Date().toISOString(),
            createdBy: user.id,
            authorid: user.id,
            authorname: user.display_name,
          };

          console.log("Calling onItinerarySave with:", newItinerary);
          onItinerarySave(newItinerary);
          handleShowError("Itinerary created successfully!", "success");

          // Reset form data after successful save
          setLocalItineraryData({
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
        } else {
          throw new Error("Invalid response from server");
        }
      } else if (res.status === 401) {
        handleShowError(
          "You must be logged in to create an itinerary.",
          "warning"
        );
      } else {
        console.error("Failed to save itinerary to server");
        handleShowError(
          "Failed to save itinerary to server. Please try again.",
          "error"
        );
      }
    } catch (err) {
      console.error("Error saving itinerary to server:", err);
      handleShowError(
        "Error saving itinerary. Please check your connection and try again.",
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
    actualItineraryData.destinations?.length > 0;

  return (
    <div className="create-itinerary-sidebar">
      <div className="create-header">
        <h1>Create New Itinerary</h1>
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
        <button className="save-btn" onClick={handleSave} disabled={!canSave}>
          Create Itinerary ({(actualItineraryData.destinations || []).length}{" "}
          destinations)
        </button>
      </div>

      <div className="scroll-spacer"></div>
    </div>
  );
}

export default CreateItinerarySidebar;
