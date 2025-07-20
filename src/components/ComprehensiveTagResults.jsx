import React, { useState } from 'react';
import RelevantTagCard from './RelevantTagCard';
import './ComprehensiveTagResults.scss';

const ComprehensiveTagResults = ({
  results = null,
  isGenerating = false,
  streamingData = null,
  storyId = null,
  currentStoryTags = [],
  selectedTags = [],
  onTagSelection = () => {},
  isLoading = false
}) => {
  const [expandedTags, setExpandedTags] = useState(new Set());
  const [processingTags, setProcessingTags] = useState(new Set());

  // Show component if we have results OR if we're generating OR if we have current story tags OR if we're loading
  if (!results && !isGenerating && currentStoryTags.length === 0 && !isLoading) {
    return null;
  }

  // If we're generating but have no data yet, show the beautiful centered loading state
  if (isGenerating && !results && currentStoryTags.length === 0) {
    return (
      <div className="comprehensive-tag-results generating">
        <div className="generating-indicator">
          <i className="fas fa-magic fa-spin"></i>
          <h3>Generating Comprehensive Tags...</h3>
          
          {streamingData ? (
            <div className="streaming-progress">
              <div className="stage-info">
                <h4>{streamingData.stageName}</h4>
                <p>{streamingData.message}</p>
              </div>
              
              {streamingData.total > 1 && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(streamingData.progress / streamingData.total) * 100}%` }}
                  ></div>
                  <span className="progress-text">
                    {streamingData.progress} / {streamingData.total}
                  </span>
                </div>
              )}
              
              {streamingData.currentTag && (
                <div className="current-tag">
                  <strong>Processing:</strong> {streamingData.currentTag.title}
                </div>
              )}
            </div>
          ) : (
            <p>This may take a few moments as we analyze your story and generate detailed tag suggestions. Results will be automatically saved.</p>
          )}
        </div>
      </div>
    );
  }

  // Show loading state when fetching existing comprehensive results
  if (isLoading && !results && currentStoryTags.length === 0) {
    return (
      <div className="comprehensive-tag-results loading">
        <div className="loading-indicator">
          <i className="fas fa-spinner fa-spin"></i>
          <h3>Loading Story Tag Analysis...</h3>
          <p>Retrieving existing comprehensive tag data for your story.</p>
        </div>
      </div>
    );
  }

  const isTagSelected = (tag) => {
    return selectedTags.some(t => t.id === tag.id);
  };

  const isTagProcessing = (tag) => {
    return processingTags.has(tag.id);
  };

  const handleTagToggle = (tag) => {
    onTagSelection(tag);
  };

  const handleTagAccept = async (tag) => {
    if (!tag.suggestionId) return;

    try {
      setProcessingTags(prev => new Set([...prev, tag.id]));
      
      await comprehensiveTagApi.acceptTagSuggestion(tag.suggestionId);
      
      // Update the tag status in the results
      if (results?.relevantTags) {
        const updatedTag = results.relevantTags.find(t => t.id === tag.id);
        if (updatedTag) {
          updatedTag.suggestionStatus = 'accepted';
        }
      }
    } catch (error) {
      console.error('Error accepting tag suggestion:', error);
    } finally {
      setProcessingTags(prev => {
        const newSet = new Set(prev);
        newSet.delete(tag.id);
        return newSet;
      });
    }
  };

  const handleTagReject = async (tag) => {
    if (!tag.suggestionId) return;

    try {
      setProcessingTags(prev => new Set([...prev, tag.id]));
      
      await comprehensiveTagApi.rejectTagSuggestion(tag.suggestionId);
      
      // Update the tag status in the results
      if (results?.relevantTags) {
        const updatedTag = results.relevantTags.find(t => t.id === tag.id);
        if (updatedTag) {
          updatedTag.suggestionStatus = 'rejected';
        }
      }
    } catch (error) {
      console.error('Error rejecting tag suggestion:', error);
    } finally {
      setProcessingTags(prev => {
        const newSet = new Set(prev);
        newSet.delete(tag.id);
        return newSet;
      });
    }
  };

  const handleTagExpand = (tagId) => {
    const newExpanded = new Set(expandedTags);
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId);
    } else {
      newExpanded.add(tagId);
    }
    setExpandedTags(newExpanded);
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!results?.relevantTags) return null;

    const total = results.relevantTags.length;
    const accepted = results.relevantTags.filter(tag => tag.suggestionStatus === 'accepted').length;
    const rejected = results.relevantTags.filter(tag => tag.suggestionStatus === 'rejected').length;
    const pending = results.relevantTags.filter(tag => tag.suggestionStatus === 'pending').length;

    return { total, accepted, rejected, pending };
  };

  const summaryStats = getSummaryStats();

  if (isLoading) {
    return (
      <div className="comprehensive-tag-results">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading comprehensive tag results...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="comprehensive-tag-results">
      {/* Non-blocking generating indicator at the top */}
      {isGenerating && (
        <div className="non-blocking-indicator">
          <div className="indicator-content">
            <i className="fas fa-magic fa-spin"></i>
            <div className="indicator-text">
              <span className="indicator-title">Generating...</span>
              {streamingData && (
                <span className="indicator-message">{streamingData.message}</span>
              )}
            </div>
            {streamingData && streamingData.total > 1 && (
              <div className="mini-progress">
                <div className="mini-progress-bar">
                  <div 
                    className="mini-progress-fill"
                    style={{ width: `${(streamingData.progress / streamingData.total) * 100}%` }}
                  ></div>
                </div>
                <span className="mini-progress-text">{streamingData.progress}/{streamingData.total}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header with summary stats */}
      {(results || isGenerating) && (
        <div className="results-header">
          <h2>
            {isGenerating && results?.relevantTags?.length > 0 
              ? 'Adding More Tag Suggestions...' 
              : 'Comprehensive Tag Analysis'
            }
          </h2>
          {summaryStats && (
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Suggestions:</span>
                <span className="stat-value">{summaryStats.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Accepted:</span>
                <span className="stat-value accepted">{summaryStats.accepted}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Rejected:</span>
                <span className="stat-value rejected">{summaryStats.rejected}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending:</span>
                <span className="stat-value pending">{summaryStats.pending}</span>
              </div>
              {isGenerating && results?.relevantTags?.length > 0 && (
                <div className="stat-item generating">
                  <span className="stat-label">Adding New:</span>
                  <span className="stat-value">
                    <i className="fas fa-plus"></i>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Current Story Tags Section */}
      {currentStoryTags.length > 0 && (
        <div className="results-section">
          <h3>Current Story Tags</h3>
          <p className="section-description">
            These tags are currently associated with your story.
          </p>
          
          <div className="relevant-tags-grid">
            {currentStoryTags.map((tag) => (
              <RelevantTagCard
                key={tag.id}
                tag={tag}
                isCurrentTag={true}
                isSelected={isTagSelected(tag)}
                isExpanded={expandedTags.has(tag.id)}
                isProcessing={isTagProcessing(tag)}
                onTagToggle={handleTagToggle}
                onTagAccept={handleTagAccept}
                onTagReject={handleTagReject}
                onTagExpand={handleTagExpand}
                results={results}
                isGenerating={isGenerating}
                streamingData={streamingData}
              />
            ))}
          </div>
        </div>
      )}

      {/* Generated Relevant Tags Section - Show if we have relevant tags OR if we're generating */}
      {(results?.relevantTags?.length > 0 || (isGenerating && streamingData?.stage >= 1)) && (
        <div className="results-section">
          <h3>AI-Generated Tag Suggestions</h3>
          <p className="section-description">
            These tags were selected based on your story's content, themes, and narrative elements.
            {isGenerating && !results?.relevantTags?.length && (
              <span className="generating-indicator">
                <i className="fas fa-spinner fa-spin"></i> Analyzing story content...
              </span>
            )}
          </p>
          
          {results?.relevantTags?.length > 0 && (
            <div className="relevant-tags-grid">
              {results.relevantTags.map((tag) => (
                <RelevantTagCard
                  key={tag.id}
                  tag={tag}
                  isCurrentTag={false}
                  isSelected={isTagSelected(tag)}
                  isExpanded={expandedTags.has(tag.id)}
                  isProcessing={isTagProcessing(tag)}
                  onTagToggle={handleTagToggle}
                  onTagAccept={handleTagAccept}
                  onTagReject={handleTagReject}
                  onTagExpand={handleTagExpand}
                  results={results}
                  isGenerating={isGenerating}
                  streamingData={streamingData}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Tags Summary */}
      {selectedTags.length > 0 && (
        <div className="selected-tags-summary">
          <h3>Selected Tags ({selectedTags.length})</h3>
          <div className="selected-tags-list">
            {selectedTags.map((tag) => (
              <div key={tag.id} className="selected-tag">
                <span className="tag-title">{tag.title}</span>
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="btn btn-sm btn-outline-danger"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveTagResults; 