import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BACKEND_CONFIG } from '../config/backend';
import './TagModal.scss';

const TagModal = ({ 
  tag, 
  show, 
  onHide 
}) => {
  if (!tag) return null;
  console.log(tag)

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="tag-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="modal-title">
          <i className="fas fa-tag me-2"></i>
          {tag.title}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-body animated-background-tag-image" style={{
        backgroundSize: 'cover', 
        backgroundImage: tag.thumb_url ? `url(${BACKEND_CONFIG.getImageUrl(tag.thumb_url)})` : 'none',
      }}>
        <div className="tag-modal-content">
          {/* Tag Image */}
          {tag.thumb_url && (
            <div className="tag-image-container">
              <img 
                src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
                alt={tag.title}
                style={{visibility: 'hidden', transform: 'scaleX(1)', border: '5px solid #ffffff'}}
                className="tag-modal-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Tag Information */}
          <div className="tag-info-section">
            {/* Short Description */}
            {tag.short_description && (
              <div className="info-block">
                <h5 className="info-title">
                  <i className="fas fa-info-circle me-2"></i>
                  Overview
                </h5>
                <p className="info-content">{tag.short_description}</p>
              </div>
            )}
            
            {/* Broader Description */}
            {tag.broader_description && (
              <div className="info-block">
                <h5 className="info-title">
                  <i className="fas fa-book-open me-2"></i>
                  Broader Description
                </h5>
                <p className="info-content">{tag.broader_description}</p>
              </div>
            )}
            
            {/* Full Description (legacy support) */}
            {tag.description && tag.description !== tag.short_description && !tag.broader_description && (
              <div className="info-block">
                <h5 className="info-title">
                  <i className="fas fa-book-open me-2"></i>
                  Detailed Description
                </h5>
                <p className="info-content">{tag.description}</p>
              </div>
            )}
            
            {/* Category */}
            {/* {tag.category && (
              <div className="info-block">
                <h5 className="info-title">
                  <i className="fas fa-folder me-2"></i>
                  Category
                </h5>
                <span className="category-badge">{tag.category}</span>
              </div>
            )} */}
            
            {/* Relevance Score */}
            {/* {tag.relevanceScore && (
              <div className="info-block">
                <h5 className="info-title">
                  <i className="fas fa-star me-2"></i>
                  Relevance Score
                </h5>
                <div className="relevance-score-display">
                  <span className="score-value">{tag.relevanceScore}/10</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ width: `${(tag.relevanceScore / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          <i className="fas fa-times me-2"></i>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TagModal; 