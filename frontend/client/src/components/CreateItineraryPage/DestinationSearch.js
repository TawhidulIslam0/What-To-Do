// DestinationSearch.js
import React, { useState, useRef } from "react";
import "./DestinationSearch.css";

function DestinationSearch({
  onDestinationSelected,
  onMapSelection,
  onCancel,
}) {
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refs for DOM elements and Google Maps services
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  // Initialize Google Maps services
  const initializeServices = () => {
    if (!window.google) return;

    if (!autocompleteService.current) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
    }
    if (!placesService.current) {
      const map = new window.google.maps.Map(document.createElement("div"));
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  };

  // Handle search input changes
  const handleSearchChange = (query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    initializeServices();

    if (autocompleteService.current) {
      setIsSearching(true);

      const request = {
        input: query,
        types: ["establishment"],
      };

      // Get place predictions from Google Places API
      autocompleteService.current.getPlacePredictions(
        request,
        (predictions, status) => {
          setIsSearching(false);
          console.log("Search status:", status, "Results:", predictions);

          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSearchResults(predictions);
          } else {
            setSearchResults([]);
            if (status === "INVALID_REQUEST") {
              tryAlternativeSearch(query);
            }
          }
        }
      );
    }
  };

  // Fallback search method
  const tryAlternativeSearch = (query) => {
    if (!autocompleteService.current) return;

    const simpleRequest = {
      input: query,
    };

    autocompleteService.current.getPlacePredictions(
      simpleRequest,
      (predictions, status) => {
        console.log(
          "Alternative search status:",
          status,
          "Results:",
          predictions
        );

        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setSearchResults(predictions);
        }
      }
    );
  };

  // Handle selection of a search result
  const handleSelectSearchResult = (placePrediction) => {
    initializeServices();

    if (placesService.current) {
      // Get detailed place information
      placesService.current.getDetails(
        {
          placeId: placePrediction.place_id,
          fields: ["name", "formatted_address", "geometry", "types", "photos"],
        },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place
          ) {
            const newDestination = {
              id: Date.now() + Math.random(),
              name: place.name,
              address: place.formatted_address,
              placeId: placePrediction.place_id,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              types: place.types || [],
              order: 0,
            };

            onDestinationSelected(newDestination);
            setSearchResults([]);
          } else {
            // Fallback destination if details fetch fails
            const fallbackDestination = {
              id: Date.now() + Math.random(),
              name: placePrediction.structured_formatting.main_text,
              address: placePrediction.structured_formatting.secondary_text,
              placeId: placePrediction.place_id,
              lat: 40.7128,
              lng: -74.006,
              types: placePrediction.types || [],
              rating: null,
              order: 0,
            };
            onDestinationSelected(fallbackDestination);
            setSearchResults([]);
          }
        }
      );
    }
  };

  // Switch to map selection mode
  const handleMapSelection = () => {
    console.log("Map selection clicked in DestinationSearch");
    onMapSelection();
  };

  // Close search results when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="destination-search-mode" ref={searchContainerRef}>
      {/* Search header with close button */}
      <div className="search-header">
        <h4>Search for Destination</h4>
        <button className="close-search-btn" onClick={onCancel}>
          ×
        </button>
      </div>

      {/* Search input and results */}
      <div className="search-input-container">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for places in NYC..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input"
        />
        {/* Loading indicator */}
        {isSearching && <div className="search-loading">Searching...</div>}

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result) => (
              <div
                key={result.place_id}
                className="search-result-item"
                onClick={() => handleSelectSearchResult(result)}
              >
                <div className="result-details">
                  <div className="result-name">
                    {result.structured_formatting.main_text}
                  </div>
                  <div className="result-address">
                    {result.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* No results message */}
      {searchQuery.length >= 2 &&
        searchResults.length === 0 &&
        !isSearching && (
          <div className="no-results">
            No places found. Try a different search term.
          </div>
        )}

      {/* Map selection alternative */}
      <div className="search-options">
        <div className="option-divider">or</div>
        <button className="map-selection-btn" onClick={handleMapSelection}>
          Click on Map to Select Location
        </button>
      </div>
    </div>
  );
}

export default DestinationSearch;