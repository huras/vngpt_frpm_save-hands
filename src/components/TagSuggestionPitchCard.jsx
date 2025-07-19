import React, { useState } from 'react';
import { intelligentTagApi } from '../services/intelligentTagApi';
import StarRating from './StarRating';
import './TagSuggestionPitchCard.scss';

const TagSuggestionPitchCard = ({ pitch, onDelete, onUpdate }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(pitch.userRating || 0);
  const [ratingComment, setRatingComment] = useState(pitch.ratingComment || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRateClick = () => {
    setRatingValue(pitch.userRating || 0);
    setRatingComment(pitch.ratingComment || '');
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (ratingValue === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await intelligentTagApi.ratePitch(pitch.id, ratingValue, ratingComment);
      setShowRatingModal(false);
      
      // Update the pitch in the parent component
      if (onUpdate) {
        onUpdate(pitch.id, {
          ...pitch,
          userRating: ratingValue,
          ratingComment: ratingComment,
          ratedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this pitch?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await intelligentTagApi.deletePitch(pitch.id);
      if (onDelete) {
        onDelete(pitch.id);
      }
    } catch (error) {
      console.error('Error deleting pitch:', error);
      alert('Failed to delete pitch. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await intelligentTagApi.togglePitchFavorite(pitch.id);
      if (onUpdate) {
        onUpdate(pitch.id, {
          ...pitch,
          isFavorite: !pitch.isFavorite
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  const getPitchTypeLabel = (type) => {
    const labels = {
      'character_development': 'Character Development',
      'plot_enhancement': 'Plot Enhancement',
      'theme_exploration': 'Theme Exploration',
      'world_building': 'World Building',
      'conflict_creation': 'Conflict Creation',
      'general': 'General'
    };
    return labels[type] || 'General';
  };

  const getPitchTypeIcon = (type) => {
    const icons = {
      'character_development': 'fas fa-user',
      'plot_enhancement': 'fas fa-route',
      'theme_exploration': 'fas fa-lightbulb',
      'world_building': 'fas fa-globe',
      'conflict_creation': 'fas fa-exclamation-triangle',
      'general': 'fas fa-star'
    };
    return icons[type] || 'fas fa-star';
  };

  const cancelRating = () => {
    setShowRatingModal(false);
    setRatingValue(0);
    setRatingComment('');
  };

  return (
    <div className={`pitch-card ${pitch.isFavorite ? 'favorite' : ''}`}>
      <div className="pitch-header">
        <div className="pitch-type">
          <i className={getPitchTypeIcon(pitch.pitchType)}></i>
          <span>{getPitchTypeLabel(pitch.pitchType)}</span>
        </div>
        <div className="pitch-actions">
          <button 
            onClick={handleToggleFavorite}
            className={`favorite-btn ${pitch.isFavorite ? 'active' : ''}`}
            title={pitch.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <i className="fas fa-heart"></i>
          </button>
          <button 
            onClick={handleRateClick}
            className="rate-btn"
            title="Rate this pitch"
          >
            <i className="fas fa-star"></i>
          </button>
          <button 
            onClick={handleDelete}
            className="delete-btn"
            disabled={isDeleting}
            title="Delete this pitch"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <div className="pitch-content">
        <p className="pitch-text">{pitch.pitch}</p>
      </div>

      <div className="pitch-footer">
        <div className="pitch-meta">
          <span className="confidence">
            Confidence: {(pitch.confidence * 100).toFixed(1)}%
          </span>
          {pitch.userRating ? (
            <span className="rating-display">
              {'★'.repeat(pitch.userRating)}{'☆'.repeat(5 - pitch.userRating)}
            </span>
          ) : (
            <span className="rating-display no-rating">
              <i className="fas fa-star-o"></i> Rate
            </span>
          )}
        </div>
        <div className="pitch-date">
          {new Date(pitch.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="dialog-overlay">
          <div className="dialog rating-modal">
            <div className="modal-header">
              <h4>Rate Pitch</h4>
              <button onClick={cancelRating} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="rating-preview">
                <h6>Rating: {getPitchTypeLabel(pitch.pitchType)} Pitch</h6>
                <p className="text-muted">{pitch.pitch}</p>
              </div>

              <div className="form-group">
                <label htmlFor="rating">How would you rate this pitch?</label>
                <StarRating
                  rating={ratingValue}
                  onRatingChange={setRatingValue}
                  size="large"
                  showLabels={true}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ratingComment">Additional comments (optional)</label>
                <textarea
                  id="ratingComment"
                  className="form-control"
                  rows={3}
                  placeholder="Share your thoughts about this pitch..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelRating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={submitRating}
                disabled={ratingValue === 0 || isUpdating}
              >
                {isUpdating ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Submitting...
                  </>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSuggestionPitchCard; 