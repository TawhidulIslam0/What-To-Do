// TagsManager.js
import React from "react";
import "./TagsManager.css";

function TagsManager({ itineraryData, onUpdate }) {
  // Available tags for itinerary categorization
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

  // Toggle tag selection
  const handleTagToggle = (tag) => {
    const currentTags = itineraryData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    onUpdate("tags", newTags);
  };

  return (
    <div className="input-group">
      <label className="form-label">Tags</label>
      <div className="tags-section">
        {/* Display all available tags */}
        <div className="tags-display">
          {availableTags.map((tag) => (
            <span
              key={tag}
              className={`tag-item ${(itineraryData.tags || []).includes(tag) ? "active" : ""
                }`}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TagsManager;