import React, { useState, useEffect } from 'react';
import { intelligentTagApi } from '../services/intelligentTagApi';
import { BACKEND_CONFIG } from '../config/backend';
import TagImagePopup from './TagImagePopup';
import StarRating from './StarRating';
import TagSuggestionPitchCard from './TagSuggestionPitchCard';
import './SuggestionCard.scss';

// Enhanced SuggestionCard component with rating, history, regenerate, and pitch features
const SuggestionCard = ({ suggestion, onAccept, onReject, type, onRate, onHistory, onRegenerate }) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [acceptExplanation, setAcceptExplanation] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [suggestionHistory, setSuggestionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  
  // Pitch-related state
  const [showPitches, setShowPitches] = useState(false);
  const [pitches, setPitches] = useState([]);
  const [loadingPitches, setLoadingPitches] = useState(false);
  const [generatingPitches, setGeneratingPitches] = useState(false);

  const handleReject = () => {
    if (showRejectDialog) {
      onReject(suggestion.id, rejectReason || null);
      setShowRejectDialog(false);
      setRejectReason('');
    } else {
      setShowRejectDialog(true);
    }
  };

  const handleAccept = () => {
    if (showAcceptDialog) {
      onAccept(suggestion.id, acceptExplanation || null);
      setShowAcceptDialog(false);
      setAcceptExplanation('');
    } else {
      setShowAcceptDialog(true);
    }
  };

  const cancelReject = () => {
    setShowRejectDialog(false);
    setRejectReason('');
  };

  const cancelAccept = () => {
    setShowAcceptDialog(false);
    setAcceptExplanation('');
  };

  const handleRateClick = () => {
    // Get rating from suggestion (which now comes from StoryTagReasoning via backend)
    // If no rating exists yet, start with 0
    setRatingValue(suggestion.userRating || 0);
    setRatingComment(suggestion.ratingComment || '');
    setShowRatingModal(true);
    fetchSuggestionHistory();
  };

  const handleHistoryClick = () => {
    setShowHistoryModal(true);
    fetchSuggestionHistory();
  };

  const fetchSuggestionHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await intelligentTagApi.getSuggestionHistory(suggestion.storyId, suggestion.tag.id);
      if (response.data.success) {
        setSuggestionHistory(response.data.history);
      } else {
        setSuggestionHistory([]);
      }
    } catch (error) {
      console.error('Error fetching suggestion history:', error);
      setSuggestionHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const submitRating = async () => {
    if (ratingValue === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      const response = await intelligentTagApi.rateSuggestion(suggestion.id, ratingValue, ratingComment);
      setShowRatingModal(false);
      setRatingValue(0);
      setRatingComment('');
      // Refresh the parent component to show updated rating
      if (onRate) {
        onRate(suggestion.id, ratingValue, ratingComment);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const feedback = `Rating: ${ratingValue}/5 stars${ratingComment ? ` | Comments: ${ratingComment}` : ''}`;
      
      const response = await intelligentTagApi.regenerateSuggestion(suggestion.id, feedback);
      
      if (response.data.success) {
        setShowRatingModal(false);
        setRatingValue(0);
        setRatingComment('');
        // Refresh the parent component to show the new suggestion
        if (onRegenerate) {
          onRegenerate(suggestion.id, response.data.suggestion);
        }
      } else {
        throw new Error('Failed to regenerate suggestion');
      }
    } catch (error) {
      console.error('Error regenerating suggestion:', error);
      alert('Failed to regenerate suggestion. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const cancelRating = () => {
    setShowRatingModal(false);
    setRatingValue(0);
    setRatingComment('');
  };

  const closeHistory = () => {
    setShowHistoryModal(false);
  };

  // Pitch-related functions
  const fetchPitches = async () => {
    try {
      setLoadingPitches(true);
      const response = await intelligentTagApi.getPitches(suggestion.id);
      if (response.data.success) {
        setPitches(response.data.pitches);
      } else {
        setPitches([]);
      }
    } catch (error) {
      console.error('Error fetching pitches:', error);
      setPitches([]);
    } finally {
      setLoadingPitches(false);
    }
  };

  const generatePitches = async (count = 3) => {
    try {
      setGeneratingPitches(true);
      const response = await intelligentTagApi.generatePitches(suggestion.id, count);
      if (response.data.success) {
        setPitches(response.data.pitches);
        setShowPitches(true);
      } else {
        throw new Error('Failed to generate pitches');
      }
    } catch (error) {
      console.error('Error generating pitches:', error);
      alert('Failed to generate pitches. Please try again.');
    } finally {
      setGeneratingPitches(false);
    }
  };

  const handlePitchDelete = (pitchId) => {
    setPitches(prev => prev.filter(pitch => pitch.id !== pitchId));
  };

  const handlePitchUpdate = (pitchId, updatedPitch) => {
    setPitches(prev => prev.map(pitch => 
      pitch.id === pitchId ? updatedPitch : pitch
    ));
  };

  const deleteAllPitches = async () => {
    if (!window.confirm('Are you sure you want to delete all pitches for this suggestion?')) {
      return;
    }

    try {
      await intelligentTagApi.deleteAllPitches(suggestion.id);
      setPitches([]);
    } catch (error) {
      console.error('Error deleting all pitches:', error);
      alert('Failed to delete pitches. Please try again.');
    }
  };

  const togglePitches = () => {
    if (!showPitches && pitches.length === 0) {
      fetchPitches();
    }
    setShowPitches(!showPitches);
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
    <div className={`suggestion-card ${type === 'rejected' ? 'rejected' : ''} ${type === 'accepted' ? 'accepted' : ''}`}>
      <div className="suggestion-content">
        <div className="suggestion-image">
          {suggestion.tag.thumb_url ? (
            <TagImagePopup tag={suggestion.tag} position="top">
              <img 
                src={BACKEND_CONFIG.getImageUrl(suggestion.tag.thumb_url)} 
                alt={suggestion.tag.title}
                className="tag-thumb"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('no-image');
                }}
              />
            </TagImagePopup>
          ) : (
            <div className="no-image">
              <span>{suggestion.tag.title.charAt(0).toUpperCase()}</span>
            </div>
          )}
          {suggestion.tag.thumb_url && (
            <div className="popup-indicator">
              <i className="fas fa-eye"></i>
            </div>
          )}
        </div>
        
        <div className="suggestion-details">
          <div className="suggestion-header">
            <h4>{suggestion.tag.title}</h4>
            <div className="suggestion-meta">
              <span className="confidence">
                Confidence: {(suggestion.confidence * 100).toFixed(1)}%
              </span>
              {suggestion.userRating ? (
                <span className="rating-display">
                  {'★'.repeat(suggestion.userRating)}{'☆'.repeat(5 - suggestion.userRating)}
                </span>
              ) : (
                <span className="rating-display no-rating">
                  <i className="fas fa-star-o"></i> Rate
                </span>
              )}
              {type === 'rejected' && (
                <span className="rejected-badge">Rejected</span>
              )}
              {type === 'accepted' && (
                <span className="accepted-badge">Accepted</span>
              )}
            </div>
          </div>
          
          <p className="reasoning">{suggestion.reasoning}</p>
        </div>
      </div>
      
      {/* Show rejection reason if available */}
      {type === 'rejected' && suggestion.rejectionReason && (
        <div className="rejection-reason">
          <strong>Rejection Reason:</strong> {suggestion.rejectionReason}
        </div>
      )}

      {/* Show acceptance explanation if available */}
      {type === 'accepted' && suggestion.acceptanceExplanation && (
        <div className="acceptance-explanation">
          <strong>Acceptance Explanation:</strong> {suggestion.acceptanceExplanation}
        </div>
      )}
      
      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h4>Reject Suggestion</h4>
            <p>Why are you rejecting "{suggestion.tag.title}"?</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Optional: Provide a reason for rejection..."
              rows="3"
            />
            <div className="dialog-actions">
              <button onClick={cancelReject} className="cancel-btn">Cancel</button>
              <button onClick={handleReject} className="reject-btn">Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Dialog */}
      {showAcceptDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h4>Accept Suggestion</h4>
            <p>Why are you accepting "{suggestion.tag.title}"?</p>
            <textarea
              value={acceptExplanation}
              onChange={(e) => setAcceptExplanation(e.target.value)}
              placeholder="Optional: Provide additional explanation..."
              rows="3"
            />
            <div className="dialog-actions">
              <button onClick={cancelAccept} className="cancel-btn">Cancel</button>
              <button onClick={handleAccept} className="accept-btn">Accept</button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="dialog-overlay">
          <div className="dialog rating-modal">
            <div className="modal-header">
              <h4>Rate Suggestion</h4>
              <button onClick={cancelRating} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="rating-preview">
                <h6>Rating: {suggestion.tag.title}</h6>
                <p className="text-muted">{suggestion.reasoning}</p>
              </div>
              
              {/* Suggestion History Section */}
              <div className="suggestion-history-section">
                <h6>Suggestion History</h6>
                {loadingHistory ? (
                  <div className="loading-history">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading history...</p>
                  </div>
                ) : suggestionHistory.length > 1 ? (
                  <div className="history-list">
                    {suggestionHistory.slice(0, 3).map((version) => (
                      <div key={version.id} className="history-item">
                        <div className="history-content">
                          <p>{version.reasoning}</p>
                        </div>
                        <div className="history-meta">
                          {version.userRating ? (
                            <div className="rating-info">
                              <span className="rating-stars">
                                {'★'.repeat(version.userRating)}{'☆'.repeat(5 - version.userRating)}
                              </span>
                              {version.ratingComment && (
                                <span className="rating-comment">"{version.ratingComment}"</span>
                              )}
                            </div>
                          ) : (
                            <div className="rating-info no-rating">
                              <span className="rating-stars">No rating</span>
                            </div>
                          )}
                          {version.regenerationReason && (
                            <div className="regeneration-reason">
                              <strong>Regeneration reason:</strong> {version.regenerationReason}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-history">
                    <p>No previous versions found. This is the original suggestion.</p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="rating">How would you rate this suggestion?</label>
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
                  placeholder="Share your thoughts about this suggestion. This feedback helps improve future AI suggestions..."
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
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleRegenerate}
                disabled={regenerating}
              >
                {regenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Regenerating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i> Regenerate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="dialog-overlay">
          <div className="dialog history-modal">
            <div className="modal-header">
              <h4>Suggestion History: {suggestion.tag.title}</h4>
              <button onClick={closeHistory} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              {loadingHistory ? (
                <div className="loading-history">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading history...</p>
                </div>
              ) : suggestionHistory.length > 0 ? (
                <div className="history-list">
                  {suggestionHistory.map((version) => (
                    <div key={version.id} className="history-item">
                      <div className="history-content">
                        <p>{version.reasoning}</p>
                      </div>
                      <div className="history-meta">
                        <span className="version">v{version.version}</span>
                        <span className="date">{formatDate(version.createdAt)}</span>
                        {version.userRating ? (
                          <div className="rating-info">
                            <span className="rating-stars">
                              {'★'.repeat(version.userRating)}{'☆'.repeat(5 - version.userRating)}
                            </span>
                            {version.ratingComment && (
                              <span className="rating-comment">"{version.ratingComment}"</span>
                            )}
                          </div>
                        ) : (
                          <div className="rating-info no-rating">
                            <span className="rating-stars">No rating</span>
                          </div>
                        )}
                        {version.regenerationReason && (
                          <div className="regeneration-reason">
                            <strong>Regeneration reason:</strong> {version.regenerationReason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-history">
                  <p>No previous versions found. This is the original suggestion.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeHistory}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pitch Section */}
      {showPitches && (
        <div className="pitch-section">
          <div className="pitch-header">
            <h5>Story Pitches</h5>
            <div className="pitch-controls">
              <button 
                onClick={() => generatePitches(3)}
                disabled={generatingPitches}
                className="generate-pitches-btn"
              >
                {generatingPitches ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i> Generate New
                  </>
                )}
              </button>
              {pitches.length > 0 && (
                <button 
                  onClick={deleteAllPitches}
                  className="clear-pitches-btn"
                  title="Delete all pitches"
                >
                  <i className="fas fa-trash"></i>
                  Clear All
                </button>
              )}
            </div>
          </div>

          {loadingPitches ? (
            <div className="loading-pitches">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading pitches...</p>
            </div>
          ) : pitches.length > 0 ? (
            <div className="pitches-list">
              {pitches.map((pitch) => (
                <TagSuggestionPitchCard
                  key={pitch.id}
                  pitch={pitch}
                  onDelete={handlePitchDelete}
                  onUpdate={handlePitchUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="no-pitches">
              <p>No pitches generated yet. Click "Generate New" to create story pitches based on this suggestion.</p>
            </div>
          )}
        </div>
      )}
      
      <div className="suggestion-actions">
        {type === 'pending' && (
          <>
            <button 
              onClick={handleAccept}
              className="accept-btn"
            >
              Accept
            </button>
            <button 
              onClick={handleReject}
              className="reject-btn"
            >
              Reject
            </button>
            <button 
              onClick={handleRateClick}
              className="rate-btn"
              title="Rate this suggestion"
            >
              <i className="fas fa-star"></i>
              Rate
            </button>
            <button 
              onClick={handleHistoryClick}
              className="history-btn"
              title="View suggestion history"
            >
              <i className="fas fa-history"></i>
              History
            </button>
            <button 
              onClick={togglePitches}
              className="pitch-btn"
              title="View story pitches"
            >
              <i className="fas fa-lightbulb"></i>
              Pitches ({pitches.length})
            </button>
          </>
        )}
        {type === 'rejected' && (
          <>
            <button 
              onClick={handleAccept}
              className="rate-btn"
            >
              Move to pending
            </button>
            <button 
              onClick={handleRateClick}
              className="rate-btn"
              title="Rate this suggestion"
            >
              <i className="fas fa-star"></i>
              Rate
            </button>
            <button 
              onClick={handleHistoryClick}
              className="history-btn"
              title="View suggestion history"
            >
              <i className="fas fa-history"></i>
              History
            </button>
            <button 
              onClick={togglePitches}
              className="pitch-btn"
              title="View story pitches"
            >
              <i className="fas fa-lightbulb"></i>
              Pitches ({pitches.length})
            </button>
          </>
        )}
        {type === 'accepted' && (
          <>
            <button 
              onClick={handleReject}
              className="reject-btn"
            >
              Reject
            </button>
            <button 
              onClick={handleRateClick}
              className="rate-btn"
              title="Rate this suggestion"
            >
              <i className="fas fa-star"></i>
              Rate
            </button>
            <button 
              onClick={handleHistoryClick}
              className="history-btn"
              title="View suggestion history"
            >
              <i className="fas fa-history"></i>
              History
            </button>
            <button 
              onClick={togglePitches}
              className="pitch-btn"
              title="View story pitches"
            >
              <i className="fas fa-lightbulb"></i>
              Pitches ({pitches.length})
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SuggestionCard; 