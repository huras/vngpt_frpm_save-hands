import React, { useState } from 'react';
import './RelatedTagsTab.scss';

const RelatedTagsTab = ({ 
  tag, 
  results = null, 
  storyId = null, 
  onRelatedTagsGenerated = null 
}) => {
  const [isGeneratingRelatedTags, setIsGeneratingRelatedTags] = useState(false);
  const [relatedTags, setRelatedTags] = useState(null);
  const [relatedTagsError, setRelatedTagsError] = useState(null);

  const handleGenerateRelatedTags = async () => {
    if (!tag.id || isGeneratingRelatedTags) return;

    try {
      setIsGeneratingRelatedTags(true);
      setRelatedTagsError(null);
      
      const { comprehensiveTagApi } = require('../services/comprehensiveTagApi');
      const response = await comprehensiveTagApi.generateRelatedTagsForTag(tag.id, storyId, 3);
      
      if (response.data?.success) {
        setRelatedTags(response.data.data.relatedTags);
        if (onRelatedTagsGenerated) {
          onRelatedTagsGenerated(tag.id, response.data.data.relatedTags);
        }
      } else {
        setRelatedTagsError('Failed to generate related tags');
      }
    } catch (error) {
      console.error('Error generating related tags:', error);
      setRelatedTagsError('Error generating related tags. Please try again.');
    } finally {
      setIsGeneratingRelatedTags(false);
    }
  };

  const currentRelatedTags = relatedTags || results?.relatedTagsMap?.[tag.id];

  return (
    <div className="related-tags mt-3">
      {currentRelatedTags && currentRelatedTags.length > 0 && (
        <div className="related-tags-list">
          {currentRelatedTags.map((relatedTag) => (
            <div key={relatedTag.id} className="related-tag-item">
              <span className="related-tag-title">{relatedTag.title}</span>
              <span className={`relationship-type ${relatedTag.relationshipType}`}>
                {relatedTag.relationshipType}
              </span>
              <span className="relationship-reasoning">{relatedTag.relationshipReasoning}</span>
            </div>
          ))}
        </div>
      )}
      
      {relatedTagsError && (
        <div className="related-tags-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{relatedTagsError}</span>
        </div>
      )}
      
      {isGeneratingRelatedTags && (
        <div className="generating-related-tags">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Finding related tags for "{tag.title}"...</span>
        </div>
      )}
      
      {!currentRelatedTags && !isGeneratingRelatedTags && !relatedTagsError && (
        <div className="suggest-related-tags">
          <button
            onClick={handleGenerateRelatedTags}
            className="btn btn-sm btn-outline-primary"
            disabled={isGeneratingRelatedTags}
          >
            <i className="fas fa-lightbulb"></i>
            Suggest Related Tags
          </button>
          <p className="suggest-hint">Click to get AI-suggested tags that work well with this one</p>
        </div>
      )}
      
      {currentRelatedTags && currentRelatedTags.length === 0 && !isGeneratingRelatedTags && (
        <div className="no-related-tags">
          <i className="fas fa-info-circle"></i>
          <span>No related tags suggested by the AI</span>
        </div>
      )}
    </div>
  );
};

export default RelatedTagsTab; 