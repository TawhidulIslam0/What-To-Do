// CompletedItinerariesPage.js
import React, { useState, useEffect } from "react";
import Header from "../HomePage/Header";
import Map from "../HomePage/Map";
import "../HomePage/HomePage.css";
import API_URL from "../../config";

function CompletedItinerariesPage({
  onBack,
  user,
  onNavigateToProfile,
  onNavigateToHome,
  onViewItinerary,
  onNavigateToSaved,
  onNavigateToCreated,
  onNavigateToCompleted,
  onLogout,
  showError,
}) {
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [completedItineraries, setCompletedItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const processTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
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

  const processDestinations = (destinations) => {
    if (!destinations) return [];

    let processedDestinations = [];

    if (Array.isArray(destinations)) {
      processedDestinations = destinations.map((dest) => ({
        ...dest,
        lat: parseFloat(dest.lat) || parseFloat(dest.latitude) || 40.7831,
        lng: parseFloat(dest.lng) || parseFloat(dest.longitude) || -73.9712,
        id: dest.id || Math.random().toString(36).substr(2, 9),
      }));
    } else if (typeof destinations === "string") {
      try {
        const parsed = JSON.parse(destinations);
        if (Array.isArray(parsed)) {
          processedDestinations = parsed.map((dest) => ({
            ...dest,
            lat: parseFloat(dest.lat) || parseFloat(dest.latitude) || 40.7831,
            lng: parseFloat(dest.lng) || parseFloat(dest.longitude) || -73.9712,
            id: dest.id || Math.random().toString(36).substr(2, 9),
          }));
        }
      } catch (e) {
        console.warn("Failed to parse destinations:", e);
      }
    }

    return processedDestinations;
  };

  useEffect(() => {
    loadCompletedItineraries();
  }, [user]);
  const loadCompletedItineraries = async () => {
    setIsLoading(true);
    try {
      // fetch completed itineraries from server
      const resp = await fetch(`${API_URL}/api/my-completed-itineraries`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!resp.ok) {
        console.error("Failed to fetch completed itineraries from server");
        setCompletedItineraries([]);
        if (showError)
          showError("Failed to load completed itineraries from server.");
        return;
      }

      const data = await resp.json();
      // server returns full itinerary objects in `itineraries`
      let received = [];
      if (data && Array.isArray(data.itineraries)) {
        received = data.itineraries;
      } else if (data && Array.isArray(data)) {
        received = data;
      }

      const processedItineraries = received.map((itinerary) => {
        const processedDestinations = processDestinations(
          itinerary.destinations || itinerary.destinations
        );
        const ratingValue = parseFloat(itinerary.rating) || 0;

        return {
          ...itinerary,
          tags: processTags(itinerary.tags),
          title: itinerary.title || "Untitled Itinerary",
          description: itinerary.description || "",
          duration: itinerary.duration || "1 day",
          price: itinerary.price || "$$",
          rating: ratingValue,
          destinations: processedDestinations,
          createdBy: itinerary.authorid,
          authorid: itinerary.authorid,
        };
      });

      setCompletedItineraries(processedItineraries);
    } catch (error) {
      console.error("Error loading completed itineraries from server:", error);
      setCompletedItineraries([]);
      if (showError)
        showError(
          "Failed to load completed itineraries. Please check your connection."
        );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const handleViewItinerary = (itinerary) => {
    if (onViewItinerary) {
      onViewItinerary(itinerary);
    }
  };

  const CompletedItinerariesSidebar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
      minRating: 0,
      tags: [],
      maxDuration: "",
      maxPrice: "",
    });

    const handleSearch = (e) => setSearchTerm(e.target.value);
    const handleFilterClick = () => setShowFilterModal(true);
    const handleApplyFilters = (newFilters) => {
      setFilters(newFilters);
      setShowFilterModal(false);
    };
    const handleCloseFilter = () => setShowFilterModal(false);
    const handleClearFilters = () =>
      setFilters({
        minRating: 0,
        tags: [],
        maxDuration: "",
        maxPrice: "",
      });

    const handleItineraryClick = (itineraryId) => {
      const itinerary = filteredItineraries.find(
        (item) => item.id === itineraryId
      );
      if (itinerary) handleViewItinerary(itinerary);
    };

    const durationToHours = (duration) => {
      if (!duration) return 0;
      if (typeof duration !== "string") return 0;
      if (duration.includes("hour")) return parseInt(duration) || 0;
      if (duration.includes("day")) return (parseInt(duration) || 1) * 24;
      return 0;
    };

    const priceToNumber = (price) => {
      if (!price) return 0;
      if (typeof price !== "string") return 0;
      return price.length;
    };

    const filteredItineraries = completedItineraries.filter((itinerary) => {
      const matchesSearch =
        searchTerm === "" ||
        (itinerary.title &&
          itinerary.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (itinerary.description &&
          itinerary.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesRating = (itinerary.rating || 0) >= (filters.minRating || 0);

      const itineraryTags = itinerary.tags || [];
      const filterTags = filters.tags || [];
      const matchesTags =
        filterTags.length === 0 ||
        filterTags.some((tag) => itineraryTags.includes(tag));

      let matchesDuration = true;
      if (filters.maxDuration) {
        matchesDuration =
          durationToHours(itinerary.duration) <=
          durationToHours(filters.maxDuration);
      }

      let matchesPrice = true;
      if (filters.maxPrice) {
        matchesPrice =
          priceToNumber(itinerary.price) <= priceToNumber(filters.maxPrice);
      }

      return (
        matchesSearch &&
        matchesRating &&
        matchesTags &&
        matchesDuration &&
        matchesPrice
      );
    });

    const hasActiveFilters =
      filters.minRating > 0 ||
      (filters.tags && filters.tags.length > 0) ||
      filters.maxDuration ||
      filters.maxPrice;

    return (
      <div className="sidebar">
        <h1>My Completed Itineraries</h1>

        <div className="search-filter">
          <input
            type="text"
            placeholder="Search completed itineraries..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button onClick={handleFilterClick}>
            Filter {hasActiveFilters && "•"}
          </button>
        </div>

        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}

        {isLoading ? (
          <div className="no-results">Loading completed itineraries...</div>
        ) : filteredItineraries.length === 0 ? (
          <div className="no-results">
            {completedItineraries.length === 0
              ? "You haven't completed any itineraries yet."
              : "No completed itineraries match your search or filters."}
          </div>
        ) : (
          filteredItineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className="itinerary-card"
              onClick={() => handleItineraryClick(itinerary.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="itinerary-header">
                <h3>{itinerary.title}</h3>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= (itinerary.rating || 0) ? "star filled" : "star"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="collapsed-description">{itinerary.description}</p>
              <div className="itinerary-meta">
                <span className="meta-item">{itinerary.duration}</span>
                <span className="meta-item">{itinerary.price}</span>
                <span className="meta-item">
                  {(itinerary.destinations || []).length} destinations
                </span>
              </div>
              <button
                className="read-more"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItineraryClick(itinerary.id);
                }}
              >
                View Details
              </button>
            </div>
          ))
        )}

        {showFilterModal && (
          <div className="filter-modal-overlay">
            <div className="filter-modal">
              <div className="filter-modal-header">
                <h3>Filter Completed Itineraries</h3>
                <button className="close-btn" onClick={handleCloseFilter}>
                  ×
                </button>
              </div>
              <div className="filter-sections">
                <div className="filter-section">
                  <label>Minimum Rating</label>
                  <div className="rating-filter">
                    {[0, 1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className={`rating-option ${
                          filters.minRating === rating ? "active" : ""
                        }`}
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, minRating: rating }))
                        }
                      >
                        {rating === 0 ? "Any" : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <label>Tags</label>
                  <div className="tags-filter">
                    {[
                      "park",
                      "outdoors",
                      "family",
                      "food",
                      "cultural",
                      "walking",
                      "museums",
                      "educational",
                      "indoor",
                    ].map((tag) => (
                      <button
                        key={tag}
                        className={`tag-option ${
                          (filters.tags || []).includes(tag) ? "active" : ""
                        }`}
                        onClick={() => {
                          const currentTags = filters.tags || [];
                          const newTags = currentTags.includes(tag)
                            ? currentTags.filter((t) => t !== tag)
                            : [...currentTags, tag];
                          setFilters((prev) => ({ ...prev, tags: newTags }));
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <label>Maximum Duration</label>
                  <div className="duration-filter">
                    {[
                      { value: "", label: "Any Duration" },
                      { value: "2 hours", label: "2 hours" },
                      { value: "4 hours", label: "4 hours" },
                      { value: "6 hours", label: "6 hours" },
                      { value: "1 day", label: "1 day" },
                      { value: "2 days", label: "2 days" },
                      { value: "3+ days", label: "3+ days" },
                    ].map((option) => (
                      <button
                        key={option.value || "any"}
                        className={`duration-option ${
                          filters.maxDuration === option.value ? "active" : ""
                        }`}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            maxDuration: option.value,
                          }))
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <label>Maximum Price</label>
                  <div className="price-filter">
                    {[
                      { value: "", label: "Any Price" },
                      { value: "$", label: "$ - Budget" },
                      { value: "$$", label: "$$ - Moderate" },
                      { value: "$$$", label: "$$$ - Expensive" },
                      { value: "$$$$", label: "$$$$ - Luxury" },
                    ].map((option) => (
                      <button
                        key={option.value || "any"}
                        className={`price-option ${
                          filters.maxPrice === option.value ? "active" : ""
                        }`}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            maxPrice: option.value,
                          }))
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="filter-modal-actions">
                <button className="reset-btn" onClick={handleClearFilters}>
                  Reset All
                </button>
                <button
                  className="apply-btn"
                  onClick={() => handleApplyFilters(filters)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
        <Map selectedDestinations={selectedDestinations} />
      </div>

      <div className="sidebar-container">
        <CompletedItinerariesSidebar />
      </div>
    </div>
  );
}

export default CompletedItinerariesPage;
