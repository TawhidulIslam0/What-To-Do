// DestinationsList.js - Update the component to handle non-array data
import React, { useState } from "react";
import "./DestinationList.css";

function DestinationsList({
  destinations,
  onRemoveDestination,
  onMoveDestination,
  onUpdateDestination,
}) {
  // Ensure destinations is always an array
  const safeDestinations = Array.isArray(destinations) ? destinations : [];

  // State for editing destination names
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  // Start editing a destination name
  const handleEditStart = (destination) => {
    setEditingId(destination.id);
    setEditName(destination.name);
  };

  // Save edited destination name
  const handleEditSave = (destinationId) => {
    if (editName.trim()) {
      onUpdateDestination(destinationId, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName("");
  };

  // Cancel editing destination name
  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
  };

  // Handle keyboard events during editing
  const handleKeyPress = (e, destinationId) => {
    if (e.key === "Enter") {
      handleEditSave(destinationId);
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  return (
    <div className="destinations-list">
      {/* Display destinations sorted by order */}
      {safeDestinations
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((destination, index) => (
          <div key={destination.id} className="destination-item">
            {/* Order controls and display */}
            <div className="destination-order-container">
              <button
                className="move-btn"
                onClick={() => onMoveDestination(index, -1)}
                disabled={index === 0}
                title="Move up"
              >
                ↑
              </button>
              <div className="destination-order">{index + 1}</div>
              <button
                className="move-btn"
                onClick={() => onMoveDestination(index, 1)}
                disabled={index === safeDestinations.length - 1}
                title="Move down"
              >
                ↓
              </button>
            </div>

            {/* Destination information */}
            <div className="destination-info">
              {editingId === destination.id ? (
                // Edit mode for destination name
                <div className="destination-name-edit">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, destination.id)}
                    onBlur={() => handleEditSave(destination.id)}
                    className="name-edit-input"
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button
                      className="save-edit-btn"
                      onClick={() => handleEditSave(destination.id)}
                    >
                      Save
                    </button>
                    <button
                      className="cancel-edit-btn"
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display mode for destination name
                <div
                  className="destination-name editable"
                  onClick={() => handleEditStart(destination)}
                  title="Click to edit name"
                >
                  {destination.name}
                </div>
              )}
              <div className="destination-address">{destination.address}</div>
            </div>

            {/* Remove destination button */}
            <div className="destination-actions">
              <button
                className="remove-btn"
                onClick={() => onRemoveDestination(destination.id)}
                title="Remove destination"
              >
                ×
              </button>
            </div>
          </div>
        ))}

      {/* Empty state when no destinations */}
      {safeDestinations.length === 0 && (
        <div className="no-destinations">
          No destinations added yet. Click "Add Destination" to start building
          your pathway.
        </div>
      )}
    </div>
  );
}

export default DestinationsList;