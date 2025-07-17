import React, { useState, useEffect, useCallback } from 'react';
import { tagApi } from '../services/tagApi';
import { BACKEND_CONFIG } from '../config/backend';
import './TagRecommendation.scss';

const TagRecommendation = ({ 
  selectedTags = [], 
  onTagSelect, 
  onTagRemove,
  disabled = false,
  storyBrainstorm = null,
  title = 'AI Tag Suggestions'
}) => {
  const [suggestions, setSuggestions] = useState({
    add: [],
    remove: []
  });
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [error, setError] = useState(null);

  // Get AI suggestions when tags change
  const getAISuggestions = useCallback(async (action, changedTag) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tagApi.getAITagSuggestions({
        selectedTags: selectedTags.map(tag => tag.id),
        action: action, // 'add' or 'remove'
        changedTag: changedTag ? {
          id: changedTag.id,
          title: changedTag.title,
          category: changedTag.category,
          keywords: changedTag.keywords
        } : null,
        storyBrainstorm: storyBrainstorm
      });

      if (response.success) {
        setSuggestions(response.data);
        setLastAction({
          type: action,
          tag: changedTag,
          timestamp: Date.now()
        });
      } else {
        setError('Failed to get AI suggestions');
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      setError('Failed to get AI suggestions');
    } finally {
      setLoading(false);
    }
  }, [selectedTags, storyBrainstorm]);

  // Get initial suggestions when component mounts
  useEffect(() => {
    if (selectedTags.length > 0 || storyBrainstorm) {
      getAISuggestions('initial', null);
    }
  }, []);

  const handleTagSelect = async (tag) => {
    if (disabled) return;
    
    // Call the parent's onTagSelect
    onTagSelect(tag);
    
    // Get AI suggestions for adding this tag
    await getAISuggestions('add', tag);
  };

  const handleTagRemove = async (tag) => {
    if (disabled) return;
    
    // Call the parent's onTagRemove
    onTagRemove(tag);
    
    // Get AI suggestions for removing this tag
    await getAISuggestions('remove', tag);
  };

  const handleSuggestionClick = (suggestion, action) => {
    if (disabled) return;
    
    if (action === 'add') {
      onTagSelect(suggestion);
    } else if (action === 'remove') {
      onTagRemove(suggestion);
    }
  };

  const handleRefreshSuggestions = () => {
    getAISuggestions('refresh', null);
  };

  if (loading && suggestions.add.length === 0 && suggestions.remove.length === 0) {
    return (
      <div className="tag-recommendation loading">
        <div className="loading-spinner"></div>
        <p>Getting AI suggestions...</p>
      </div>
    );
  }

  return (
    <div className="tag-recommendation">
      <div className="recommendation-header">
        <h3>{title}</h3>
        <button 
          className="refresh-btn"
          onClick={handleRefreshSuggestions}
          disabled={disabled || loading}
          title="Refresh AI suggestions"
        >
          <i className={`fas fa-${loading ? 'spinner fa-spin' : 'sync-alt'}`}></i>
        </button>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {lastAction && (
        <div className="last-action">
          <span className="action-indicator">
            <i className={`fas fa-${lastAction.type === 'add' ? 'plus' : 'minus'}`}></i>
            {lastAction.type === 'add' ? 'Added' : 'Removed'}: {lastAction.tag?.title}
          </span>
        </div>
      )}

      {/* Add Suggestions */}
      {suggestions.add.length > 0 && (
        <div className="suggestion-section add-suggestions">
          <h4>
            <i className="fas fa-plus-circle"></i>
            Consider Adding
          </h4>
          <div className="suggestion-list">
            {suggestions.add.map((suggestion, index) => (
              <div 
                key={`add-${suggestion.id || index}`}
                className={`suggestion-item add${suggestion.reason ? ' has-reason' : ''}`}
                onClick={() => handleSuggestionClick(suggestion, 'add')}
              >
                <div className="suggestion-image">
                  {suggestion.thumb_url ? (
                    <img 
                      src={BACKEND_CONFIG.getImageUrl(suggestion.thumb_url)} 
                      alt={suggestion.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('no-image');
                      }}
                    />
                  ) : (
                    <div className="no-image">
                      <span>{suggestion.title.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="suggestion-content">
                  <h5>{suggestion.title}</h5>
                  {suggestion.short_description && (
                    <p className="description">{suggestion.short_description}</p>
                  )}
                  {suggestion.reason && (
                    <p className="reason">
                      <i className="fas fa-lightbulb"></i>
                      {suggestion.reason}
                    </p>
                  )}
                  {suggestion.confidence && (
                    <span className="confidence">
                      {Math.round(suggestion.confidence * 100)}% match
                    </span>
                  )}
                </div>
                <div className="suggestion-action">
                  <i className="fas fa-plus"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remove Suggestions */}
      {suggestions.remove.length > 0 && (
        <div className="suggestion-section remove-suggestions">
          <h4>
            <i className="fas fa-minus-circle"></i>
            Consider Removing
          </h4>
          <div className="suggestion-list">
            {suggestions.remove.map((suggestion, index) => (
              <div 
                key={`remove-${suggestion.id || index}`}
                className={`suggestion-item remove${suggestion.reason ? ' has-reason' : ''}`}
                onClick={() => handleSuggestionClick(suggestion, 'remove')}
              >
                <div className="suggestion-image">
                  {suggestion.thumb_url ? (
                    <img 
                      src={BACKEND_CONFIG.getImageUrl(suggestion.thumb_url)} 
                      alt={suggestion.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('no-image');
                      }}
                    />
                  ) : (
                    <div className="no-image">
                      <span>{suggestion.title.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="suggestion-content">
                  <h5>{suggestion.title}</h5>
                  {suggestion.short_description && (
                    <p className="description">{suggestion.short_description}</p>
                  )}
                  {suggestion.reason && (
                    <p className="reason">
                      <i className="fas fa-exclamation-triangle"></i>
                      {suggestion.reason}
                    </p>
                  )}
                  {suggestion.confidence && (
                    <span className="confidence">
                      {Math.round(suggestion.confidence * 100)}% mismatch
                    </span>
                  )}
                </div>
                <div className="suggestion-action">
                  <i className="fas fa-minus"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Suggestions */}
      {suggestions.add.length === 0 && suggestions.remove.length === 0 && !loading && (
        <div className="no-suggestions">
          <i className="fas fa-check-circle"></i>
          <p>Your tag selection looks good! No suggestions at this time.</p>
        </div>
      )}
    </div>
  );
};

export default TagRecommendation; 