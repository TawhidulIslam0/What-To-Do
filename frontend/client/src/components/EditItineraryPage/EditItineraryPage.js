// src/components/EditItineraryPage/EditItineraryPage.js
import React, { useState } from "react";
import Header from "../HomePage/Header";
import Map from "../HomePage/Map";
import EditItinerarySidebar from "./EditItinerarySidebar";
import "../HomePage/HomePage.css";

// Helper function to ensure destinations are always arrays
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

function EditItineraryPage({
    onBack,
    user,
    onNavigateToProfile,
    onNavigateToHome,
    onNavigateToCreated,
    onNavigateToSaved,
    onLogout,
    showError,
    itinerary,
}) {
    // State for location selection mode and itinerary data
    const [isSelectingLocation, setIsSelectingLocation] = useState(false);
    const [itineraryData, setItineraryData] = useState({
        id: itinerary?.id || "",
        title: itinerary?.title || "",
        description: itinerary?.description || "",
        tags: Array.isArray(itinerary?.tags) ? itinerary.tags : (typeof itinerary?.tags === 'string' ? JSON.parse(itinerary.tags) : []),
        duration: itinerary?.duration || "1 day",
        price: itinerary?.price || "$$",
        customTag: "",
        destinations: ensureArray(itinerary?.destinations),
        rating: itinerary?.rating || 0,
        rating_count: itinerary?.rating_count || 0,
        total_rating: itinerary?.total_rating || 0,
    });

    console.log("EditItineraryPage state:", {
        isSelectingLocation,
        itineraryData,
        destinationsType: typeof itineraryData.destinations,
        destinationsIsArray: Array.isArray(itineraryData.destinations)
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
        console.log("Location selected in EditItineraryPage:", location);

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

    // Handle saving the updated itinerary
    const handleItineraryUpdate = (updatedItineraryData) => {
        console.log("Updating itinerary in parent:", updatedItineraryData);

        if (onBack) {
            onBack(); // Go back to view page after successful update
        }
    };

    // Handle canceling itinerary editing
    const handleItineraryCancel = () => {
        console.log("Canceling itinerary editing");

        if (onBack) {
            onBack(); // Go back to view page
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
                <EditItinerarySidebar
                    onStartLocationSelection={handleStartLocationSelection}
                    isSelectingLocation={isSelectingLocation}
                    onItineraryUpdate={handleItineraryUpdate}
                    onItineraryCancel={handleItineraryCancel}
                    itineraryData={itineraryData}
                    onUpdate={updateItineraryData}
                    user={user}
                    showError={showError}
                    originalItinerary={itinerary}
                />
            </div>
        </div>
    );
}

export default EditItineraryPage;