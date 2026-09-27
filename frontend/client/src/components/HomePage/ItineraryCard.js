// ItineraryCard.js
import React, { useState } from "react";
import "./ItineraryCard.css";

function ItineraryCard({
  title,
  description,
  rating,
  tags,
  duration,
  price,
  onClick,
  itineraryId,
  createdBy,
  currentUser,
  onRateItinerary,
}) {
  // State for expanded view and hover rating
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const LS_KEY = "rated_itins";
  const getMap = () => JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  const setMap = (m) => localStorage.setItem(LS_KEY, JSON.stringify(m));
  const hasRatedLocal = (userId, itineraryId) => {
    const u = String(userId || "anon");
    const m = getMap();
    return !!m[u]?.[String(itineraryId)];
  };
  const markRatedLocal = (userId, itineraryId) => {
    const u = String(userId || "anon");
    const m = getMap();
    m[u] = m[u] || {};
    m[u][String(itineraryId)] = true;
    setMap(m);
  };

  // Process tags safely from various formats
  const safeTags = React.useMemo(() => {
    if (!tags) return [];

    if (Array.isArray(tags)) {
      return tags;
    }

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
  }, [tags]);

  // Check if current user can rate this itinerary
  const alreadyRated = hasRatedLocal(currentUser?.id, itineraryId);
  const canRate =
    currentUser &&
    createdBy !== undefined &&
    currentUser.id !== undefined &&
    createdBy.toString() !== currentUser.id.toString() &&
    !alreadyRated;

  console.log("Rating Debug:", {
    itineraryId,
    title,
    currentUserId: currentUser?.id,
    createdBy,
    canRate,
    currentUser,
    createdByType: typeof createdBy,
    currentUserIdType: typeof currentUser?.id,
  });

  // Toggle expanded/collapsed view
  const handleReadMore = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Handle card click for viewing itinerary
  const handleCardClick = () => {
    if (onClick && itineraryId) {
      onClick(itineraryId);
    }
  };

  // Handle star rating click
  const handleRate = async (e, newRating) => {
    e.stopPropagation();
    console.log("Rating clicked in ItineraryCard:", {
      itineraryId,
      newRating,
      canRate,
      currentUser: currentUser?.id,
      createdBy,
      onRateItinerary: !!onRateItinerary
    });

    if (!canRate) {
      console.log("Cannot rate - user created this itinerary or already rated or not logged in");
      return;
    }

    if (onRateItinerary) {
      try {
        console.log("Calling onRateItinerary...");
        const res = await onRateItinerary(itineraryId, newRating);
        console.log("Rating response:", res);
        // If the shared handler returns an object with ok:true, treat as success
        if (res && res.ok) {
          markRatedLocal(currentUser?.id, itineraryId);
        } else if (res && res.status === 409) {
          // already rated according to server → mark locally
          markRatedLocal(currentUser?.id, itineraryId);
        }
      } catch (err) {
        console.error("Error rating from card:", err);
      }
    } else {
      console.log("No onRateItinerary handler provided");
    }
  };

  // Handle hover effects for star ratings
  const handleMouseEnter = (starIndex) => {
    if (canRate) {
      setHoverRating(starIndex + 1);
    }
  };

  const handleMouseLeave = () => {
    if (canRate) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating || 0;

  return (
    <div
      className={`itinerary-card ${isExpanded ? "expanded" : ""}`}
      onClick={handleCardClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {/* Header with title and rating stars */}
      <div className="itinerary-header">
        <h3>{title}</h3>
        <div className="rating">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`star ${i < displayRating ? "filled" : ""} ${canRate ? "clickable" : ""
                }`}
              onClick={(e) => handleRate(e, i + 1)}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
              title={
                canRate
                  ? `Rate ${i + 1} star${i !== 0 ? "s" : ""}`
                  : `Overall rating: ${rating || 0}`
              }
            >
              ★
            </span>
          ))}
          <span className="rating-text">({rating || 0})</span>
        </div>
      </div>

      {/* Description - collapsed or expanded */}
      <p
        className={
          isExpanded ? "expanded-description" : "collapsed-description"
        }
      >
        {description}
      </p>

      {/* Expanded details section */}
      {isExpanded && (
        <div className="expanded-content">
          <div className="itinerary-details">
            <div className="detail-item">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">{duration}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Price:</span>
              <span className="detail-value">{price}</span>
            </div>
            {/* Display tags if available */}
            {safeTags.length > 0 && (
              <div className="detail-item">
                <span className="detail-label">Tags:</span>
                <div className="tags-container">
                  {safeTags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Rating:</span>
              <span className="detail-value">{rating || 0} stars</span>
            </div>
          </div>
        </div>
      )}

      {/* Read More/Show Less button */}
      <button className="read-more" onClick={handleReadMore}>
        {isExpanded ? "Show Less" : "Read More"}
      </button>
    </div>
  );
}

export default ItineraryCard;
