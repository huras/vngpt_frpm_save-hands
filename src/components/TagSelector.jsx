import React, { useState, useEffect } from 'react';
import { tagApi } from '../services/tagApi';
import { BACKEND_CONFIG } from '../config/backend';
import './TagSelector.scss';

const TagSelector = ({ selectedTags = [], onTagsChange, disabled = false }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

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
    const isSelected = selectedTags.some(selectedTag => selectedTag.id === tag.id);
    
    if (isSelected) {
      // Remove tag
      const newTags = selectedTags.filter(selectedTag => selectedTag.id !== tag.id);
      onTagsChange(newTags);
    } else {
      // Add tag
      const newTags = [...selectedTags, tag];
      onTagsChange(newTags);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = selectedTags.filter(tag => tag.id !== tagToRemove.id);
    onTagsChange(newTags);
  };

  const filteredTags = availableTags.filter(tag => 
    tag.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.some(selectedTag => selectedTag.id === tag.id)
  );

  return (
    <div className="tag-selector">
      <label className="tag-selector-label">Tags</label>
      
      {/* Selected Tags Display */}
      <div className="selected-tags">
        {selectedTags.map(tag => (
          <span key={tag.id} className="selected-tag">
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
            <span className="tag-title">{tag.title}</span>
            {!disabled && (
              <button
                type="button"
                className="remove-tag-btn"
                onClick={() => handleRemoveTag(tag)}
                title="Remove tag"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Tag Selection Dropdown */}
      {!disabled && (
        <div className="tag-dropdown-container">
          <div className="tag-search">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="tag-search-input"
            />
            <button
              type="button"
              className="tag-dropdown-toggle"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              ▼
            </button>
          </div>

          {showDropdown && (
            <div className="tag-dropdown">
              {loading ? (
                <div className="tag-loading">Loading tags...</div>
              ) : filteredTags.length === 0 ? (
                <div className="no-tags-found">
                  {searchTerm ? 'No tags found matching your search.' : 'No tags available.'}
                </div>
              ) : (
                <div className="tag-list">
                  {filteredTags.map(tag => (
                    <div
                      key={tag.id}
                      className="tag-option"
                      onClick={() => handleTagToggle(tag)}
                    >
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
                        <span className="tag-title">{tag.title}</span>
                        {tag.short_description && (
                          <span className="tag-description">{tag.short_description}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="dropdown-overlay" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default TagSelector; 