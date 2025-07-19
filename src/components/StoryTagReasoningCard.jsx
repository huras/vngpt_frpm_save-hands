import React, { useState } from 'react';
import { intelligentTagApi } from '../services/intelligentTagApi';
import { BACKEND_CONFIG } from '../config/backend';
import TagImagePopup from './TagImagePopup';
import StarRating from './StarRating';
import './StoryTagReasoningCard.scss';

const StoryTagReasoningCard = ({ reasoning, onRatingUpdate, onReasoningUpdate }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(reasoning.userRating || 0);
  const [ratingComment, setRatingComment] = useState(reasoning.ratingComment || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editedReasoning, setEditedReasoning] = useState(reasoning.reasoning);
  const [saving, setSaving] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  const handleRateClick = () => {
    setRatingValue(reasoning.userRating || 0);
    setRatingComment(reasoning.ratingComment || '');
    setShowRatingModal(true);
  };

  // New inline rating handler for AJAX star rating
  const handleInlineRating = async (newRating) => {
    if (newRating === ratingValue || ratingLoading) {
      return; // No change or already loading
    }

    try {
      setRatingLoading(true);
      
      // If this reasoning has a suggestionId, rate the suggestion (which will update the reasoning)
      if (reasoning.suggestionId) {
        await intelligentTagApi.rateSuggestion(reasoning.suggestionId, newRating, ratingComment);
      } else {
        // Direct rating of the reasoning
        await intelligentTagApi.rateReasoning(reasoning.id, newRating, ratingComment);
      }
      
      // Update local state
      setRatingValue(newRating);
      
      // Update the local reasoning object
      const updatedReasoning = {
        ...reasoning,
        userRating: newRating,
        ratingComment: ratingComment,
        ratedAt: new Date()
      };
      
      if (onRatingUpdate) {
        onRatingUpdate(updatedReasoning);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
      // Revert the rating change on error
      setRatingValue(reasoning.userRating || 0);
    } finally {
      setRatingLoading(false);
    }
  };

  const submitRating = async () => {
    if (ratingValue === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      // If this reasoning has a suggestionId, rate the suggestion (which will update the reasoning)
      if (reasoning.suggestionId) {
        await intelligentTagApi.rateSuggestion(reasoning.suggestionId, ratingValue, ratingComment);
      } else {
        // Direct rating of the reasoning (we'll need to add this API endpoint)
        await intelligentTagApi.rateReasoning(reasoning.id, ratingValue, ratingComment);
      }
      
      setShowRatingModal(false);
      
      // Update the local reasoning object
      const updatedReasoning = {
        ...reasoning,
        userRating: ratingValue,
        ratingComment: ratingComment,
        ratedAt: new Date()
      };
      
      if (onRatingUpdate) {
        onRatingUpdate(updatedReasoning);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const cancelRating = () => {
    setShowRatingModal(false);
    setRatingValue(reasoning.userRating || 0);
    setRatingComment(reasoning.ratingComment || '');
  };

  const handleEditReasoning = () => {
    setIsEditing(true);
  };

  const saveReasoning = async () => {
    try {
      setSaving(true);
      // We'll need to add this API endpoint
      await intelligentTagApi.updateReasoning(reasoning.id, editedReasoning);
      
      const updatedReasoning = {
        ...reasoning,
        reasoning: editedReasoning
      };
      
      if (onReasoningUpdate) {
        onReasoningUpdate(updatedReasoning);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating reasoning:', error);
      alert('Failed to update reasoning. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedReasoning(reasoning.reasoning);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="story-tag-reasoning-card">
      <div className="reasoning-content">
        <div className="reasoning-image">
          {reasoning.tag.thumb_url ? (
            <TagImagePopup tag={reasoning.tag} position="top">
              <img 
                src={BACKEND_CONFIG.getImageUrl(reasoning.tag.thumb_url)} 
                alt={reasoning.tag.title}
                className="tag-thumb"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('no-image');
                }}
              />
            </TagImagePopup>
          ) : (
            <div className="no-image">
              <span>{reasoning.tag.title.charAt(0).toUpperCase()}</span>
            </div>
          )}
          {reasoning.tag.thumb_url && (
            <div className="popup-indicator">
              <i className="fas fa-eye"></i>
            </div>
          )}
        </div>
        
        <div className="reasoning-details">
          <div className="reasoning-header">
            <h4>{reasoning.tag.title}</h4>
            <div className="reasoning-meta">
              <span className="source-badge">
                {reasoning.source.replace('_', ' ')}
              </span>
              <div className="inline-rating-container">
                {ratingLoading ? (
                  <div className="rating-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                ) : (
                  <StarRating
                    rating={ratingValue}
                    onRatingChange={handleInlineRating}
                    size="small"
                    showLabels={false}
                    readonly={ratingLoading}
                  />
                )}
                {ratingValue > 0 && (
                  <span className="rating-value">({ratingValue}/5)</span>
                )}
              </div>
              <span className="date">
                {formatDate(reasoning.createdAt)}
              </span>
            </div>
          </div>
          
          {isEditing ? (
            <div className="editing-reasoning">
              <textarea
                value={editedReasoning}
                onChange={(e) => setEditedReasoning(e.target.value)}
                className="form-control"
                rows={3}
                placeholder="Enter your reasoning..."
              />
              <div className="edit-actions">
                <button 
                  onClick={saveReasoning} 
                  className="btn btn-primary btn-sm"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button 
                  onClick={cancelEdit} 
                  className="btn btn-secondary btn-sm"
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="reasoning-text">{reasoning.reasoning}</p>
          )}

          {reasoning.userExplanation && (
            <div className="user-explanation">
              <strong>Your note:</strong> {reasoning.userExplanation}
            </div>
          )}

          {reasoning.ratingComment && (
            <div className="rating-comment">
              <strong>Rating comment:</strong> "{reasoning.ratingComment}"
            </div>
          )}
        </div>
      </div>
      
      <div className="reasoning-actions">
        <button 
          onClick={handleRateClick}
          className="rate-btn"
          title="Rate this reasoning with comments"
        >
          <i className="fas fa-comment"></i>
          Add Comment
        </button>
        <button 
          onClick={handleEditReasoning}
          className="edit-btn"
          title="Edit reasoning"
        >
          <i className="fas fa-edit"></i>
          Edit
        </button>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="dialog-overlay">
          <div className="dialog rating-modal">
            <div className="modal-header">
              <h4>Rate Reasoning</h4>
              <button onClick={cancelRating} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="rating-preview">
                <h6>Rating: {reasoning.tag.title}</h6>
                <p className="text-muted">{reasoning.reasoning}</p>
              </div>

              <div className="form-group">
                <label htmlFor="rating">How would you rate this reasoning?</label>
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
                  placeholder="Share your thoughts about this reasoning. This feedback helps improve future AI suggestions..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                />
                <small className="form-text text-muted">
                  Your feedback helps improve future suggestions for this story and will be used to enhance AI recommendations.
                </small>
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
                disabled={ratingValue === 0}
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryTagReasoningCard; 