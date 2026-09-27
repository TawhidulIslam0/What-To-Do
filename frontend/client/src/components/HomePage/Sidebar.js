// Sidebar.js
import React, { useState } from "react";
import ItineraryCard from "./ItineraryCard";
import FilterModal from "./FilterModal";
import "./Sidebar.css";

function Sidebar({
  onCreateNew,
  onViewItinerary,
  onItineraryClick,
  itineraries = [],
  isLoading = false,
  currentUser,
  onRateItinerary,
  title = "Itineraries",
  showCreateNew = true,
  placeholder = "Search itineraries...",
}) {
  // State for search, filter modal, and filter criteria
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    tags: [],
    maxDuration: "",
    maxPrice: "",
  });

  // Handle search input changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Show/hide filter modal
  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  const handleCloseFilter = () => {
    setShowFilterModal(false);
  };

  // Remove individual filter
  const removeFilter = (filterType, value = null) => {
    setFilters(prev => {
      if (filterType === "minRating") {
        return { ...prev, minRating: 0 };
      } else if (filterType === "tags") {
        return {
          ...prev,
          tags: prev.tags.filter(tag => tag !== value)
        };
      } else if (filterType === "maxDuration") {
        return { ...prev, maxDuration: "" };
      } else if (filterType === "maxPrice") {
        return { ...prev, maxPrice: "" };
      }
      return prev;
    });
  };

  // Reset all filters to default
  const handleClearFilters = () => {
    setFilters({
      minRating: 0,
      tags: [],
      maxDuration: "",
      maxPrice: "",
    });
  };

  // Handle clicking on an itinerary card
  const handleItineraryCardClick = (itineraryId) => {
    if (onItineraryClick) {
      // Use custom click handler if provided by the page
      onItineraryClick(itineraryId);
    } else if (onViewItinerary) {
      // Fallback to the original behavior
      const safeItineraries = Array.isArray(itineraries) ? itineraries : [];
      const itinerary = safeItineraries.find((item) => item.id === itineraryId);
      onViewItinerary(itinerary);
    }
  };

  // Convert duration string to hours for filtering
  const durationToHours = (duration) => {
    if (!duration) return 0;
    if (typeof duration !== "string") return 0;

    const durationLower = duration.toLowerCase();

    // Extract numbers from duration string
    const hoursMatch = durationLower.match(/(\d+)\s*hour/);
    const daysMatch = durationLower.match(/(\d+)\s*day/);

    if (hoursMatch) {
      return parseInt(hoursMatch[1]) || 0;
    }
    if (daysMatch) {
      return (parseInt(daysMatch[1]) || 1) * 24;
    }

    // Default fallback
    return durationLower.includes("day") ? 24 : 2;
  };

  // Convert price string to numeric value for filtering
  const priceToNumber = (price) => {
    if (!price) return 0;
    if (typeof price !== "string") return 0;

    // Count the $ symbols
    const dollarCount = (price.match(/\$/g) || []).length;
    return dollarCount;
  };

  // duration comparison function
  const compareDurations = (itineraryDuration, filterDuration) => {
    if (!filterDuration) return true;

    const itineraryHours = durationToHours(itineraryDuration);
    const filterHours = durationToHours(filterDuration);

    return itineraryHours <= filterHours;
  };

  // price comparison function
  const comparePrices = (itineraryPrice, filterPrice) => {
    if (!filterPrice) return true;

    const itineraryPriceValue = priceToNumber(itineraryPrice);
    const filterPriceValue = priceToNumber(filterPrice);

    return itineraryPriceValue <= filterPriceValue;
  };

  // Filter itineraries based on search and filter criteria
  const filteredItineraries = (
    Array.isArray(itineraries) ? itineraries : []
  ).filter((itinerary) => {
    if (!itinerary || typeof itinerary !== "object") {
      return false;
    }

    const matchesSearch =
      searchTerm === "" ||
      (itinerary.title &&
        itinerary.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (itinerary.description &&
        itinerary.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRating = (itinerary.rating || 0) >= (filters.minRating || 0);

    const itineraryTags = Array.isArray(itinerary.tags) ? itinerary.tags : [];
    const filterTags = Array.isArray(filters.tags) ? filters.tags : [];
    const matchesTags =
      filterTags.length === 0 ||
      filterTags.some((tag) => itineraryTags.includes(tag));

    const matchesDuration = compareDurations(itinerary.duration, filters.maxDuration);
    const matchesPrice = comparePrices(itinerary.price, filters.maxPrice);

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

  // Function to render individual filter bubbles
  const renderFilterBubbles = () => {
    const bubbles = [];

    if (filters.minRating > 0) {
      bubbles.push(
        <div key="rating" className="filter-bubble">
          <span className="filter-bubble-text">{filters.minRating}+ Stars</span>
          <button
            className="filter-bubble-remove"
            onClick={() => removeFilter("minRating")}
            aria-label="Remove rating filter"
          >
            ×
          </button>
        </div>
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag, index) => {
        bubbles.push(
          <div key={`tag-${index}`} className="filter-bubble">
            <span className="filter-bubble-text">{tag}</span>
            <button
              className="filter-bubble-remove"
              onClick={() => removeFilter("tags", tag)}
              aria-label={`Remove ${tag} tag filter`}
            >
              ×
            </button>
          </div>
        );
      });
    }

    if (filters.maxDuration) {
      bubbles.push(
        <div key="duration" className="filter-bubble">
          <span className="filter-bubble-text">{filters.maxDuration}</span>
          <button
            className="filter-bubble-remove"
            onClick={() => removeFilter("maxDuration")}
            aria-label="Remove duration filter"
          >
            ×
          </button>
        </div>
      );
    }

    if (filters.maxPrice) {
      bubbles.push(
        <div key="price" className="filter-bubble">
          <span className="filter-bubble-text">{filters.maxPrice}</span>
          <button
            className="filter-bubble-remove"
            onClick={() => removeFilter("maxPrice")}
            aria-label="Remove price filter"
          >
            ×
          </button>
        </div>
      );
    }

    return bubbles;
  };

  return (
    <div className="sidebar">
      {/* Main sidebar header */}
      <h1>{title}</h1>

      {/* Create new itinerary button */}
      {showCreateNew && (
        <h2
          className="create-new-header"
          onClick={onCreateNew}
          style={{ cursor: "pointer" }}
        >
          Create New
        </h2>
      )}

      {/* Search and filter controls */}
      <div className="search-filter">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={handleFilterClick}>
          Filter {hasActiveFilters && "•"}
        </button>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="active-filters">
          <div className="filter-bubbles-container">
            {renderFilterBubbles()}
          </div>
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Itineraries list */}
      <div className="itineraries-list">
        {isLoading ? (
          <div className="no-results">Loading itineraries...</div>
        ) : (
          <>
            {/* Display filtered itineraries */}
            {filteredItineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary.id}
                itineraryId={itinerary.id}
                title={itinerary.title}
                rating={itinerary.rating}
                description={itinerary.description}
                tags={itinerary.tags}
                duration={itinerary.duration}
                price={itinerary.price}
                onClick={handleItineraryCardClick}
                createdBy={itinerary.createdBy}
                currentUser={currentUser}
                onRateItinerary={onRateItinerary}
              />
            ))}

            {/* No results message */}
            {filteredItineraries.length === 0 && (
              <div className="no-results">
                No itineraries found. Try adjusting your search or filters.
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter modal */}
      {showFilterModal && (
        <FilterModal
          filters={filters}
          onApply={handleApplyFilters}
          onClose={handleCloseFilter}
        />
      )}
    </div>
  );
}

export default Sidebar;