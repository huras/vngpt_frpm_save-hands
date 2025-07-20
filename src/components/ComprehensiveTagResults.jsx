import React, { useState, useEffect } from 'react';
import { BACKEND_CONFIG } from '../config/backend';
import './ComprehensiveTagResults.scss';

const ComprehensiveTagResults = ({ 
  results, 
  onAcceptTag, 
  onRejectTag, 
  onSaveResults,
  storyId = null,
  isGenerating = false,
  streamingData = null
}) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [expandedTags, setExpandedTags] = useState(new Set());
  const [expandedEffects, setExpandedEffects] = useState(new Set());
  const [saving, setSaving] = useState(false);

  // Show component if we have results OR if we're generating
  if (!results && !isGenerating) {
    return null;
  }

  const handleTagToggle = (tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
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

  const handleEffectsExpand = (tagId) => {
    const newExpanded = new Set(expandedEffects);
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId);
    } else {
      newExpanded.add(tagId);
    }
    setExpandedEffects(newExpanded);
  };

  const handleSaveResults = async () => {
    if (!storyId || !onSaveResults) return;
    
    setSaving(true);
    try {
      await onSaveResults(storyId, results);
    } catch (error) {
      console.error('Error saving results:', error);
    } finally {
      setSaving(false);
    }
  };

  const getImpactLevelColor = (level) => {
    switch (level) {
      case 'minor': return '#28a745';
      case 'moderate': return '#ffc107';
      case 'major': return '#fd7e14';
      case 'transformative': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getEffectTypeIcon = (type) => {
    switch (type) {
      case 'setting': return 'fas fa-map-marker-alt';
      case 'character': return 'fas fa-user';
      case 'plot': return 'fas fa-route';
      case 'atmosphere': return 'fas fa-cloud';
      case 'theme': return 'fas fa-lightbulb';
      case 'conflict': return 'fas fa-exclamation-triangle';
      case 'resolution': return 'fas fa-check-circle';
      default: return 'fas fa-star';
    }
  };

  // If we're generating but have no data yet, show the beautiful centered loading state
  if (isGenerating && !results) {
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
            <p>This may take a few moments as we analyze your story and generate detailed tag suggestions.</p>
          )}
        </div>
      </div>
    );
  }

  // If we have data (either complete or partial), show the results with non-blocking indicators
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

      {/* Results header */}
      {results && (
        <div className="results-header">
          <h2>Comprehensive Tag Analysis</h2>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-number">{results?.relevantTags?.length || 0}</span>
              <span className="stat-label">Relevant Tags</span>
            </div>
            <div className="stat">
              <span className="stat-number">{results?.relatedTagsMap ? Object.values(results.relatedTagsMap).flat().length : 0}</span>
              <span className="stat-label">Related Tags</span>
            </div>
            <div className="stat">
              <span className="stat-number">{results?.worldBuildingEffects?.length || 0}</span>
              <span className="stat-label">World-Building Effects</span>
            </div>
          </div>
          {storyId && onSaveResults && results?.summary && !isGenerating && (
            <button 
              onClick={handleSaveResults}
              disabled={saving}
              className="btn btn-primary save-results-btn"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Save Results
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Relevant Tags Section - Show if we have relevant tags OR if we're generating */}
      {(results?.relevantTags?.length > 0 || (isGenerating && streamingData?.stage >= 1)) && (
        <div className="results-section">
          <h3>Relevant Tags for Your Story</h3>
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
                <div key={tag.id} className="relevant-tag-card">
                  <div className="tag-header">
                    {tag.thumb_url && (
                      <img 
                        src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
                        alt={tag.title}
                        className="tag-thumb"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="tag-info">
                      <h4 className="tag-title">{tag.title}</h4>
                      <p className="tag-description">{tag.short_description}</p>
                      <div className="tag-meta">
                        <span className="tag-category">{tag.category}</span>
                        <span className="relevance-score">Score: {tag.relevanceScore}/10</span>
                      </div>
                    </div>
                    <div className="tag-actions">
                      <button
                        onClick={() => handleTagToggle(tag)}
                        className={`btn btn-sm ${selectedTags.some(t => t.id === tag.id) ? 'btn-success' : 'btn-outline-success'}`}
                      >
                        <i className={`fas ${selectedTags.some(t => t.id === tag.id) ? 'fa-check' : 'fa-plus'}`}></i>
                        {selectedTags.some(t => t.id === tag.id) ? 'Selected' : 'Select'}
                      </button>
                      <button
                        onClick={() => handleTagExpand(tag.id)}
                        className="btn btn-sm btn-outline-info"
                      >
                        <i className={`fas fa-chevron-${expandedTags.has(tag.id) ? 'up' : 'down'}`}></i>
                      </button>
                    </div>
                  </div>
                  
                  {expandedTags.has(tag.id) && (
                    <div className="tag-details">
                      <div className="selection-reasoning">
                        <strong>Why this tag fits your story:</strong>
                        <p>{tag.selectionReasoning}</p>
                      </div>
                      
                      {/* Related Tags */}
                      {results.relatedTagsMap?.[tag.id] && (
                        <div className="related-tags">
                          <h5>Related Tags:</h5>
                          <div className="related-tags-list">
                            {results.relatedTagsMap[tag.id].map((relatedTag) => (
                              <div key={relatedTag.id} className="related-tag-item">
                                <span className="related-tag-title">{relatedTag.title}</span>
                                <span className={`relationship-type ${relatedTag.relationshipType}`}>
                                  {relatedTag.relationshipType}
                                </span>
                                <span className="relationship-reasoning">{relatedTag.relationshipReasoning}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Show generating indicator for related tags if this tag is currently being processed */}
                      {isGenerating && streamingData?.currentTag?.id === tag.id && streamingData?.stage === 2 && (
                        <div className="related-tags">
                          <h5>Related Tags:</h5>
                          <div className="generating-related-tags">
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Finding related tags for "{tag.title}"...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* World-Building Effects Section - Show if we have effects OR if we're generating */}
      {(results?.worldBuildingEffects?.length > 0 || (isGenerating && streamingData?.stage >= 3)) && (
        <div className="results-section">
          <h3>World-Building Effects</h3>
          <p className="section-description">
            Discover how each tag affects your story's world-building, characters, and narrative flow.
            {isGenerating && !results?.worldBuildingEffects?.length && (
              <span className="generating-indicator">
                <i className="fas fa-spinner fa-spin"></i> Analyzing world-building effects...
              </span>
            )}
          </p>
          
          {results?.worldBuildingEffects?.length > 0 && (
            <div className="world-building-effects">
              {results.worldBuildingEffects.map((tagEffects) => (
                <div key={tagEffects.tagId} className="tag-effects-card">
                  <div className="effects-header">
                    <h4>{tagEffects.tagTitle}</h4>
                    <button
                      onClick={() => handleEffectsExpand(tagEffects.tagId)}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i className={`fas fa-chevron-${expandedEffects.has(tagEffects.tagId) ? 'up' : 'down'}`}></i>
                      {expandedEffects.has(tagEffects.tagId) ? 'Hide Effects' : 'Show Effects'}
                    </button>
                  </div>
                  
                  {expandedEffects.has(tagEffects.tagId) && (
                    <div className="effects-list">
                      {tagEffects.effects.map((effect, index) => (
                        <div key={index} className="effect-item">
                          <div className="effect-header">
                            <i className={`${getEffectTypeIcon(effect.effectType)} effect-icon`}></i>
                            <h5 className="effect-title">{effect.title}</h5>
                            <span 
                              className="impact-level"
                              style={{ backgroundColor: getImpactLevelColor(effect.impactLevel) }}
                            >
                              {effect.impactLevel}
                            </span>
                          </div>
                          
                          <p className="effect-description">{effect.description}</p>
                          
                          {effect.storyElements && effect.storyElements.length > 0 && (
                            <div className="effect-details">
                              <strong>Affects:</strong>
                              <ul>
                                {effect.storyElements.map((element, i) => (
                                  <li key={i}>{element}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {effect.examples && effect.examples.length > 0 && (
                            <div className="effect-details">
                              <strong>Examples:</strong>
                              <ul>
                                {effect.examples.map((example, i) => (
                                  <li key={i}>{example}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {effect.conflicts && effect.conflicts.length > 0 && (
                            <div className="effect-details">
                              <strong>Potential Conflicts:</strong>
                              <ul>
                                {effect.conflicts.map((conflict, i) => (
                                  <li key={i}>{conflict}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Show generating indicator for world-building effects if currently processing */}
          {isGenerating && streamingData?.stage === 3 && streamingData?.currentTag && (
            <div className="world-building-effects">
              <div className="tag-effects-card generating">
                <div className="effects-header">
                  <h4>{streamingData.currentTag.title}</h4>
                  <span className="generating-badge">
                    <i className="fas fa-spinner fa-spin"></i> Analyzing...
                  </span>
                </div>
                <div className="effects-list">
                  <div className="generating-effects">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Generating world-building effects for "{streamingData.currentTag.title}"...</span>
                  </div>
                </div>
              </div>
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