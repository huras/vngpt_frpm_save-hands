import React, { useState, useEffect } from 'react';
import { intelligentTagApi } from '../services/intelligentTagApi';
import { BACKEND_CONFIG } from '../config/backend';
import TagImagePopup from './TagImagePopup';
import StarRating from './StarRating';

// Enhanced SuggestionCard component with rating, history, and regenerate features
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
      await intelligentTagApi.rateSuggestion(suggestion.id, ratingValue, ratingComment);
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
              {suggestion.userRating && (
                <span className="rating-display">
                  {'★'.repeat(suggestion.userRating)}{'☆'.repeat(5 - suggestion.userRating)}
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
                          {version.userRating && (
                            <div className="rating-info">
                              <span className="rating-stars">
                                {'★'.repeat(version.userRating)}{'☆'.repeat(5 - version.userRating)}
                              </span>
                              {version.ratingComment && (
                                <span className="rating-comment">"{version.ratingComment}"</span>
                              )}
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
                        {version.userRating && (
                          <div className="rating-info">
                            <span className="rating-stars">
                              {'★'.repeat(version.userRating)}{'☆'.repeat(5 - version.userRating)}
                            </span>
                            {version.ratingComment && (
                              <span className="rating-comment">"{version.ratingComment}"</span>
                            )}
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
          </>
        )}
      </div>
    </div>
  );
};

const StreamingTagSuggestions = ({ storyId }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [rejectedSuggestions, setRejectedSuggestions] = useState([]);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'rejected', or 'accepted'
  const [isLoading, setIsLoading] = useState(false);

  // Load existing suggestions and rejected suggestions on component mount
  useEffect(() => {
    if (storyId) {
      loadSuggestions();
    }
  }, [storyId]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      // Load pending suggestions
      const pendingResponse = await intelligentTagApi.getSuggestions(storyId, 'pending');
      console.log('Pending response:', pendingResponse);
      const pendingData = pendingResponse.data?.data || [];
      console.log('Pending data:', pendingData);
      setSuggestions(pendingData);

      // Load rejected suggestions
      const rejectedResponse = await intelligentTagApi.getSuggestions(storyId, 'rejected');
      console.log('Rejected response:', rejectedResponse);
      const rejectedData = rejectedResponse.data?.data || [];
      console.log('Rejected data:', rejectedData);
      setRejectedSuggestions(rejectedData);

      // Load accepted suggestions
      const acceptedResponse = await intelligentTagApi.getSuggestions(storyId, 'accepted');
      console.log('Accepted response:', acceptedResponse);
      const acceptedData = acceptedResponse.data?.data || [];
      console.log('Accepted data:', acceptedData);
      setAcceptedSuggestions(acceptedData);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setError('Failed to load suggestions');
      // Set empty arrays as fallback
      setSuggestions([]);
      setRejectedSuggestions([]);
      setAcceptedSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = async (limit = 10) => {
    setIsGenerating(true);
    setSuggestions([]);
    setError(null);
    setProgress({ current: 0, total: limit });

    try {
      console.log(`Starting iterative streaming suggestions for story ${storyId}, limit: ${limit}`);
      
      intelligentTagApi.generateSuggestionsStreaming(
        storyId,
        limit,
        // onSuggestion callback - handle each suggestion as it arrives
        (suggestion) => {
          console.log(`Received suggestion ${suggestion.suggestionNumber}/${suggestion.totalSuggestions}:`, suggestion);
          
          // Add the suggestion to the list immediately
          setSuggestions(prev => {
            const newSuggestions = [...prev, suggestion];
            console.log(`Updated suggestions list, now has ${newSuggestions.length} items`);
            return newSuggestions;
          });
          
          // Update progress
          setProgress(prev => ({ 
            ...prev, 
            current: suggestion.suggestionNumber,
            total: suggestion.totalSuggestions 
          }));
          
          console.log(`Progress: ${suggestion.suggestionNumber}/${suggestion.totalSuggestions}`);
        },
        // onComplete callback
        (result) => {
          console.log('Streaming completed:', result);
          setIsGenerating(false);
          setProgress({ current: 0, total: 0 });
          
          // Show success message
          console.log(`Successfully generated ${result.suggestions?.length || 0} suggestions`);
          
          // Refresh the suggestions list to show the new suggestions
          loadSuggestions();
        },
        // onError callback
        (error) => {
          console.error('Streaming error:', error);
          setError(error);
          setIsGenerating(false);
          setProgress({ current: 0, total: 0 });
        }
      );
    } catch (error) {
      console.error('Error starting streaming:', error);
      setError(error.message);
      setIsGenerating(false);
    }
  };

  const acceptSuggestion = async (suggestionId, userExplanation = null) => {
    try {
      await intelligentTagApi.acceptSuggestion(suggestionId, userExplanation);
      // Refresh the suggestions list to reflect the changes
      loadSuggestions();
    } catch (error) {
      console.error('Error accepting suggestion:', error);
    }
  };

  const rejectSuggestion = async (suggestionId, reason = null) => {
    try {
      await intelligentTagApi.rejectSuggestion(suggestionId, reason);
      // Refresh the suggestions list to reflect the changes
      loadSuggestions();
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
    }
  };

  const clearPendingSuggestions = async () => {
    if (!window.confirm('Are you sure you want to clear all pending suggestions? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await intelligentTagApi.clearPendingSuggestions(storyId);
      
      if (response.data?.success) {
        console.log(`Cleared ${response.data.clearedCount} pending suggestions`);
        // Clear the suggestions from the state
        setSuggestions([]);
        // Show success message
        alert(`Successfully cleared ${response.data.clearedCount} pending suggestions`);
      } else {
        console.error('Failed to clear suggestions:', response.data);
        alert('Failed to clear suggestions. Please try again.');
      }
    } catch (error) {
      console.error('Error clearing pending suggestions:', error);
      alert('Error clearing suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingUpdate = async (suggestionId, rating, comment) => {
    // Update the suggestion in the appropriate list with the new rating
    const updateSuggestionInList = (list, setList) => {
      setList(prev => prev.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...suggestion, userRating: rating, ratingComment: comment }
          : suggestion
      ));
    };

    updateSuggestionInList(suggestions, setSuggestions);
    updateSuggestionInList(rejectedSuggestions, setRejectedSuggestions);
    updateSuggestionInList(acceptedSuggestions, setAcceptedSuggestions);
  };

  const handleSuggestionRegenerate = async (suggestionId, newSuggestion) => {
    // Update the suggestion in the appropriate list with the new suggestion
    const updateSuggestionInList = (list, setList) => {
      setList(prev => prev.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...newSuggestion, tag: suggestion.tag } // Preserve the tag object
          : suggestion
      ));
    };

    updateSuggestionInList(suggestions, setSuggestions);
    updateSuggestionInList(rejectedSuggestions, setRejectedSuggestions);
    updateSuggestionInList(acceptedSuggestions, setAcceptedSuggestions);
  };

  if (!storyId) {
    return (
      <div className="streaming-suggestions">
        <p>No story ID provided</p>
      </div>
    );
  }

  return (
    <div className="streaming-suggestions">
      <h3>AI Tag Suggestions</h3>
      
      <div className="controls">
        <button 
          onClick={() => generateSuggestions(5)}
          disabled={isGenerating}
          className="generate-btn"
        >
          {isGenerating ? 'Generating...' : 'Generate 5 Suggestions'}
        </button>
        
        <button 
          onClick={() => generateSuggestions(10)}
          disabled={isGenerating}
          className="generate-btn"
        >
          {isGenerating ? 'Generating...' : 'Generate 10 Suggestions'}
        </button>

        {suggestions.length > 0 && (
          <button 
            onClick={clearPendingSuggestions}
            disabled={isGenerating || isLoading}
            className="clear-btn"
            title="Clear all pending suggestions"
          >
            <i className="fas fa-trash"></i>
            Clear Pending
          </button>
        )}
      </div>

      {isGenerating && (
        <div className="progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
          <p>
            <i className="fas fa-magic"></i>
            Generating suggestion {progress.current} of {progress.total}...
            {progress.current > 0 && (
              <span className="progress-detail">
                <br />
                <small>Building upon previous suggestions for better context...</small>
              </span>
            )}
          </p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Suggestions ({suggestions?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          Accepted Suggestions ({acceptedSuggestions?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected Suggestions ({rejectedSuggestions?.length || 0})
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="loading">
          <p>Loading suggestions...</p>
        </div>
      )}

      {/* Pending Suggestions Tab */}
      {activeTab === 'pending' && !isLoading && (
        <div className="suggestions-list">
          {(!suggestions || suggestions.length === 0) ? (
            <div className="empty-state">
              <p>No pending suggestions. Generate some new suggestions to get started!</p>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <SuggestionCard 
                key={suggestion.id} 
                suggestion={suggestion}
                onAccept={acceptSuggestion}
                onReject={rejectSuggestion}
                onRate={handleRatingUpdate}
                onHistory={() => {}} // Handled internally in SuggestionCard
                onRegenerate={handleSuggestionRegenerate}
                type="pending"
              />
            ))
          )}
        </div>
      )}

      {/* Accepted Suggestions Tab */}
      {activeTab === 'accepted' && !isLoading && (
        <div className="suggestions-list">
          {(!acceptedSuggestions || acceptedSuggestions.length === 0) ? (
            <div className="empty-state">
              <p>No accepted suggestions yet.</p>
            </div>
          ) : (
            acceptedSuggestions.map((suggestion) => (
              <SuggestionCard 
                key={suggestion.id} 
                suggestion={suggestion}
                onAccept={acceptSuggestion}
                onReject={rejectSuggestion}
                onRate={handleRatingUpdate}
                onHistory={() => {}} // Handled internally in SuggestionCard
                onRegenerate={handleSuggestionRegenerate}
                type="accepted"
              />
            ))
          )}
        </div>
      )}

      {/* Rejected Suggestions Tab */}
      {activeTab === 'rejected' && !isLoading && (
        <div className="suggestions-list">
          {(!rejectedSuggestions || rejectedSuggestions.length === 0) ? (
            <div className="empty-state">
              <p>No rejected suggestions yet.</p>
            </div>
          ) : (
            rejectedSuggestions.map((suggestion) => (
              <SuggestionCard 
                key={suggestion.id} 
                suggestion={suggestion}
                onAccept={acceptSuggestion}
                onReject={rejectSuggestion}
                onRate={handleRatingUpdate}
                onHistory={() => {}} // Handled internally in SuggestionCard
                onRegenerate={handleSuggestionRegenerate}
                type="rejected"
              />
            ))
          )}
        </div>
      )}

      <style>{`
        .streaming-suggestions {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .controls {
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
        }

        .generate-btn {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .generate-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .clear-btn {
          padding: 10px 20px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.3s ease;
        }

        .clear-btn:hover:not(:disabled) {
          background: #c82333;
        }

        .clear-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .progress {
          margin-bottom: 20px;
        }

        .progress-bar {
          width: 100%;
          height: 20px;
          background: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #28a745;
          transition: width 0.3s ease;
        }

        .progress p {
          margin: 10px 0 0 0;
          text-align: center;
          color: #666;
        }

        .progress-detail {
          display: block;
          margin-top: 5px;
        }

        .progress-detail small {
          color: #888;
          font-style: italic;
        }

        .error {
          color: #dc3545;
          margin-bottom: 20px;
          padding: 10px;
          background: #f8d7da;
          border-radius: 5px;
        }

        .loading {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #666;
          background: #f8f9fa;
          border-radius: 8px;
        }

        /* Tabs */
        .tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }

        .tab {
          padding: 12px 24px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 14px;
          color: #666;
          transition: all 0.3s ease;
        }

        .tab:hover {
          color: #007bff;
        }

        .tab.active {
          color: #007bff;
          border-bottom-color: #007bff;
          font-weight: 600;
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .suggestion-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background: white;
          transition: all 0.3s ease;
          position: relative;
        }

        .suggestion-content {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }

        .suggestion-image {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.2s ease;
        }

        .suggestion-image:hover {
          border-color: rgba(0, 123, 255, 0.3);
          transform: scale(1.05);
        }

        .suggestion-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .suggestion-image .no-image {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #007bff, #0056b3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: bold;
          color: white;
        }

        .suggestion-image .tag-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s ease;
        }

        .popup-indicator {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          opacity: 0.8;
          transition: opacity 0.2s ease;
          cursor: pointer;
        }

        .suggestion-image:hover .popup-indicator {
          opacity: 1;
          background: rgba(0, 0, 0, 0.9);
        }

        .suggestion-details {
          flex: 1;
          min-width: 0;
        }

        /* Responsive design for smaller screens */
        @media (max-width: 768px) {
          .suggestion-content {
            flex-direction: column;
            gap: 10px;
          }

          .suggestion-image {
            width: 60px;
            height: 60px;
            align-self: flex-start;
          }

          .suggestion-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }

          .popup-indicator {
            width: 16px;
            height: 16px;
            font-size: 0.6rem;
            top: 3px;
            right: 3px;
          }
        }

        .suggestion-card.rejected {
          border-left: 4px solid #dc3545;
          background: #f8f9fa;
        }

        .suggestion-card.accepted {
          border-left: 4px solid #28a745;
          background: #f8fff9;
        }

        .suggestion-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .suggestion-header h4 {
          margin: 0;
          color: #333;
          font-size: 1.1rem;
          line-height: 1.2;
        }

        .suggestion-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .confidence {
          background: #e9ecef;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.9em;
          white-space: nowrap;
        }

        .rating-display {
          color: #ffc107;
          font-size: 0.9em;
        }

        .rejected-badge {
          background: #dc3545;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: 600;
        }

        .accepted-badge {
          background: #28a745;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: 600;
        }

        .reasoning {
          color: #666;
          line-height: 1.5;
          margin-bottom: 15px;
        }

        .rejection-reason {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 15px;
          color: #856404;
        }

        .acceptance-explanation {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 15px;
          color: #155724;
        }

        .suggestion-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .accept-btn {
          padding: 8px 16px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .accept-btn:hover {
          background: #218838;
        }

        .reject-btn {
          padding: 8px 16px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .reject-btn:hover {
          background: #c82333;
        }

        .rate-btn {
          padding: 8px 16px;
          background: #ffc107;
          color: #212529;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .rate-btn:hover {
          background: #e0a800;
        }

        .history-btn {
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .history-btn:hover {
          background: #5a6268;
        }

        /* Dialog Styles */
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .dialog {
          background: white;
          border-radius: 8px;
          padding: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .dialog h4 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .dialog p {
          margin: 0 0 15px 0;
          color: #666;
        }

        .dialog textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
          font-family: inherit;
          margin-bottom: 15px;
        }

        .dialog textarea:focus {
          outline: none;
          border-color: #007bff;
        }

        .dialog-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .cancel-btn {
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .cancel-btn:hover {
          background: #5a6268;
        }

        /* Rating Modal Styles */
        .rating-modal {
          max-width: 600px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #333;
        }

        .modal-body {
          margin-bottom: 20px;
        }

        .rating-preview {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .rating-preview h6 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .suggestion-history-section {
          margin-bottom: 20px;
        }

        .suggestion-history-section h6 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .loading-history {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .history-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 10px;
        }

        .history-item {
          padding: 10px;
          border-bottom: 1px solid #eee;
          margin-bottom: 10px;
        }

        .history-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .history-content p {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 0.9em;
        }

        .history-meta {
          font-size: 0.8em;
          color: #888;
        }

        .version {
          background: #e9ecef;
          padding: 2px 6px;
          border-radius: 3px;
          margin-right: 8px;
        }

        .date {
          color: #666;
        }

        .rating-info {
          margin-top: 5px;
        }

        .rating-stars {
          color: #ffc107;
          margin-right: 8px;
        }

        .rating-comment {
          font-style: italic;
        }

        .regeneration-reason {
          margin-top: 5px;
          font-style: italic;
        }

        .no-history {
          text-align: center;
          padding: 20px;
          color: #666;
          font-style: italic;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }

        .form-control {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          resize: vertical;
        }

        .form-control:focus {
          outline: none;
          border-color: #007bff;
        }

        .form-text {
          font-size: 0.875em;
          color: #6c757d;
          margin-top: 5px;
        }

        .modal-footer {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s ease;
          font-size: 14px;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .btn-warning {
          background: #ffc107;
          color: #212529;
        }

        .btn-warning:hover {
          background: #e0a800;
        }

        .btn-outline-primary {
          background: transparent;
          color: #007bff;
          border: 1px solid #007bff;
        }

        .btn-outline-primary:hover {
          background: #007bff;
          color: white;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* History Modal Styles */
        .history-modal {
          max-width: 700px;
        }

        .history-modal .history-list {
          max-height: 400px;
        }
      `}</style>
    </div>
  );
};

export default StreamingTagSuggestions; 