import React, { useState, useEffect } from 'react';
import { tagApi } from '../services/tagApi';
import { BACKEND_CONFIG } from '../config/backend';
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
  size = 3 // 1-5 for different card sizes
}) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleRemoveTag = (tagToRemove) => {
    if (disabled) return;
    const newTags = selectedTags.filter(tag => tag.id !== tagToRemove.id);
    onTagsChange(newTags);
  };

  const filteredTags = availableTags.filter(tag => 
    tag.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isTagSelected = (tag) => {
    return selectedTags.some(selectedTag => selectedTag.id === tag.id);
  };

  return (
    <div className="netflix-tag-selector">
      {/* Title */}
      <h2 className="selector-title">{title}</h2>
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
          <div className="selected-tags-pills">
            {selectedTags.map(tag => (
              <span key={tag.id} className="selected-pill">
                {tag.thumb_url && (
                  <img 
                    src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
                    alt={tag.title} 
                    className="pill-thumb"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <span className="pill-title">{tag.title}</span>
                {!disabled && (
                  <button
                    type="button"
                    className="pill-remove"
                    onClick={() => handleRemoveTag(tag)}
                    title="Remove genre"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Netflix-style Carousel with Swiper */}
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
            slidesPerView={
              size === 1 ? 6 :
              size === 2 ? 4 :
              size === 3 ? 3 :
              size === 4 ? 2.2 :
              1.5
            }
            breakpoints={{
              1200: { slidesPerView: size === 1 ? 8 : size === 2 ? 6 : size === 3 ? 5 : size === 4 ? 3 : 2 },
              900: { slidesPerView: size === 1 ? 6 : size === 2 ? 4 : size === 3 ? 3 : size === 4 ? 2.2 : 1.5 },
              600: { slidesPerView: size === 1 ? 4 : size === 2 ? 3 : size === 3 ? 2 : 1.2 },
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
    </div>
  );
};

export default TagSelector; 