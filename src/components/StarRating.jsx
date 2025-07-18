import React, { useState } from 'react';
import './StarRating.scss';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  readonly = false, 
  size = 'medium',
  showLabels = true 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (!readonly) {
      setHoverRating(starValue);
    }
  };

  const handleStarLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const getRatingLabels = () => {
    return {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
  };

  const labels = getRatingLabels();
  const displayRating = hoverRating || rating;

  return (
    <div className={`star-rating ${size} ${readonly ? 'readonly' : ''}`}>
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= displayRating ? 'filled' : 'empty'}`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleStarLeave}
            disabled={readonly}
            title={labels[star]}
          >
            <i className="fas fa-star"></i>
          </button>
        ))}
      </div>
      {showLabels && displayRating > 0 && (
        <span className="rating-label">{labels[displayRating]}</span>
      )}
    </div>
  );
};

export default StarRating; 