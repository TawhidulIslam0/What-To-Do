// ItineraryForm.js
import React from "react";
import "./FormStyles.css";
import CustomDropdown from "./CustomDropdown";

function ItineraryForm({ itineraryData, onUpdate }) {
  // Handle input changes for form fields
  const handleInputChange = (field, value) => {
    onUpdate(field, value);
  };

  // Options for duration dropdown
  const durationOptions = [
    { value: "2 hours", label: "2 hours" },
    { value: "4 hours", label: "4 hours" },
    { value: "6 hours", label: "6 hours" },
    { value: "8 hours", label: "8 hours" },
    { value: "10 hours", label: "10 hours" },
    { value: "12 hours", label: "12 hours" },
    { value: "1 day", label: "1 day" },
  ];

  // Options for price level dropdown
  const priceOptions = [
    { value: "$", label: "$ - Budget" },
    { value: "$$", label: "$$ - Moderate" },
    { value: "$$$", label: "$$$ - Expensive" },
    { value: "$$$$", label: "$$$$ - Luxury" },
  ];

  return (
    <div className="form-section">
      {/* Itinerary title input */}
      <div className="input-group">
        <input
          type="text"
          placeholder="Itinerary Title"
          value={itineraryData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className="form-input"
        />
      </div>

      {/* Itinerary description textarea */}
      <div className="input-group">
        <textarea
          placeholder="Describe your amazing itinerary here..."
          value={itineraryData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows="3"
          className="form-textarea"
        />
      </div>

      {/* Duration and price level dropdowns */}
      <div className="form-row">
        <div className="input-group duration-dropdown-wrapper">
          <label className="form-label">Duration</label>
          <CustomDropdown
            options={durationOptions}
            value={itineraryData.duration}
            onChange={(value) => handleInputChange("duration", value)}
            placeholder="Select duration..."
          />
        </div>

        <div className="input-group price-select-wrapper">
          <label className="form-label">Price Level</label>
          <CustomDropdown
            options={priceOptions}
            value={itineraryData.price}
            onChange={(value) => handleInputChange("price", value)}
            placeholder="Select price..."
            className="compact-dropdown"
          />
        </div>
      </div>
    </div>
  );
}

export default ItineraryForm;