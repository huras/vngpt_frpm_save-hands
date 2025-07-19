import React from 'react';
import TagCard from './TagCard';
import './TagCardSuggestion.scss';

const TagCardSuggestion = ({ 
  suggestion, 
  onRate, 
  onAccept, 
  onReject, 
  disabled = false,
  className = ''
}) => {
  return (
    <TagCard 
      tag={suggestion.tag} 
      className={`tag-card-suggestion ${className}`}
    >
      <p className="reasoning">{suggestion.reasoning}</p>
      
      <div className="confidence-bar">
        <div 
          className="confidence-fill" 
          style={{ width: `${suggestion.confidence * 100}%` }}
        ></div>
        <span className="confidence-text">{Math.round(suggestion.confidence * 100)}%</span>
      </div>

      <div className="suggestion-actions">
        <button 
          className="btn btn-outline-warning btn-sm"
          onClick={() => onRate(suggestion)}
          disabled={disabled}
          title="Rate this suggestion"
        >
          <i className="fas fa-star"></i>
          <span>Rate</span>
        </button>
        <button 
          className="btn btn-success btn-sm"
          onClick={() => onAccept(suggestion)}
          disabled={disabled}
          title="Accept this suggestion"
        >
          <i className="fas fa-check"></i>
          <span>Accept</span>
        </button>
        <button 
          className="btn btn-danger btn-sm"
          onClick={() => onReject(suggestion)}
          disabled={disabled}
          title="Reject this suggestion"
        >
          <i className="fas fa-times"></i>
          <span>Reject</span>
        </button>
      </div>
    </TagCard>
  );
};

export default TagCardSuggestion; 