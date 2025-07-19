import React, { useState, useEffect } from 'react';
import { intelligentTagApi } from '../services/intelligentTagApi';
import SuggestionCard from './SuggestionCard';

// StreamingTagSuggestions component for managing AI tag suggestions

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

      `}</style>
    </div>
  );
};

export default StreamingTagSuggestions; 