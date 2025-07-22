import React, { useState } from 'react';
import TagModal from './TagModal';
import { BACKEND_CONFIG } from '../config/backend';
import './SourceDirectiveItem.scss';

const SourceDirectiveItem = ({ directive, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };

    const handleImageClick = (e) => {
        e.stopPropagation();
        setShowModal(true);
    };

    const tag = directive.tagSuggestion?.tag;
    const tagTitle = tag?.title || `Tag ${index + 1}`;
    const tagThumbUrl = tag?.thumb_url;

    return (
        <div className={`source-directive-item ${isExpanded ? 'expanded' : ''}`}>
            <div 
                className="directive-header clickable"
                onClick={handleToggle}
                title={isExpanded ? "Click to collapse" : "Click to expand"}
            >
                <div className="tag-thumbnail">
                    {tagThumbUrl ? (
                        <img 
                            src={BACKEND_CONFIG.getImageUrl(tagThumbUrl)} 
                            alt={tagTitle}
                            className="tag-thumb clickable"
                            onClick={handleImageClick}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div 
                        className="tag-thumb-placeholder clickable" 
                        style={{ display: tagThumbUrl ? 'none' : 'flex' }}
                        onClick={handleImageClick}
                    >
                        <span>{tagTitle.charAt(0).toUpperCase()}</span>
                    </div>
                </div>
                
                <div className="directive-info">
                    <h5 className="tag-title">{tagTitle}</h5>
                    <div className="directive-aim">
                        {directive.directive_aim}
                    </div>
                </div>
                
                <div className="expand-indicator">
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                </div>
            </div>
            
            {isExpanded && (
                <div className="directive-content">
                    <div className="content-section">
                        <strong>Directive:</strong>
                        <p>{directive.directive}</p>
                    </div>
                    
                    <div className="content-section">
                        <strong>Directive Aim:</strong>
                        <p>{directive.directive_aim}</p>
                    </div>
                </div>
            )}
            
            <TagModal 
                tag={tag}
                show={showModal}
                onHide={() => setShowModal(false)}
            />
        </div>
    );
};

export default SourceDirectiveItem; 