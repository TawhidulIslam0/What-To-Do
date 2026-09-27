// RatingStars.js
import React, { useState, useEffect } from 'react';
import './RatingStars.css';

function RatingStars({ itineraryId, currentRating, overallRating, on, canRate = true }) {
    // State for user's current rating
    const [userRating, setUserRating] = useState(currentRating || 0);

    // Update user rating when currentRating prop changes
    useEffect(() => {
        setUserRating(currentRating || 0);
    }, [currentRating]);

    // Handle user rating an itinerary
    const handleRate = (rating) => {
        if (!canRate) return;
        setUserRating(rating);
        if (onRate) {
            onRate(itineraryId, rating);
        }
    };

    // Render star icons for rating display
    const renderStars = (rating, isClickable = false) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}
                className={`star ${rating >= star ? 'active' : ''} ${isClickable ? 'clickable' : ''}`}
                onClick={isClickable ? () => handleRate(star) : undefined}
            >
                ★
            </span>
        ));
    };

    return (
        <div className="rating-stars-container">
            {/* User's personal rating section */}
            <div className="rating-section">
                <div className="rating-label">Your Rating:</div>
                <div className="stars">
                    {renderStars(userRating, canRate)}
                </div>
                {userRating > 0 && (
                    <span className="rating-value">({userRating})</span>
                )}
            </div>

            {/* Overall rating from all users */}
            {overallRating > 0 && (
                <div className="rating-section">
                    <div className="rating-label">Overall Rating:</div>
                    <div className="overall-rating">
                        {renderStars(overallRating, false)}
                        <span className="rating-value">({overallRating.toFixed(1)})</span>
                    </div>
                </div>
            )}

            {/* Notice for when user cannot rate */}
            {!canRate && (
                <div className="rating-notice">
                    You can't rate your own itineraries
                </div>
            )}
        </div>
    );
}

export default RatingStars;