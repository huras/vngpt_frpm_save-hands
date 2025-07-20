import React, { useState } from 'react';
import { BACKEND_CONFIG } from '../config/backend';
import TagModal from './TagModal';
import './RelevantTagCard.scss';

const RelevantTagCard = ({
  tag,
  isCurrentTag = false,
  isSelected = false,
  isExpanded = false,
  isProcessing = false,
  onTagToggle,
  onTagAccept,
  onTagReject,
  onTagReset,
  onTagExpand,
  results = null,
  isGenerating = false,
  streamingData = null
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };
  // Find world-building effects for this tag
  const tagEffects = results?.worldBuildingEffects?.find(effects => effects.tagId === tag.id);

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
      case 'pacing': return 'fas fa-tachometer-alt';
      case 'audience_engagement': return 'fas fa-users';
      case 'cultural_impact': return 'fas fa-globe';
      default: return 'fas fa-star';
    }
  };

  const getTagStatusBadge = (tag) => {
    if (!tag.suggestionId) return null;

    switch (tag.suggestionStatus) {
      case 'accepted':
        return <span className="status-badge accepted">Accepted</span>;
      case 'rejected':
        return <span className="status-badge rejected">Rejected</span>;
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`relevant-tag-card ${isCurrentTag ? 'current-story-tag' : ''}`}>
      <div className="tag-header">
        {tag.thumb_url && (
          <img 
            src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
            alt={tag.title}
            className="tag-thumb"
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="tag-info">
          <h4 className="tag-title">
            {tag.title}
            {isCurrentTag && <span className="current-tag-badge">Current</span>}
            {getTagStatusBadge(tag)}
          </h4>
          <p className="tag-description">{tag.short_description}</p>
          <div className="tag-meta">
            <span className="tag-category">{tag.category}</span>
            {tag.relevanceScore && (
              <span className="relevance-score">Score: {tag.relevanceScore}/10</span>
            )}
          </div>
        </div>
        <div className="tag-actions">
          {/* Show Accept/Reject buttons only for suggested tags (not current story tags) */}
          {!isCurrentTag && tag.suggestionId && (
            <>
              {tag.suggestionStatus === 'accepted' ? (
                <button
                  onClick={() => onTagReset(tag)}
                  className="btn btn-sm btn-warning"
                  disabled={isProcessing}
                >
                  <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-undo'}`}></i>
                  Reset to Pending
                </button>
              ) : (
                <button
                  onClick={() => onTagAccept(tag)}
                  className="btn btn-sm btn-outline-success"
                  disabled={isProcessing || tag.suggestionStatus === 'rejected'}
                >
                  <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-check-circle'}`}></i>
                  Accept
                </button>
              )}
              <button
                onClick={() => onTagReject(tag)}
                className={`btn btn-sm ${tag.suggestionStatus === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                disabled={isProcessing || tag.suggestionStatus === 'rejected'}
              >
                <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-times-circle'}`}></i>
                {tag.suggestionStatus === 'rejected' ? 'Rejected' : 'Reject'}
              </button>
            </>
          )}
          
          <button
            onClick={() => onTagExpand(tag.id)}
            className="btn btn-sm btn-outline-info"
            disabled={isProcessing}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="tag-details">
          {tag.selectionReasoning && (
            <div className="selection-reasoning">
              <strong>Why this tag fits your story:</strong>
              <p>{tag.selectionReasoning}</p>
            </div>
          )}
          
          {/* Related Tags */}
          {results?.relatedTagsMap?.[tag.id] && (
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

          {/* World-Building Effects */}
          {tagEffects && (
            <div className="world-building-effects">
              <h5>World-Building Effects:</h5>
              <div className="effects-list">
                {tagEffects.effects.map((effect, index) => (
                  <div key={index} className="effect-item">
                    <div className="effect-header">
                      <i className={`${getEffectTypeIcon(effect.effectType)} effect-icon`}></i>
                      <h6 className="effect-title">{effect.title}</h6>
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
                    
                    {effect.developmentOpportunities && effect.developmentOpportunities.length > 0 && (
                      <div className="effect-details">
                        <strong>Development Opportunities:</strong>
                        <ul>
                          {effect.developmentOpportunities.map((opportunity, i) => (
                            <li key={i}>{opportunity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {effect.audienceAppeal && (
                      <div className="effect-details">
                        <strong>Audience Appeal:</strong>
                        <p>{effect.audienceAppeal}</p>
                      </div>
                    )}
                    
                    {effect.synergies && effect.synergies.length > 0 && (
                      <div className="effect-details">
                        <strong>Synergistic Tags:</strong>
                        <ul>
                          {effect.synergies.map((synergy, i) => (
                            <li key={i}>{synergy}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show generating indicator for world-building effects if currently processing */}
          {isGenerating && streamingData?.stage === 3 && streamingData?.currentTag?.id === tag.id && (
            <div className="world-building-effects">
              <h5>World-Building Effects:</h5>
              <div className="generating-effects">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Generating world-building effects for "{tag.title}"...</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Tag Modal */}
      <TagModal 
        tag={tag}
        show={showModal}
        onHide={() => setShowModal(false)}
      />
    </div>
  );
};

export default RelevantTagCard; 