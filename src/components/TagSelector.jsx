import React, { useState, useEffect } from 'react';
import { tagApi } from '../services/tagApi';
import { BACKEND_CONFIG } from '../config/backend';
import TagRecommendationSlot from './TagRecommendationSlot';
import TagRecommendation from './TagRecommendation';
import SelectedTagSlot from './SelectedTagSlot';
import './TagSelector.scss';
// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const TagSelector = ({ 
  selectedTags = [], 
  onTagsChange, 
  disabled = false,
  title = 'Select your favorite genres:',
  size = 3, // 1-5 for different card sizes
  showAIRecommendations = true,
  storyBrainstorm = null,
  showAllTags = false,
  onShowAllTagsChange = null
}) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [useSmartRecommendations, setUseSmartRecommendations] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await tagApi.getTags({ perPage: 100 });
      setAvailableTags(response.data.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag) => {
    if (disabled) return;
    const isSelected = selectedTags.some(selectedTag => selectedTag.id === tag.id);
    if (isSelected) {
      const newTags = selectedTags.filter(selectedTag => selectedTag.id !== tag.id);
      onTagsChange(newTags);
    } else {
      const newTags = [...selectedTags, tag];
      onTagsChange(newTags);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    if (disabled) return;
    
    // Show confirmation dialog
    const confirmed = await showRemoveConfirmation(tagToRemove.title);
    if (!confirmed) return;
    
    const newTags = selectedTags.filter(tag => tag.id !== tagToRemove.id);
    onTagsChange(newTags);
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

  const handleRecommendationSelect = (tag) => {
    handleTagToggle(tag);
  };

  const handleRecommendationRemove = (tag) => {
    handleRemoveTag(tag);
  };

  const filteredTags = availableTags.filter(tag => 
    tag.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isTagSelected = (tag) => {
    return selectedTags.some(selectedTag => selectedTag.id === tag.id);
  };

  // Determine if carousel should be shown
  const shouldShowCarousel = showAllTags || searchTerm.trim().length > 0;

  return (
    <div className="netflix-tag-selector">
      {/* Title */}
      <h2 className="selector-title">{title}</h2>
      
      {/* Browse All Tags Toggle */}
      {!disabled && (
        <div className="browse-toggle-container">
          <div className="form-check">
            <input
              type="checkbox"
              id="showAllTags"
              className="form-check-input"
              checked={showAllTags}
              onChange={(e) => onShowAllTagsChange && onShowAllTagsChange(e.target.checked)}
            />
            <label htmlFor="showAllTags" className="form-check-label">
              Browse All Tags
            </label>
          </div>
          <small className="form-text text-muted">
            Show all available tags in a carousel for manual selection.
          </small>
        </div>
      )}

      {/* Search Bar */}
      {!disabled && (
        <div className="search-container">
          <input
            type="text"
            placeholder="Search genres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      )}
      
      {/* Selected Tags Summary */}
      {selectedTags.length > 0 && (
        <div className="selected-summary">
          <span className="selected-count">
            {selectedTags.length} {selectedTags.length === 1 ? 'genre' : 'genres'} selected
          </span>
        </div>
      )}
      
      {/* Netflix-style Carousel with Swiper - Only show when toggled or search is active */}
      {shouldShowCarousel && (
        <div className="carousel-wrapper">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading genres...</p>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="no-results">
              <p>{searchTerm ? 'No genres found matching your search.' : 'No genres available.'}</p>
            </div>
          ) : (
            <Swiper
              modules={[Navigation]}
              navigation
              spaceBetween={16}
              slidesPerView={4}
              breakpoints={{
                1200: { slidesPerView: 4 },
                900: { slidesPerView: 3 },
                600: { slidesPerView: 2.5 },
                0: { slidesPerView: 1 }
              }}
              className="carousel"
            >
              {filteredTags.map(tag => (
                <SwiperSlide key={tag.id}>
                  <div
                    className={`tag-card size-${size} ${isTagSelected(tag) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    <div className="card-image">
                      {tag.thumb_url ? (
                        <img 
                          src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
                          alt={tag.title} 
                          className="tag-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.classList.add('no-image');
                          }}
                        />
                      ) : (
                        <div className="no-image-placeholder">
                          <span>{tag.title.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      {isTagSelected(tag) && (
                        <div className="selected-overlay">
                          <span className="checkmark">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{tag.title}</h3>
                      {tag.short_description && (
                        <p className="card-description">{tag.short_description}</p>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      )}

      {/* AI Recommendations - Show even without selected tags when enabled */}
      {showAIRecommendations && (
        <div className="ai-recommendations-section">
          <div className="recommendations-header">
            <h3>AI Recommendations</h3>
            <div className="recommendation-controls">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="useSmartRecommendations"
                  className="form-check-input"
                  checked={useSmartRecommendations}
                  onChange={(e) => setUseSmartRecommendations(e.target.checked)}
                />
                <label htmlFor="useSmartRecommendations" className="form-check-label">
                  Smart Suggestions
                </label>
              </div>
            </div>
            <p>
              {useSmartRecommendations 
                ? 'Get intelligent suggestions for adding or removing tags based on your actions'
                : selectedTags.length > 0 
                  ? 'Discover genres that complement your selection'
                  : 'Get personalized genre suggestions based on your brainstorm content'
              }
            </p>
          </div>
          
          {useSmartRecommendations ? (
            <TagRecommendation
              selectedTags={selectedTags}
              onTagSelect={handleRecommendationSelect}
              onTagRemove={handleRecommendationRemove}
              disabled={disabled}
              storyBrainstorm={storyBrainstorm}
              title="Smart Tag Suggestions"
            />
          ) : (
            <div className="row">
              {[...Array(4)].map((_, idx) => (
                <div className="col-12 col-md-6 col-lg-3" key={idx}>
                  <TagRecommendationSlot
                    slotId={idx}
                    baseTags={selectedTags}
                    onTagSelect={handleRecommendationSelect}
                    disabled={disabled}
                    selectedTags={selectedTags}
                    storyBrainstorm={storyBrainstorm}
                    onSlotEmpty={() => {}}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Tags with Individual Recommendations */}
      {selectedTags.length > 0 && (
        <div className="selected-tags-section">
          <div className="section-header">
            <h3>Your Selected Genres</h3>
            <p>Click on any genre to see personalized recommendations</p>
          </div>
          <div className="selected-tags-list">
            {selectedTags.map(tag => (
              <SelectedTagSlot
                key={tag.id}
                tag={tag}
                onRemove={handleRemoveTag}
                onTagSelect={handleRecommendationSelect}
                disabled={disabled}
                storyBrainstorm={storyBrainstorm}
                selectedTags={selectedTags}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector; 