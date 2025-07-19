import React, { useState, useEffect } from 'react';
import { BACKEND_CONFIG } from '../config/backend';
import './TagImagePopup.scss';

const TagImagePopup = ({ 
  tag, 
  children, 
  position = 'top', 
  showOnHover = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showTimeout, setShowTimeout] = useState(null);
  const [elementRef, setElementRef] = useState(null);

  const handleClick = (e) => {
    console.log('TagImagePopup clicked for tag:', tag.title);
    e.stopPropagation(); // Prevent event bubbling
    
    // Get the element's position
    const rect = e.currentTarget.getBoundingClientRect();
    const newPosition = { 
      x: rect.left + rect.width / 2, 
      y: rect.top + rect.height / 2 
    };
    console.log('Element position:', newPosition);
    setMousePosition(newPosition);
    
    // Toggle popup visibility
    const newVisibility = !isVisible;
    console.log('Setting visibility to:', newVisibility);
    setIsVisible(newVisibility);
  };

  const getPopupPosition = () => {
    // Simple positioning - always show above the element
    const top = mousePosition.y - 420; // 400px popup height + 20px offset
    const left = mousePosition.x - 150; // Center the popup
    
    return { 
      top: `${Math.max(10, top)}px`, 
      left: `${Math.max(10, left)}px`,
      position: 'fixed',
      zIndex: 9999
    };
  };

  // Handle clicking outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible && !event.target.closest('.tag-image-popup-container') && !event.target.closest('.tag-image-popup')) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, [isVisible, showTimeout]);

  if (!tag || !tag.thumb_url) {
    return children;
  }

  return (
    <div 
      className={`tag-image-popup-container ${className}`}
      onClick={handleClick}
    >
      {children}
      
      {isVisible && (
        <div 
          className="tag-image-popup"
          style={getPopupPosition()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="popup-content">
            <div className="popup-header">
              <button 
                className="popup-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                title="Close popup"
              >
                ×
              </button>
            </div>
            <div className="popup-image">
              <img 
                src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
                alt={tag.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="popup-info">
              <h4 className="popup-title">{tag.title}</h4>
              {tag.short_description && (
                <p className="popup-description">{tag.short_description}</p>
              )}
              {tag.description && (
                <p className="popup-full-description">{tag.description}</p>
              )}
            </div>
          </div>
          <div className="popup-arrow"></div>
        </div>
      )}
    </div>
  );
};

export default TagImagePopup; 