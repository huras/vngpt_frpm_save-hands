import React from 'react';
import { BACKEND_CONFIG } from '../config/backend';
import TagImagePopup from './TagImagePopup';
import './TagCard.scss';

const TagCard = ({ 
  tag, 
  children, 
  className = '', 
  showImage = true,
  imagePosition = 'left'
}) => {
  return (
    <div className={`tag-card ${className}`}>
      {showImage && tag.thumb_url && (
        <TagImagePopup tag={tag} position="top">
          <img 
            src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
            alt={tag.title} 
            className="tag-thumb"
          />
        </TagImagePopup>
      )}
      <div className="tag-content">
        <div className="tag-header">
          <h5>{tag.title}</h5>
        </div>
        {children}
      </div>
    </div>
  );
};

export default TagCard; 