// ViewItinerarySidebar.js
import React, { useState, useEffect, useMemo } from "react";
import "./ViewItinerarySidebar.css";
import API_URL from "../../config";

function ViewItinerarySidebar({
  itinerary,
  onBack,
  user,
  onNavigateToEdit,
  onRateItinerary,
  onRefreshUser,
}) {
  const [completed, setCompleted] = useState(false);
  const [currentUserRating, setCurrentUserRating] = useState(0);
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

  // Use the itinerary data directly
  const normalized = useMemo(() => {
    if (!itinerary) return null;

    console.log("ViewItinerarySidebar received itinerary:", itinerary);

    return {
      ...itinerary,
      tags: Array.isArray(itinerary.tags) ? itinerary.tags : [],
      destinations: Array.isArray(itinerary.destinations)
        ? itinerary.destinations
        : [],
      title: itinerary.title || "Untitled Itinerary",
      description: itinerary.description || "No description",
      duration: itinerary.duration || "1 day",
      price: itinerary.price || "$$",
      rating: parseFloat(itinerary.rating) || 0,
      overallRating: parseFloat(itinerary.rating) || 0,
      userRating: itinerary.userRating || 0,
      authorname: itinerary.authorname || "Unknown",
      authorid: itinerary.authorid,
    };
  }, [itinerary]);

  // Sync local ratings when itinerary changes
  useEffect(() => {
    if (normalized) {
      setCurrentUserRating(normalized.userRating);
      console.log("Setting ratings:", {
        userRating: normalized.userRating,
        overallRating: normalized.overallRating,
      });
    }
  }, [normalized?.id, normalized?.userRating, normalized?.overallRating]);

  useEffect(() => {
    if (normalized && user) {
      try {
        const completedIds = JSON.parse(user.completed_itineraries || "[]");
        setCompleted(completedIds.includes(normalized.id));
      } catch {
        setCompleted(false);
      }
    }
  }, [normalized?.id, user?.completed_itineraries]);

  const savedIds = useMemo(() => {
    if (!user || !user.saved_itineraries) return [];
    try {
      const arr = JSON.parse(user.saved_itineraries);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, [user?.saved_itineraries]);

  if (!normalized) {
    return (
      <div className="view-itinerary-sidebar">
        <div className="create-header">
          <h1>View Itinerary</h1>
        </div>
        <div className="create-form-card">
          <div className="error-message">
            <h2>Itinerary Not Found</h2>
            <p>The requested itinerary could not be loaded.</p>
          </div>
        </div>
        <div className="create-actions">
          <button className="save-btn" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const {
    id,
    title,
    authorname,
    description,
    tags,
    duration,
    price,
    destinations,
    authorid,
    rating,
    overallRating,
  } = normalized;

  const isBookmarked = savedIds.includes(id);

  const canRate =
    user &&
    authorid !== undefined &&
    user.id !== undefined &&
    authorid.toString() !== user.id.toString() &&
    !hasRatedLocal(user?.id, id);
  const isAuthor = String(user?.id) === String(authorid);

  // Rating handler
  const handleRate = async (rating) => {
    if (!canRate) return;
    setCurrentUserRating(rating);
    try {
      const updated = await onRateItinerary(id, rating);
      if (updated && updated.ok) {
        markRatedLocal(user?.id, id);
      } else if (updated && updated.status === 409) {
        markRatedLocal(user?.id, id);
      }
    } catch (err) {
      console.error("Error updating rating:", err);
    }
  };

  function ItineraryBookmark({ id, initialBookmarked, savedIds }) {
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const isCurrentlySaved = savedIds.includes(id);
      setBookmarked(isCurrentlySaved);
    }, [savedIds, id]);

    const handleClick = async () => {
      try {
        if (!user) {
          alert("You must be logged in to save itineraries.");
          return;
        }
        if (isLoading) return; // Prevent multiple clicks
        setIsLoading(true);
        const newBookmarkedState = !bookmarked;
        setBookmarked(newBookmarkedState); // Optimistic update
        // Choose endpoint based on current state (same pattern as completed button)
        const url = bookmarked
          ? "/api/unsave-itinerary"
          : "/api/save-itinerary";
        const response = await fetch(`${API_URL}${url}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ saved_itinerary: id }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data || data.ok === false) {
          console.error("Save/unsave toggle failed", response.status, data);
          setBookmarked(!newBookmarkedState);
          alert("Unable to update saved status. See console for details.");
          return;
        }
        if (onRefreshUser) {
          await onRefreshUser();
        }
      } catch (err) {
        console.error(err);
        setBookmarked(!bookmarked); // Revert on error
        alert("Error saving itinerary");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <button
        className="bookmark-icon"
        onClick={handleClick}
        disabled={isLoading}
        style={{ opacity: isLoading ? 0.6 : 1 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 21l-7-5-7 5V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v16z"
            fill={bookmarked ? "#E71D36" : "#5f5f5f"}
          />
        </svg>
      </button>
    );
  }

  const handleToggleCompleted = async () => {
    try {
      if (!user) {
        alert("You must be logged in to mark completed.");
        return;
      }

      const newCompletedState = !completed;
      setCompleted(newCompletedState);

      // choose endpoint based on current state
      const url = completed
        ? "/api/uncomplete-itinerary"
        : "/api/complete-itinerary";

      const resp = await fetch(`${API_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed_itinerary: id }),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok || !data || data.ok === false) {
        console.error("Complete toggle failed", resp.status, data);
        setCompleted(!newCompletedState); // Revert on error
        alert("Unable to update completed status. See console for details.");
        return;
      }

      // Refresh user data to sync completed_itineraries
      if (onRefreshUser) {
        await onRefreshUser();
      }
    } catch (err) {
      console.error("Network error toggling complete:", err);
      setCompleted(!completed); // Revert on error
      alert("Network error while updating completed status.");
    }
  };

  const handleEdit = () => onNavigateToEdit && onNavigateToEdit(itinerary);
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this itinerary?"))
      return;
    try {
      await fetch(`${API_URL}/api/delete-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      onBack();
    } catch (err) {
      console.error(err);
      alert("Error deleting itinerary");
    }
  };

  console.log("Rendering ViewItinerarySidebar with:", {
    destinations,
    tags,
    overallRating,
    currentUserRating,
    rating,
  });

  return (
    <div className="view-itinerary-sidebar">
      <div className="create-header">
        <div className="title-row">
          <ItineraryBookmark
            id={id}
            initialBookmarked={isBookmarked}
            savedIds={savedIds}
          />
          <h1 className="itinerary-main-title">{title}</h1>
        </div>
        <p className="itinerary-author">Created by: {authorname}</p>
      </div>

      <div className="create-form-card">
        <div className="form-section">
          <label className="form-label">Description</label>
          <div className="view-value description">{description}</div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="form-label">Duration</label>
            <div className="view-value">{duration}</div>
          </div>
          <div className="input-group">
            <label className="form-label">Price Level</label>
            <div className="view-value">{price}</div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="form-section">
          <label className="form-label">Rating</label>
          <div className="rating-display">
            {[1, 2, 3, 4, 5].map((star) => {
              // Use the actual rating from the itinerary
              const displayRating =
                hoverRating ||
                currentUserRating ||
                overallRating ||
                rating ||
                0;
              const isFilled = star <= displayRating;

              return (
                <span
                  key={star}
                  className={`star ${isFilled ? "filled" : ""} ${
                    canRate ? "clickable" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canRate) handleRate(star);
                  }}
                  onMouseEnter={() => canRate && setHoverRating(star)}
                  onMouseLeave={() => canRate && setHoverRating(0)}
                  style={{ cursor: canRate ? "pointer" : "default" }}
                  title={
                    canRate
                      ? `Rate ${star} star(s)`
                      : `Overall rating: ${(
                          overallRating ||
                          rating ||
                          0
                        ).toFixed(1)}`
                  }
                >
                  ★
                </span>
              );
            })}
            <span className="rating-text">
              ({(overallRating || rating || 0).toFixed(1)}/5)
            </span>
          </div>
          {canRate && (
            <p className="rating-hint">Click to rate this itinerary</p>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="form-section">
            <label className="form-label">Tags</label>
            <div className="tags-container">
              {tags.map((tag, i) => (
                <span key={i} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Destinations */}
        <div className="form-section">
          <label className="form-label">
            Destinations ({destinations.length})
          </label>
          {destinations.length > 0 ? (
            <div className="destinations-list">
              {destinations.map((d, i) => (
                <div
                  key={d.id || i}
                  className="destination-item view-destination"
                >
                  <div className="destination-order">{i + 1}</div>
                  <div className="destination-info">
                    <div className="destination-name">
                      {d.name || `Destination ${i + 1}`}
                    </div>
                    {d.address && (
                      <div className="destination-address">{d.address}</div>
                    )}
                    {d.rating && (
                      <div className="destination-rating">
                        <span className="star-icon">★</span>
                        <span>{d.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-destinations">
              No destinations added to this itinerary.
            </div>
          )}
        </div>
      </div>

      <div className="create-actions">
        <button
          className={`completed-btn ${completed ? "active" : ""}`}
          onClick={handleToggleCompleted}
        >
          {completed ? "Completed!" : "Completed?"}
        </button>
        {isAuthor && (
          <>
            <button className="save-btn" onClick={handleEdit}>
              Edit
            </button>
            <button className="save-btn" onClick={handleDelete}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ViewItinerarySidebar;
