// Map.js - Update the toArray function and add better destination processing
import React, { useState, useEffect } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import "./Map.css";

// Enhanced destination processing function
const processDestinationsForMap = (destinations) => {
  if (!destinations) return [];

  let processed = [];

  if (Array.isArray(destinations)) {
    processed = destinations
      .map((dest) => {
        // Handle both object format and string format
        if (typeof dest === "object" && dest !== null) {
          return {
            id:
              dest.id ||
              dest.place_id ||
              Math.random().toString(36).substr(2, 9),
            lat: parseFloat(dest.lat) || parseFloat(dest.latitude) || 40.7831,
            lng: parseFloat(dest.lng) || parseFloat(dest.longitude) || -73.9712,
            name: dest.name || dest.formatted_address || "Unknown Location",
            address:
              dest.address || dest.formatted_address || "Address not available",
            rating: dest.rating || null,
          };
        }
        return null;
      })
      .filter(Boolean);
  } else if (typeof destinations === "string") {
    try {
      const parsed = JSON.parse(destinations);
      if (Array.isArray(parsed)) {
        processed = processDestinationsForMap(parsed);
      }
    } catch (e) {
      console.warn("Failed to parse destinations string:", e);
    }
  }

  console.log("Processed destinations for map:", processed);
  return processed;
};

// Existing toArray function (keep this for backward compatibility)
const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Render function for different map loading states
const render = (status, props) => {
  switch (status) {
    case Status.LOADING:
      return <div className="map-loading">Loading Map...</div>;
    case Status.FAILURE:
      return <div className="map-error">Error loading map</div>;
    case Status.SUCCESS:
      return <MapComponent {...props} />;
    default:
      return null;
  }
};

function Map({
  onLocationSelect,
  isSelectingMode,
  selectedDestinations,
  onUpdateDestination,
  onCancelSelection,
  isViewMode = false, // Add view mode prop
}) {
  console.log("Map component props:", {
    isSelectingMode,
    selectedDestinationsCount: selectedDestinations?.length,
    isViewMode,
    selectedDestinations: selectedDestinations,
  });

  // Process destinations for the map
  const processedDestinations = processDestinationsForMap(selectedDestinations);

  return (
    <div className="map-container">
      <Wrapper
        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        render={(status) =>
          render(status, {
            onLocationSelect,
            isSelectingMode,
            selectedDestinations: processedDestinations, // Use processed destinations
            onUpdateDestination,
            onCancelSelection,
            isViewMode,
          })
        }
        libraries={["places"]}
      ></Wrapper>
    </div>
  );
}

// Main map component with Google Maps functionality
const MapComponent = ({
  onLocationSelect,
  isSelectingMode,
  selectedDestinations,
  onUpdateDestination,
  onCancelSelection,
  isViewMode = false,
}) => {
  const ref = React.useRef(null);
  const [map, setMap] = React.useState(null);
  const [markers, setMarkers] = React.useState([]);
  const [clickListener, setClickListener] = React.useState(null);

  const destinations = React.useMemo(
    () => selectedDestinations || [],
    [selectedDestinations]
  );

  console.log("MapComponent state:", {
    isSelectingMode,
    destinationsCount: destinations.length,
    destinations: destinations,
    isViewMode,
  });

  // Clear all markers from the map
  const clearMarkers = () => {
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);
  };

  // Add a marker for a destination
  const addDestinationMarker = (destination) => {
    if (!map) return;

    console.log("Adding marker for destination:", destination);

    const marker = new window.google.maps.Marker({
      position: { lat: destination.lat, lng: destination.lng },
      map: map,
      title: destination.name,
      draggable: isViewMode, // Only draggable in view mode for editing
      icon: {
        url:
          "data:image/svg+xml;base64," +
          btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <path fill="#E71D36" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
        scaledSize: new window.google.maps.Size(32, 32),
      },
    });

    // Handle marker dragging to update location (only in view mode)
    if (isViewMode && onUpdateDestination) {
      marker.addListener("dragend", (e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();

        console.log("Marker dragged to:", newLat, newLng);
        console.log("Original destination name:", destination.name);

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: newLat, lng: newLng } },
          (results, status) => {
            if (status === "OK" && results[0]) {
              const newAddress = results[0].formatted_address;

              console.log("Updated location - preserving name:", {
                preservedName: destination.name,
                newAddress,
                newLat,
                newLng,
              });

              onUpdateDestination(destination.id, {
                lat: newLat,
                lng: newLng,
                address: newAddress,
              });
            } else {
              console.log(
                "Geocoding failed, using coordinates - preserving name:",
                destination.name
              );
              onUpdateDestination(destination.id, {
                lat: newLat,
                lng: newLng,
                address: `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`,
              });
            }
          }
        );
      });
    }

    // Add info window for marker details
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 12px; font-family: Arial, sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #71C19D; font-weight: 600; font-size: 14px;">${
            destination.name
          }</h3>
          <p style="margin: 0; color: #666; font-size: 12px; font-weight: 300;">${
            destination.address
          }</p>
          ${
            isViewMode
              ? '<p style="margin: 4px 0 0 0; color: #999; font-size: 11px; font-weight: 300; font-style: italic;">Drag to move this marker</p>'
              : ""
          }
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    setMarkers((prev) => [...prev, marker]);
    return marker;
  };

  // Handle map clicks for location selection
  const handleMapClick = (e) => {
    console.log("Map clicked!", e.latLng.lat(), e.latLng.lng());
    console.log("isSelectingMode:", isSelectingMode);
    console.log("onLocationSelect function:", onLocationSelect);

    if (isSelectingMode && onLocationSelect) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      console.log("Selected location:", lat, lng);

      const immediateMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        icon: {
          url:
            "data:image/svg+xml;base64," +
            btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <path fill="#E71D36" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      });

      // Geocode the clicked location to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        console.log("Geocoding status:", status);

        if (status === "OK" && results[0]) {
          const address = results[0].formatted_address;
          const placeName =
            results[0].address_components.find(
              (comp) =>
                comp.types.includes("establishment") ||
                comp.types.includes("point_of_interest") ||
                comp.types.includes("park")
            )?.long_name ||
            results[0].address_components[0]?.long_name ||
            "Selected Location";

          console.log("Geocoded location:", { placeName, address, lat, lng });

          onLocationSelect({
            lat,
            lng,
            address,
            name: placeName,
          });
        } else {
          console.error("Geocoding failed:", status);
          const fallbackLocation = {
            lat,
            lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            name: "Selected Location",
          };

          console.log("Using fallback location:", fallbackLocation);

          onLocationSelect(fallbackLocation);
        }

        immediateMarker.setMap(null);
      });
    } else {
      console.log("Map click ignored - not in selection mode or no callback");
    }
  };

  // Handle clicks outside the map to cancel selection
  const handleOutsideClick = (e) => {
    if (
      ref.current &&
      !ref.current.contains(e.target) &&
      isSelectingMode &&
      onCancelSelection
    ) {
      console.log("Clicked outside map - canceling selection mode");
      onCancelSelection();
    }
  };

  // Initialize the map
  React.useEffect(() => {
    if (ref.current && !map) {
      console.log("Initializing map centered on Manhattan...");
      const newMap = new window.google.maps.Map(ref.current, {
        center: { lat: 40.7831, lng: -73.9712 },
        zoom: 12,
        disableDefaultUI: false,
        gestureHandling: "greedy",
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
      });

      setMap(newMap);

      window.google.maps.event.addListenerOnce(newMap, "tilesloaded", () => {
        console.log("Map tiles loaded - aggressively fixing pointer events");
        const mapDiv = ref.current;
        if (mapDiv) {
          const fixMapInteraction = () => {
            const overlays = mapDiv.querySelectorAll(
              'div[style*="pointer-events: none"][style*="z-index: 1000002"]'
            );
            overlays.forEach((overlay) => {
              console.log("Removing blocking overlay:", overlay);
              overlay.remove();
            });

            const allElements = mapDiv.querySelectorAll("*");
            allElements.forEach((el) => {
              if (el.style.pointerEvents === "none") {
                el.style.pointerEvents = "auto";
              }
            });
          };

          fixMapInteraction();
          setTimeout(fixMapInteraction, 100);
          setTimeout(fixMapInteraction, 500);
          setTimeout(fixMapInteraction, 1000);

          const observer = new MutationObserver(() => {
            fixMapInteraction();
          });

          observer.observe(mapDiv, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style"],
          });

          newMap.setOptions({
            draggable: true,
            scrollwheel: true,
            disableDoubleClickZoom: false,
            gestureHandling: "greedy",
          });
        }
      });
    }
  }, [ref, map]);

  // Handle selection mode and click listeners
  React.useEffect(() => {
    if (!map) return;

    console.log("Updating click listener for selection mode:", isSelectingMode);

    if (clickListener) {
      window.google.maps.event.removeListener(clickListener);
      setClickListener(null);
    }

    if (isSelectingMode) {
      const newClickListener = map.addListener("click", handleMapClick);
      setClickListener(newClickListener);

      document.addEventListener("mousedown", handleOutsideClick);
    }

    // Update cursor using CSS class instead of inline style
    if (ref.current) {
      if (isSelectingMode) {
        ref.current.classList.add("selecting-mode");
      } else {
        ref.current.classList.remove("selecting-mode");
      }
    }

    return () => {
      if (clickListener) {
        window.google.maps.event.removeListener(clickListener);
      }
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [map, isSelectingMode, onCancelSelection]);

  // Update markers when destinations change
  React.useEffect(() => {
    if (!map) return;

    console.log("Updating markers for destinations:", destinations);

    clearMarkers();

    if (destinations.length > 0) {
      destinations.forEach((destination) => {
        addDestinationMarker(destination);
      });

      // Adjust map view to show all markers
      if (destinations.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        destinations.forEach((destination) => {
          bounds.extend({ lat: destination.lat, lng: destination.lng });
        });
        map.fitBounds(bounds);

        const listener = window.google.maps.event.addListenerOnce(
          map,
          "bounds_changed",
          () => {
            if (map.getZoom() > 17) map.setZoom(17);
          }
        );
      } else if (destinations.length === 1) {
        map.setCenter({
          lat: destinations[0].lat,
          lng: destinations[0].lng,
        });
        map.setZoom(14);
      }
    } else {
      // Reset to default view if no destinations
      map.setCenter({ lat: 40.7831, lng: -73.9712 });
      map.setZoom(12);
    }
  }, [destinations, map, onUpdateDestination, isViewMode]);

  return (
    <div className="map-component-wrapper">
      {/* Selection mode hint */}
      {isSelectingMode && (
        <div className="map-selection-hint">
          <div className="selection-hint-content">
            <div className="hint-text">
              <div className="hint-subtitle">Click anywhere on the map</div>
            </div>
          </div>
        </div>
      )}
      <div ref={ref} className="google-map" />
    </div>
  );
};

export default Map;
