import React, { useState, useEffect, useCallback } from 'react';
import { BACKEND_CONFIG } from '../config/backend';
import { intelligentTagApi } from '../services/intelligentTagApi';
import TagImagePopup from './TagImagePopup';
import ReasoningDialogTree from './ReasoningDialogTree';
import StarRating from './StarRating';
import TagCardSuggestion from './TagCardSuggestion';
import TagCardSelected from './TagCardSelected';
import './IntelligentTagSelector.scss';

const IntelligentTagSelector = ({ 
  storyId, 
  onTagsChange, 
  disabled = false,
  title = 'Intelligent Tag Suggestions'
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [reasonings, setReasonings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reevaluating, setReevaluating] = useState(false);
  const [reevaluateStatus, setReevaluateStatus] = useState('');
  const [reevaluationNeeded, setReevaluationNeeded] = useState(false);
  const [checkingReevaluationStatus, setCheckingReevaluationStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualTag, setManualTag] = useState({ tagId: '', directive: '', userExplanation: '' });
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectingSuggestion, setRejectingSuggestion] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [generatingExplanation, setGeneratingExplanation] = useState(false);
  const [regeneratingExplanationFor, setRegeneratingExplanationFor] = useState(null);
  const [editingReasoning, setEditingReasoning] = useState(null);
  const [reasoningDialogOpen, setReasoningDialogOpen] = useState(false);
  const [selectedReasoningTag, setSelectedReasoningTag] = useState(null);
  const [ratingSuggestion, setRatingSuggestion] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSuggestionId, setRatingSuggestionId] = useState(null);
  const [regeneratingSuggestion, setRegeneratingSuggestion] = useState(null);
  const [showSuggestionHistory, setShowSuggestionHistory] = useState(false);
  const [selectedSuggestionForHistory, setSelectedSuggestionForHistory] = useState(null);
  const [regeneratingInModal, setRegeneratingInModal] = useState(false);
  const [suggestionHistory, setSuggestionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptingSuggestion, setAcceptingSuggestion] = useState(null);
  const [acceptExplanation, setAcceptExplanation] = useState('');
  const [showRejectAcceptedModal, setShowRejectAcceptedModal] = useState(false);
  const [rejectingReasoning, setRejectingReasoning] = useState(null);
  const [rejectAcceptedReason, setRejectAcceptedReason] = useState('');

  // Fetch initial data
  useEffect(() => {
    if (storyId) {
      fetchSuggestions();
      fetchReasonings();
      checkReevaluationStatus();
    }
  }, [storyId]);

  const checkReevaluationStatus = async () => {
    try {
      setCheckingReevaluationStatus(true);
      const response = await intelligentTagApi.checkReevaluationStatus(storyId);
      
      if (response.data.success) {
        setReevaluationNeeded(response.data.isReevaluationNeeded);
      }
    } catch (error) {
      console.error('Error checking re-evaluation status:', error);
      setReevaluationNeeded(false);
    } finally {
      setCheckingReevaluationStatus(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await intelligentTagApi.getSuggestions(storyId, 'pending');
      
      if (response.data.success) {
        setSuggestions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReasonings = async () => {
    try {
      const response = await intelligentTagApi.getStoryReasonings(storyId);
      
      if (response.data.success) {
        setReasonings(response.data.data);
        setSelectedTags(response.data.data.map(reasoning => reasoning.tag));
      }
    } catch (error) {
      console.error('Error fetching reasonings:', error);
    }
  };

  const generateSuggestions = async () => {
    try {
      setGenerating(true);
      const response = await intelligentTagApi.generateSuggestions(storyId, 10);
      
      if (response.data.success) {
        await fetchSuggestions();
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setGenerating(false);
    }
  };

  const acceptSuggestion = async (suggestionId, userExplanation = null) => {
    try {
      const response = await intelligentTagApi.acceptSuggestion(suggestionId, userExplanation);
      
      if (response.data.success) {
        await fetchSuggestions();
        await fetchReasonings();
        await checkReevaluationStatus(); // Check if re-evaluation is now needed
        onTagsChange && onTagsChange(selectedTags);
      }
    } catch (error) {
      console.error('Error accepting suggestion:', error);
    }
  };

  const handleRateClick = (suggestion) => {
    // Show rating modal with history
    setRatingSuggestion(suggestion);
    setRatingValue(0);
    setRatingComment('');
    setRatingSuggestionId(suggestion.id);
    fetchSuggestionHistory(storyId, suggestion.tag.id);
  };

  const handleAcceptClick = (suggestion) => {
    // Show accept modal
    setAcceptingSuggestion(suggestion);
    setAcceptExplanation('');
    setShowAcceptModal(true);
  };

  const rejectSuggestion = async (suggestionId, reason = null) => {
    try {
      const response = await intelligentTagApi.rejectSuggestion(suggestionId, reason);
      
      if (response.data.success) {
        await fetchSuggestions();
        setShowRejectionModal(false);
        setRejectingSuggestion(null);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
    }
  };

  const handleRejectClick = (suggestion) => {
    setRejectingSuggestion(suggestion);
    setShowRejectionModal(true);
  };

  const handleRejectConfirm = () => {
    if (rejectingSuggestion) {
      rejectSuggestion(rejectingSuggestion.id, rejectionReason);
    }
  };

  const handleRejectCancel = () => {
    setShowRejectionModal(false);
    setRejectingSuggestion(null);
    setRejectionReason('');
  };

  const searchTags = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await intelligentTagApi.searchTags(query.trim(), 20);
      
      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch (error) {
      console.error('Error searching tags:', error);
    } finally {
      setSearching(false);
    }
  }, []);

  const addTagManually = async () => {
    if (!manualTag.tagId || !manualTag.directive) {
      alert('Please provide both tag and directive');
      return;
    }

    try {
      const response = await intelligentTagApi.addTagManually(
        storyId, 
        manualTag.tagId, 
        manualTag.directive, 
        manualTag.userExplanation
      );
      
      if (response.data.success) {
        setManualTag({ tagId: '', directive: '', userExplanation: '' });
        setShowManualAdd(false);
        await fetchReasonings();
        await checkReevaluationStatus(); // Refresh the status
        onTagsChange && onTagsChange(selectedTags);
      }
    } catch (error) {
      console.error('Error adding tag manually:', error);
    }
  };

  const generateDirective = async () => {
    if (!manualTag.tagId) {
      alert('Please select a tag first');
      return;
    }

    try {
      setGeneratingExplanation(true);
      const response = await intelligentTagApi.generateDirective(
        storyId, 
        manualTag.tagId
      );
      
      if (response.data.success) {
        // For manual add, we just update the form state
        // The directive will be saved when the user clicks "Add Tag"
        setManualTag(prev => ({ 
          ...prev, 
          directive: response.data.data.directive 
        }));
      }
    } catch (error) {
      console.error('Error generating directive:', error);
      alert('Failed to generate directive. Please try again.');
    } finally {
      setGeneratingExplanation(false);
    }
  };

  const regenerateDirective = async (reasoningId, tagId) => {
    try {
      setRegeneratingExplanationFor(reasoningId);
      const response = await intelligentTagApi.generateDirective(
        storyId, 
        tagId
      );
      
      if (response.data.success) {
        // Create a new commentary version with the AI-generated directive
        const commentaryResponse = await intelligentTagApi.createCommentary(
          storyId,
          tagId,
          response.data.data.directive,
          'AI Regenerate - User requested new directive',
          'ai_directive'
        );

        if (commentaryResponse.data.success) {
          // Update the reasoning in the local state
          setReasonings(prev => prev.map(reasoning => 
            reasoning.id === reasoningId 
              ? { ...reasoning, reasoning: response.data.data.directive }
              : reasoning
          ));
          
          // Refresh the reasonings to get the updated data
          await fetchReasonings();
        } else {
          throw new Error('Failed to save new directive');
        }
      }
    } catch (error) {
      console.error('Error regenerating directive:', error);
      alert('Failed to regenerate directive. Please try again.');
    } finally {
      setRegeneratingExplanationFor(null);
    }
  };

  const regenerateSuggestion = async (suggestionId) => {
    try {
      setRegeneratingSuggestion(suggestionId);
      const response = await intelligentTagApi.regenerateSuggestion(suggestionId);
      
      if (response.data.success) {
        // Refresh suggestions to show the updated one
        await fetchSuggestions();
      } else {
        throw new Error('Failed to regenerate suggestion');
      }
    } catch (error) {
      console.error('Error regenerating suggestion:', error);
      alert('Failed to regenerate suggestion. Please try again.');
    } finally {
      setRegeneratingSuggestion(null);
    }
  };

  const regenerateSuggestionInModal = async () => {
    if (!ratingSuggestion) return;

    try {
      setRegeneratingInModal(true);
      
      // Combine rating and feedback for better AI improvement
      const feedback = `Rating: ${ratingValue}/5 stars${ratingComment ? ` | Comments: ${ratingComment}` : ''}`;
      
      const response = await intelligentTagApi.regenerateSuggestion(ratingSuggestion.id, feedback);
      
      if (response.data.success) {
        // Update the current suggestion in the modal
        setRatingSuggestion(response.data.suggestion);
        setRatingValue(0);
        setRatingComment('');
        
        // Refresh suggestions list
        await fetchSuggestions();
      } else {
        throw new Error('Failed to regenerate suggestion');
      }
    } catch (error) {
      console.error('Error regenerating suggestion in modal:', error);
      alert('Failed to regenerate suggestion. Please try again.');
    } finally {
      setRegeneratingInModal(false);
    }
  };

  const fetchSuggestionHistory = async (storyId, tagId) => {
    try {
      setLoadingHistory(true);
      const response = await intelligentTagApi.getSuggestionHistory(storyId, tagId);
      
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

  const openSuggestionHistory = (suggestion) => {
    setSelectedSuggestionForHistory(suggestion);
    setShowSuggestionHistory(true);
    fetchSuggestionHistory(storyId, suggestion.tag.id);
  };

  const closeSuggestionHistory = () => {
    setShowSuggestionHistory(false);
    setSelectedSuggestionForHistory(null);
  };

  const updateExistingReasoning = async (reasoningId, newReasoning) => {
    try {
      // Find the reasoning to get the tagId
      const reasoning = reasonings.find(r => r.id === reasoningId);
      if (!reasoning) return;

      // Update the reasoning via the API
      const response = await intelligentTagApi.updateCommentary(
        storyId,
        reasoning.tagId,
        newReasoning
      );
      
      if (response.data.success) {
        // Update the reasoning in the local state
        setReasonings(prev => prev.map(r => 
          r.id === reasoningId 
            ? { ...r, reasoning: newReasoning }
            : r
        ));
        setEditingReasoning(null);
      }
    } catch (error) {
      console.error('Error updating reasoning:', error);
      alert('Failed to update reasoning. Please try again.');
    }
  };

  const openReasoningDialog = (reasoning) => {
    setSelectedReasoningTag({
      id: reasoning.tagId,
      title: reasoning.tag.title
    });
    setReasoningDialogOpen(true);
  };

  const handleReasoningUpdate = (newReasoning) => {
    // Update the reasoning in the local state
    setReasonings(prev => prev.map(r => 
      r.tagId === selectedReasoningTag.id 
        ? { ...r, reasoning: newReasoning }
        : r
    ));
  };

  const handleRateSuggestion = (suggestion) => {
    setRatingSuggestion(suggestion);
    setRatingValue(0);
    setRatingComment('');
    setRatingSuggestionId(suggestion.id);
  };

  const submitRating = async () => {
    if (ratingValue === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      // Rate the suggestion only
      const ratingResponse = await intelligentTagApi.rateSuggestion(
        ratingSuggestionId,
        ratingValue,
        ratingComment
      );
      
      if (ratingResponse.data.success) {
        // Refresh suggestions to show updated rating
        await fetchSuggestions();
        
        // Close rating modal
        setRatingSuggestion(null);
        setRatingValue(0);
        setRatingComment('');
        setRatingSuggestionId(null);
        
        alert('Rating submitted successfully! You can now accept or reject this suggestion.');
      } else {
        throw new Error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error in rating suggestion:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const cancelRating = () => {
    setRatingSuggestion(null);
    setRatingValue(0);
    setRatingComment('');
    setRatingSuggestionId(null);
  };

  const handleRejectAcceptedClick = (reasoning) => {
    setRejectingReasoning(reasoning);
    setRejectAcceptedReason('');
    setShowRejectAcceptedModal(true);
  };

  const handleRejectAcceptedConfirm = async () => {
    if (!rejectAcceptedReason.trim()) {
      alert('Please provide a reason for rejecting this tag.');
      return;
    }

    try {
      const response = await intelligentTagApi.rejectAcceptedSuggestion(
        rejectingReasoning.id,
        rejectAcceptedReason
      );
      
      if (response.data.success) {
        await fetchSuggestions();
        await fetchReasonings();
        setShowRejectAcceptedModal(false);
        setRejectingReasoning(null);
        setRejectAcceptedReason('');
        onTagsChange && onTagsChange(selectedTags);
      }
    } catch (error) {
      console.error('Error rejecting accepted suggestion:', error);
      alert('Failed to reject suggestion. Please try again.');
    }
  };

  const handleRejectAcceptedCancel = () => {
    setShowRejectAcceptedModal(false);
    setRejectingReasoning(null);
    setRejectAcceptedReason('');
  };

  const handleAcceptConfirm = async () => {
    try {
      const response = await intelligentTagApi.acceptSuggestion(
        acceptingSuggestion.id,
        acceptExplanation
      );
      
      if (response.data.success) {
        await fetchSuggestions();
        await fetchReasonings();
        setShowAcceptModal(false);
        setAcceptingSuggestion(null);
        setAcceptExplanation('');
        onTagsChange && onTagsChange(selectedTags);
      }
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      alert('Failed to accept suggestion. Please try again.');
    }
  };

  const handleAcceptCancel = () => {
    setShowAcceptModal(false);
    setAcceptingSuggestion(null);
    setAcceptExplanation('');
  };

  const reevaluateSuggestions = async () => {
    try {
      setReevaluating(true);
      setReevaluateStatus('Re-evaluating suggestions...');
      
      const response = await intelligentTagApi.reevaluateSuggestions(storyId);
      
      if (response.data.success) {
        setReevaluateStatus('Suggestions updated successfully!');
        await fetchSuggestions();
        await checkReevaluationStatus(); // Refresh the status
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setReevaluateStatus('');
        }, 3000);
      } else {
        setReevaluateStatus('Failed to re-evaluate suggestions');
        
        // Clear error status after 5 seconds
        setTimeout(() => {
          setReevaluateStatus('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error re-evaluating suggestions:', error);
      setReevaluateStatus('Error: Failed to re-evaluate suggestions');
      
      // Clear error status after 5 seconds
      setTimeout(() => {
        setReevaluateStatus('');
      }, 5000);
    } finally {
      setReevaluating(false);
    }
  };

  return (
    <div className="intelligent-tag-selector">
      <div className="selector-header">
        <h3>{title}</h3>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={generateSuggestions}
            disabled={disabled || generating}
          >
            {generating ? 'Generating...' : 'Generate Suggestions'}
          </button>
          <div className="reevaluate-section">
            <button 
              className="btn btn-secondary"
              onClick={reevaluateSuggestions}
              disabled={disabled || reevaluating || !reevaluationNeeded || checkingReevaluationStatus}
            >
              {reevaluating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Re-evaluating...
                </>
              ) : checkingReevaluationStatus ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Checking...
                </>
              ) : !reevaluationNeeded ? (
                <>
                  <i className="fas fa-check"></i> Up to Date
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt"></i> Re-evaluate
                </>
              )}
            </button>
            {reevaluateStatus && (
              <div className={`reevaluate-status ${reevaluateStatus.includes('Error') || reevaluateStatus.includes('Failed') ? 'error' : 'success'}`}>
                {reevaluateStatus}
              </div>
            )}
            {!reevaluationNeeded && !reevaluateStatus && !checkingReevaluationStatus && (
              <div className="reevaluate-status info">
                No changes detected since last re-evaluation
              </div>
            )}
          </div>
          <button 
            className="btn btn-outline-primary"
            onClick={() => setShowManualAdd(!showManualAdd)}
            disabled={disabled}
          >
            {showManualAdd ? 'Cancel' : 'Add Manually'}
          </button>
        </div>
      </div>

      {/* Manual Tag Addition */}
      {showManualAdd && (
        <div className="manual-add-section">
          <h4>Add Tag Manually</h4>
          <div className="search-section">
            <input
              type="text"
              placeholder="Search for tags..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchTags(e.target.value);
              }}
              className="form-control"
            />
            {searching && <div className="searching-indicator">Searching...</div>}
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(tag => (
                  <div 
                    key={tag.id} 
                    className="search-result-item"
                    onClick={() => setManualTag(prev => ({ ...prev, tagId: tag.id }))}
                  >
                    <div className="tag-info">
                      <h5>{tag.title}</h5>
                      <p>{tag.short_description}</p>
                    </div>
                    {tag.thumb_url && (
                      <TagImagePopup tag={tag} position="left">
                        <img 
                          src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
                          alt={tag.title} 
                          className="search-result-thumb"
                        />
                      </TagImagePopup>
                    )}
                    {manualTag.tagId === tag.id && <span className="selected-indicator">✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="directive-section">
            <div className="directive-input-group">
              <textarea
                placeholder="Explain how to use this tag effectively in your story..."
                value={manualTag.directive}
                onChange={(e) => setManualTag(prev => ({ ...prev, directive: e.target.value }))}
                className="form-control"
                rows={3}
              />
              <button
                type="button"
                className="btn btn-outline-primary ai-directive-btn"
                onClick={generateDirective}
                disabled={!manualTag.tagId || generatingExplanation || disabled}
                title="Use AI to generate a directive for how to use this tag effectively in your story"
              >
                {generatingExplanation ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>
                    <span>AI Directive</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              placeholder="Additional explanation (optional)..."
              value={manualTag.userExplanation}
              onChange={(e) => setManualTag(prev => ({ ...prev, userExplanation: e.target.value }))}
              className="form-control"
              rows={2}
            />
          </div>
          <button 
            className="btn btn-success"
            onClick={addTagManually}
            disabled={!manualTag.tagId || !manualTag.directive}
          >
            Add Tag
          </button>
        </div>
      )}

      {/* Selected Tags with Reasoning */}
      {selectedTags.length > 0 && (
        <div className="selected-tags-section">
          <h4>Your Story Tags</h4>
          <div className="selected-tags-list">
            {reasonings.map(reasoning => (
              <div key={reasoning.id} className="selected-tag-item">
                <TagCardSelected
                  reasoning={reasoning}
                  onAIRegenerate={regenerateDirective}
                  onEdit={(reasoningId) => setEditingReasoning(editingReasoning === reasoningId ? null : reasoningId)}
                  onRate={handleRateClick}
                  onHistory={openReasoningDialog}
                  onReject={handleRejectAcceptedClick}
                  onSaveEdit={updateExistingReasoning}
                  onCancelEdit={() => {
                    setEditingReasoning(null);
                    fetchReasonings();
                  }}
                  isEditing={editingReasoning === reasoning.id}
                  isRegenerating={regeneratingExplanationFor === reasoning.id}
                  disabled={disabled}
                  onReasoningChange={(newReasoning) => {
                    setReasonings(prev => prev.map(r => 
                      r.id === reasoning.id 
                        ? { ...r, reasoning: newReasoning }
                        : r
                    ));
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      <div className="suggestions-section">
        <h4>AI Suggestions</h4>
        {loading ? (
          <div className="loading">Loading suggestions...</div>
        ) : suggestions.length === 0 ? (
          <div className="no-suggestions">
            <p>No suggestions available. Click "Generate Suggestions" to get started.</p>
          </div>
        ) : (
          <div className="suggestions-list">
            {suggestions.map(suggestion => (
              <div key={suggestion.id} className="suggestion-item">
                <TagCardSuggestion
                  suggestion={suggestion}
                  onRate={handleRateClick}
                  onAccept={handleAcceptClick}
                  onReject={handleRejectClick}
                  disabled={disabled}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && rejectingSuggestion && (
        <div className="modal-overlay">
          <div className="modal-content rejection-modal">
            <div className="modal-header">
              <h5 className="modal-title">Reject Suggestion</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleRejectCancel}
              ></button>
            </div>
            <div className="modal-body">
              <div className="rejection-preview">
                <h6>Rejecting: {rejectingSuggestion.tag.title}</h6>
                <p className="text-muted">{rejectingSuggestion.reasoning}</p>
              </div>
              <div className="form-group">
                <label htmlFor="rejectionReason">Why are you rejecting this suggestion?</label>
                <textarea
                  id="rejectionReason"
                  className="form-control"
                  rows={3}
                  placeholder="Please provide a reason for rejecting this suggestion. This helps the AI learn and provide better suggestions in the future..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <small className="form-text text-muted">
                  Your feedback helps improve future suggestions for this story.
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRejectCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim()}
              >
                Reject Suggestion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingSuggestion && (
        <div className="modal-overlay">
          <div className="modal-content rating-modal">
            <div className="modal-header">
              <h5 className="modal-title">Rate Suggestion</h5>
              <button
                type="button"
                className="btn-close"
                onClick={cancelRating}
              ></button>
            </div>
            <div className="modal-body">
              <div className="rating-preview">
                <h6>Rating: {ratingSuggestion.tag.title}</h6>
                <p className="text-muted">{ratingSuggestion.reasoning}</p>
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
                    {suggestionHistory.slice(0, 3).map((version, index) => (
                      <div key={version.id} className={`history-item ${index === suggestionHistory.length - 1 ? 'current' : ''}`}>
                        <div className="history-header">
                          <span className="version-number">Version {version.version}</span>
                          <span className="version-date">{new Date(version.createdAt).toLocaleString()}</span>
                          {index === suggestionHistory.length - 1 && (
                            <span className="current-badge">Current</span>
                          )}
                        </div>
                        <div className="history-content">
                          <p className="reasoning">{version.reasoning}</p>
                          <div className="confidence-bar">
                            <div 
                              className="confidence-fill" 
                              style={{ width: `${version.confidence * 100}%` }}
                            ></div>
                            <span className="confidence-text">{Math.round(version.confidence * 100)}%</span>
                          </div>
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
                onClick={regenerateSuggestionInModal}
                disabled={regeneratingInModal || disabled}
              >
                {regeneratingInModal ? (
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

      {/* Reasoning Dialog Tree */}
      {reasoningDialogOpen && selectedReasoningTag && (
        <ReasoningDialogTree
          storyId={storyId}
          tagId={selectedReasoningTag.id}
          tagTitle={selectedReasoningTag.title}
          isOpen={reasoningDialogOpen}
          onClose={() => {
            setReasoningDialogOpen(false);
            setSelectedReasoningTag(null);
          }}
          onReasoningUpdate={handleReasoningUpdate}
        />
      )}

      {/* Accept Modal */}
      {showAcceptModal && acceptingSuggestion && (
        <div className="modal-overlay">
          <div className="modal-content accept-modal">
            <div className="modal-header">
              <h5 className="modal-title">Accept Suggestion</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleAcceptCancel}
              ></button>
            </div>
            <div className="modal-body">
              <div className="accept-preview">
                <h6>Accepting: {acceptingSuggestion.tag.title}</h6>
                <p className="text-muted">{acceptingSuggestion.reasoning}</p>
              </div>
              <div className="form-group">
                <label htmlFor="acceptExplanation">Additional explanation (optional)</label>
                <textarea
                  id="acceptExplanation"
                  className="form-control"
                  rows={3}
                  placeholder="Why are you accepting this suggestion? This helps improve future AI suggestions..."
                  value={acceptExplanation}
                  onChange={(e) => setAcceptExplanation(e.target.value)}
                />
                <small className="form-text text-muted">
                  Your explanation helps improve future suggestions for this story.
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAcceptCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleAcceptConfirm}
              >
                Accept Suggestion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Accepted Modal */}
      {showRejectAcceptedModal && rejectingReasoning && (
        <div className="modal-overlay">
          <div className="modal-content rejection-modal">
            <div className="modal-header">
              <h5 className="modal-title">Reject Accepted Tag</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleRejectAcceptedCancel}
              ></button>
            </div>
            <div className="modal-body">
              <div className="rejection-preview">
                <h6>Rejecting: {rejectingReasoning.tag.title}</h6>
                <p className="text-muted">{rejectingReasoning.reasoning}</p>
              </div>
              <div className="form-group">
                <label htmlFor="rejectAcceptedReason">Why are you rejecting this tag?</label>
                <textarea
                  id="rejectAcceptedReason"
                  className="form-control"
                  rows={3}
                  placeholder="Please provide a reason for rejecting this tag. This helps the AI learn and provide better suggestions in the future..."
                  value={rejectAcceptedReason}
                  onChange={(e) => setRejectAcceptedReason(e.target.value)}
                />
                <small className="form-text text-muted">
                  Your feedback helps improve future suggestions for this story.
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRejectAcceptedCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleRejectAcceptedConfirm}
                disabled={!rejectAcceptedReason.trim()}
              >
                Reject Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestion History Modal */}
      {showSuggestionHistory && selectedSuggestionForHistory && (
        <div className="modal-overlay">
          <div className="modal-content suggestion-history-modal">
            <div className="modal-header">
              <h5 className="modal-title">Suggestion History: {selectedSuggestionForHistory.tag.title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeSuggestionHistory}
              ></button>
            </div>
            <div className="modal-body">
              <div className="current-suggestion">
                <h6>Current Suggestion</h6>
                <div className="suggestion-preview">
                  <p className="reasoning">{selectedSuggestionForHistory.reasoning}</p>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${selectedSuggestionForHistory.confidence * 100}%` }}
                    ></div>
                    <span className="confidence-text">{Math.round(selectedSuggestionForHistory.confidence * 100)}%</span>
                  </div>
                  <div className="suggestion-meta">
                    <span className="created-date">
                      Created: {new Date(selectedSuggestionForHistory.createdAt).toLocaleString()}
                    </span>
                    {selectedSuggestionForHistory.updatedAt !== selectedSuggestionForHistory.createdAt && (
                      <span className="updated-date">
                        Updated: {new Date(selectedSuggestionForHistory.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="suggestion-history">
                <h6>Suggestion History</h6>
                {loadingHistory ? (
                  <div className="loading-history">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading history...</p>
                  </div>
                ) : suggestionHistory.length > 1 ? (
                  <div className="history-list">
                    {suggestionHistory.map((version, index) => (
                      <div key={version.id} className={`history-item ${index === suggestionHistory.length - 1 ? 'current' : ''}`}>
                        <div className="history-header">
                          <span className="version-number">Version {version.version}</span>
                          <span className="version-date">{new Date(version.createdAt).toLocaleString()}</span>
                          {index === suggestionHistory.length - 1 && (
                            <span className="current-badge">Current</span>
                          )}
                        </div>
                        <div className="history-content">
                          <p className="reasoning">{version.reasoning}</p>
                          <div className="confidence-bar">
                            <div 
                              className="confidence-fill" 
                              style={{ width: `${version.confidence * 100}%` }}
                            ></div>
                            <span className="confidence-text">{Math.round(version.confidence * 100)}%</span>
                          </div>
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
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeSuggestionHistory}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligentTagSelector; 