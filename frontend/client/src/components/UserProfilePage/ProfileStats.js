// src/components/UserProfilePage/ProfileStats.js
import React from "react";
import "./ProfileStats.css";

const ProfileStats = ({
  userItineraries = [],
  savedItineraries = [],
  completedItineraries = [],
}) => {
  // Calculate stats for display - itineraries count and recent activity
  const stats = {
    itineraries: userItineraries.length,
    saved: savedItineraries.length,
    completed: completedItineraries.length,
  };

  return (
    <div className="profile-stats-small">
      {/* Created itineraries count */}
      <div className="stat-item-small">
        <div className="stat-number-small">{stats.itineraries}</div>
        <div className="stat-label-small">Created</div>
      </div>

      {/* Saved itineraries count */}
      <div className="stat-item-small">
        <div className="stat-number-small">{stats.saved}</div>
        <div className="stat-label-small">Saved</div>
      </div>

      {/* Completed itineraries count */}
      <div className="stat-item-small">
        <div className="stat-number-small">{stats.completed}</div>
        <div className="stat-label-small">Completed</div>
      </div>
    </div>
  );
};

export default ProfileStats;
