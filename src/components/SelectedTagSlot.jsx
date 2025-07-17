import React, { useState } from 'react';
import { tagApi } from '../services/tagApi';
import { BACKEND_CONFIG } from '../config/backend';
import TagRecommendationSlot from './TagRecommendationSlot';
import './SelectedTagSlot.scss';

const SelectedTagSlot = ({ 
  tag, 
  onRemove, 
  onTagSelect, 
  disabled = false,
  storyBrainstorm = null,
  selectedTags = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRemove = async () => {
    if (disabled) return;
    
    // Show confirmation dialog
    const confirmed = await showRemoveConfirmation(tag.title);
    if (!confirmed) return;
    
    onRemove(tag);
  };

  const showRemoveConfirmation = (tagTitle) => {
    return new Promise((resolve) => {
      // Check if SweetAlert is available
      if (typeof window !== 'undefined' && window.Swal) {
        window.Swal.fire({
          title: 'Remove Genre?',
          text: `Are you sure you want to remove "${tagTitle}" from your selection?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#e50914',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Yes, remove it!',
          cancelButtonText: 'Cancel',
          reverseButtons: true
        }).then((result) => {
          resolve(result.isConfirmed);
        });
      } else {
        // Fallback to browser confirm if SweetAlert is not available
        const confirmed = window.confirm(`Are you sure you want to remove "${tagTitle}" from your selection?`);
        resolve(confirmed);
      }
    });
  };

  const handleRecommendationSelect = (recommendedTag) => {
    onTagSelect(recommendedTag);
  };

  return (
    <div className={`selected-tag-slot ${isExpanded ? 'expanded' : ''}`}>
      {/* Tag Information Header */}
      <div className="tag-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="tag-info">
          <div className="tag-image">
            {tag.thumb_url ? (
              <img 
                src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
                alt={tag.title} 
                className="tag-thumb"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('no-image');
                }}
              />
            ) : (
              <div className="tag-no-image">
                <span>{tag.title.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="tag-details">
            <h3 className="tag-title">{tag.title}</h3>
            {tag.short_description && (
              <p className="tag-description">{tag.short_description}</p>
            )}
            {tag.category && (
              <span className="tag-category">{tag.category}</span>
            )}
          </div>
        </div>
        <div className="tag-actions">
          <button
            className="expand-btn"
			type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            title={isExpanded ? "Collapse recommendations" : "Show recommendations"}
            aria-label={isExpanded ? "Collapse recommendations" : "Show recommendations"}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
          </button>
          {!disabled && (
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              title="Remove from selection"
              aria-label="Remove from selection"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Recommendations Section */}
      {isExpanded && (
        <div className="recommendations-section">
          <div className="recommendations-header">
            <h4>Recommendations based on "{tag.title}"</h4>
            <p>Discover related genres that complement this selection</p>
          </div>
          <div className="recommendations-grid">
            <div className="recommendation-slot-wrapper">
              <TagRecommendationSlot
                slotId={`${tag.id}_rec_1`}
                baseTags={[tag]} // Focus on this specific tag
                onTagSelect={handleRecommendationSelect}
                disabled={disabled}
                selectedTags={selectedTags}
                storyBrainstorm={storyBrainstorm}
                onSlotEmpty={() => {}}
                focusedMode={true}
                focusTag={tag}
              />
            </div>
            <div className="recommendation-slot-wrapper">
              <TagRecommendationSlot
                slotId={`${tag.id}_rec_2`}
                baseTags={[tag]} // Focus on this specific tag
                onTagSelect={handleRecommendationSelect}
                disabled={disabled}
                selectedTags={selectedTags}
                storyBrainstorm={storyBrainstorm}
                onSlotEmpty={() => {}}
                focusedMode={true}
                focusTag={tag}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedTagSlot; 