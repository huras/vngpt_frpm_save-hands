import React, { useState, useEffect, useCallback } from 'react';
import { BACKEND_CONFIG } from '../config/backend';
import { intelligentTagApi } from '../services/intelligentTagApi';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualTag, setManualTag] = useState({ tagId: '', reasoning: '', userExplanation: '' });

  // Fetch initial data
  useEffect(() => {
    if (storyId) {
      fetchSuggestions();
      fetchReasonings();
    }
  }, [storyId]);

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
        onTagsChange && onTagsChange(selectedTags);
      }
    } catch (error) {
      console.error('Error accepting suggestion:', error);
    }
  };

  const rejectSuggestion = async (suggestionId, reason = null) => {
    try {
      const response = await intelligentTagApi.rejectSuggestion(suggestionId, reason);
      
      if (response.data.success) {
        await fetchSuggestions();
      }
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
    }
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
    if (!manualTag.tagId || !manualTag.reasoning) {
      alert('Please provide both tag and reasoning');
      return;
    }

    try {
      const response = await intelligentTagApi.addTagManually(
        storyId, 
        manualTag.tagId, 
        manualTag.reasoning, 
        manualTag.userExplanation
      );
      
      if (response.data.success) {
        setManualTag({ tagId: '', reasoning: '', userExplanation: '' });
        setShowManualAdd(false);
        await fetchReasonings();
        onTagsChange && onTagsChange(selectedTags);
      }
    } catch (error) {
      console.error('Error adding tag manually:', error);
    }
  };

  const reevaluateSuggestions = async () => {
    try {
      const response = await intelligentTagApi.reevaluateSuggestions(storyId);
      
      if (response.data.success) {
        await fetchSuggestions();
      }
    } catch (error) {
      console.error('Error re-evaluating suggestions:', error);
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
          <button 
            className="btn btn-secondary"
            onClick={reevaluateSuggestions}
            disabled={disabled}
          >
            Re-evaluate
          </button>
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
                    {manualTag.tagId === tag.id && <span className="selected-indicator">✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="reasoning-section">
            <textarea
              placeholder="Explain why this tag fits your story..."
              value={manualTag.reasoning}
              onChange={(e) => setManualTag(prev => ({ ...prev, reasoning: e.target.value }))}
              className="form-control"
              rows={3}
            />
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
            disabled={!manualTag.tagId || !manualTag.reasoning}
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
                    <img 
                      src={BACKEND_CONFIG.getImageUrl(reasoning.tag.thumb_url)} 
                      alt={reasoning.tag.title} 
                      className="tag-thumb"
                    />
                  )}
                  <div className="tag-content">
                    <h5>{reasoning.tag.title}</h5>
                    <p className="reasoning">{reasoning.reasoning}</p>
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
                    <img 
                      src={BACKEND_CONFIG.getImageUrl(suggestion.tag.thumb_url)} 
                      alt={suggestion.tag.title} 
                      className="tag-thumb"
                    />
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
                      onClick={() => acceptSuggestion(suggestion.id)}
                      disabled={disabled}
                    >
                      Accept
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => rejectSuggestion(suggestion.id)}
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
    </div>
  );
};

export default IntelligentTagSelector; 