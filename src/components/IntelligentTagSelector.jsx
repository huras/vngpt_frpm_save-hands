import React, { useState, useEffect, useCallback } from 'react';
import { BACKEND_CONFIG } from '../config/backend';
import { intelligentTagApi } from '../services/intelligentTagApi';
import TagImagePopup from './TagImagePopup';
import ReasoningDialogTree from './ReasoningDialogTree';
import StarRating from './StarRating';
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

  const handleAcceptClick = (suggestion) => {
    // Show rating modal first, then accept after rating
    setRatingSuggestion(suggestion);
    setRatingValue(0);
    setRatingComment('');
    setRatingSuggestionId(suggestion.id);
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
      // First, rate the suggestion
      const ratingResponse = await intelligentTagApi.rateSuggestion(
        ratingSuggestionId,
        ratingValue,
        ratingComment
      );
      
      if (ratingResponse.data.success) {
        // Then accept the suggestion
        const acceptResponse = await intelligentTagApi.acceptSuggestion(ratingSuggestionId);
        
        if (acceptResponse.data.success) {
          // Refresh data
          await fetchSuggestions();
          await fetchReasonings();
          await checkReevaluationStatus();
          onTagsChange && onTagsChange(selectedTags);
          
          // Close rating modal
          setRatingSuggestion(null);
          setRatingValue(0);
          setRatingComment('');
          setRatingSuggestionId(null);
        } else {
          throw new Error('Failed to accept suggestion after rating');
        }
      } else {
        throw new Error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error in rating and accepting suggestion:', error);
      alert('Failed to process suggestion. Please try again.');
    }
  };

  const cancelRating = () => {
    setRatingSuggestion(null);
    setRatingValue(0);
    setRatingComment('');
    setRatingSuggestionId(null);
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
                <div className="tag-card">
                  {reasoning.tag.thumb_url && (
                    <TagImagePopup tag={reasoning.tag} position="top">
                      <img 
                        src={BACKEND_CONFIG.getImageUrl(reasoning.tag.thumb_url)} 
                        alt={reasoning.tag.title} 
                        className="tag-thumb"
                      />
                    </TagImagePopup>
                  )}
                  <div className="tag-content">
                    <div className="tag-header">
                      <h5>{reasoning.tag.title}</h5>
                      <div className="tag-actions">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm ai-regenerate-btn"
                          onClick={() => regenerateDirective(reasoning.id, reasoning.tagId)}
                          disabled={regeneratingExplanationFor === reasoning.id || disabled}
                          title="Use AI to regenerate the directive for this tag"
                        >
                          {regeneratingExplanationFor === reasoning.id ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-magic"></i>
                              <span>AI Regenerate</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm edit-reasoning-btn"
                          onClick={() => setEditingReasoning(editingReasoning === reasoning.id ? null : reasoning.id)}
                          disabled={disabled}
                          title="Edit the explanation for this tag"
                        >
                          <i className="fas fa-edit"></i>
                          <span>{editingReasoning === reasoning.id ? 'Cancel' : 'Edit'}</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-info btn-sm reasoning-history-btn"
                          onClick={() => openReasoningDialog(reasoning)}
                          disabled={disabled}
                          title="View reasoning history and manage versions"
                        >
                          <i className="fas fa-history"></i>
                          <span>History</span>
                        </button>
                      </div>
                    </div>
                    
                    {editingReasoning === reasoning.id ? (
                      <div className="editing-reasoning">
                        <textarea
                          className="form-control"
                          value={reasoning.reasoning}
                          onChange={(e) => {
                            setReasonings(prev => prev.map(r => 
                              r.id === reasoning.id 
                                ? { ...r, reasoning: e.target.value }
                                : r
                            ));
                          }}
                          rows={3}
                          placeholder="Edit the explanation..."
                        />
                        <div className="edit-actions">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => updateExistingReasoning(reasoning.id, reasoning.reasoning)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setEditingReasoning(null);
                              // Reset to original reasoning
                              fetchReasonings();
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="reasoning">{reasoning.reasoning}</p>
                    )}
                    
                    {reasoning.userExplanation && (
                      <p className="user-explanation">Your note: {reasoning.userExplanation}</p>
                    )}
                    <span className="source-badge">{reasoning.source}</span>
                  </div>
                </div>
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
                <div className="suggestion-card">
                  {suggestion.tag.thumb_url && (
                    <TagImagePopup tag={suggestion.tag} position="top">
                      <img 
                        src={BACKEND_CONFIG.getImageUrl(suggestion.tag.thumb_url)} 
                        alt={suggestion.tag.title} 
                        className="tag-thumb"
                      />
                    </TagImagePopup>
                  )}
                  <div className="suggestion-content">
                    <h5>{suggestion.tag.title}</h5>
                    <p className="reasoning">{suggestion.reasoning}</p>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill" 
                        style={{ width: `${suggestion.confidence * 100}%` }}
                      ></div>
                      <span className="confidence-text">{Math.round(suggestion.confidence * 100)}%</span>
                    </div>
                  </div>
                  <div className="suggestion-actions">
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleAcceptClick(suggestion)}
                      disabled={disabled}
                      title="Rate and accept this suggestion"
                    >
                      <i className="fas fa-star"></i>
                      <span>Rate & Accept</span>
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRejectClick(suggestion)}
                      disabled={disabled}
                    >
                      Reject
                    </button>
                  </div>
                </div>
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
              <h5 className="modal-title">Rate & Accept Suggestion</h5>
              <button
                type="button"
                className="btn-close"
                onClick={cancelRating}
              ></button>
            </div>
            <div className="modal-body">
              <div className="rating-preview">
                <h6>Accepting: {ratingSuggestion.tag.title}</h6>
                <p className="text-muted">{ratingSuggestion.reasoning}</p>
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
                  placeholder="Share your thoughts about this suggestion..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
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
                onClick={cancelRating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={submitRating}
                disabled={ratingValue === 0}
              >
                Rate & Accept
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
    </div>
  );
};

export default IntelligentTagSelector; 