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

  const handleMouseEnter = (e) => {
    if (showOnHover) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Clear any existing timeout
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
      
      // Show popup after a small delay
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, 300);
      
      setShowTimeout(timeout);
    }
  };

  const handleMouseLeave = () => {
    if (showOnHover) {
      // Clear timeout if mouse leaves before popup shows
      if (showTimeout) {
        clearTimeout(showTimeout);
        setShowTimeout(null);
      }
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (!showOnHover) {
      setIsVisible(!isVisible);
    }
  };

  const getPopupPosition = () => {
    const offset = 10;
    const popupWidth = 300; // Approximate popup width
    const popupHeight = 400; // Approximate popup height
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let top, left;

    switch (position) {
      case 'top':
        top = mousePosition.y - offset;
        left = mousePosition.x - (popupWidth / 2);
        break;
      case 'bottom':
        top = mousePosition.y + offset;
        left = mousePosition.x - (popupWidth / 2);
        break;
      case 'left':
        top = mousePosition.y - (popupHeight / 2);
        left = mousePosition.x - offset;
        break;
      case 'right':
        top = mousePosition.y - (popupHeight / 2);
        left = mousePosition.x + offset;
        break;
      default:
        top = mousePosition.y - offset;
        left = mousePosition.x - (popupWidth / 2);
    }

    // Ensure popup stays within viewport
    if (left < 10) left = 10;
    if (left + popupWidth > windowWidth - 10) left = windowWidth - popupWidth - 10;
    if (top < 10) top = 10;
    if (top + popupHeight > windowHeight - 10) top = windowHeight - popupHeight - 10;

    return { top, left };
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, [showTimeout]);

  if (!tag || !tag.thumb_url) {
    return children;
  }

  return (
    <div 
      className={`tag-image-popup-container ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      
      {isVisible && (
        <div 
          className="tag-image-popup"
          style={getPopupPosition()}
        >
          <div className="popup-content">
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