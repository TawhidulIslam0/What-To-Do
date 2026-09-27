import React, { useState } from "react";
import "./FilterModal.css";

const FilterModal = ({ filters, onApply, onClose }) => {
  // Local state for filter changes before applying
  const [localFilters, setLocalFilters] = useState(filters);

  // Handle changes to filter values
  const handleFilterChange = (filterType, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Toggle tag selection
  const handleTagToggle = (tag) => {
    setLocalFilters((prev) => {
      const currentTags = prev.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];

      return {
        ...prev,
        tags: newTags,
      };
    });
  };

  // Apply selected filters
  const handleApply = () => {
    onApply(localFilters);
  };

  // Reset all filters to default values
  const handleReset = () => {
    setLocalFilters({
      minRating: 0,
      tags: [],
      maxDuration: "",
      maxPrice: "",
    });
  };

  // Available filter options
  const availableTags = [
    "park",
    "outdoors",
    "family",
    "food",
    "cultural",
    "walking",
    "museums",
    "educational",
    "indoor",
  ];

  const durationOptions = [
    { value: "", label: "Any Duration" },
    { value: "2 hours", label: "2 hours" },
    { value: "4 hours", label: "4 hours" },
    { value: "6 hours", label: "6 hours" },
    { value: "8 hours", label: "8 hours" },
    { value: "10 hours", label: "10 hours" },
    { value: "12 hours", label: "12 hours" },
    { value: "1 day", label: "1 day" },
  ];

  const priceOptions = [
    { value: "", label: "Any Price" },
    { value: "$", label: "$ - Budget" },
    { value: "$$", label: "$$ - Moderate" },
    { value: "$$$", label: "$$$ - Expensive" },
    { value: "$$$$", label: "$$$$ - Luxury" },
  ];

  return (
    <div className="filter-modal-overlay">
      <div className="filter-modal">
        {/* Modal header with close button */}
        <div className="filter-modal-header">
          <h3>Filter Itineraries</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="filter-sections">
          {/* Rating filter section */}
          <div className="filter-section">
            <label>Minimum Rating</label>
            <div className="rating-filter">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className={`rating-option ${localFilters.minRating === rating ? "active" : ""
                    }`}
                  onClick={() => handleFilterChange("minRating", rating)}
                >
                  {rating === 0 ? "Any" : `${rating}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Tags filter section */}
          <div className="filter-section">
            <label>Tags</label>
            <div className="tags-filter">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  className={`tag-option ${(localFilters.tags || []).includes(tag) ? "active" : ""
                    }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Duration filter section */}
          <div className="filter-section">
            <label>Maximum Duration</label>
            <div className="duration-filter">
              {durationOptions.map((option) => (
                <button
                  key={option.value || "any"}
                  className={`duration-option ${localFilters.maxDuration === option.value ? "active" : ""
                    }`}
                  onClick={() =>
                    handleFilterChange("maxDuration", option.value)
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price filter section */}
          <div className="filter-section">
            <label>Maximum Price</label>
            <div className="price-filter">
              {priceOptions.map((option) => (
                <button
                  key={option.value || "any"}
                  className={`price-option ${localFilters.maxPrice === option.value ? "active" : ""
                    }`}
                  onClick={() => handleFilterChange("maxPrice", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter action buttons */}
        <div className="filter-modal-actions">
          <button className="reset-btn" onClick={handleReset}>
            Reset All
          </button>
          <button className="apply-btn" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;