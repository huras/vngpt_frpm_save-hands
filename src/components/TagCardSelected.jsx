import React from 'react';
import TagCard from './TagCard';
import './TagCardSelected.scss';

const TagCardSelected = ({ 
  reasoning, 
  onAIRegenerate, 
  onEdit, 
  onRate, 
  onHistory, 
  onReject,
  onSaveEdit,
  onCancelEdit,
  onReasoningChange,
  isEditing,
  isRegenerating,
  disabled = false,
  className = ''
}) => {
  return (
    <TagCard 
      tag={reasoning.tag} 
      className={`tag-card-selected ${className}`}
    >
      <div className="tag-actions">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm ai-regenerate-btn"
          onClick={() => onAIRegenerate(reasoning.id, reasoning.tagId)}
          disabled={isRegenerating || disabled}
          title="Use AI to regenerate the directive for this tag"
        >
          {isRegenerating ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <i className="fas fa-magic"></i>
              <span>AI Regenerate</span>
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm edit-reasoning-btn"
          onClick={() => onEdit(reasoning.id)}
          disabled={disabled}
          title="Edit the explanation for this tag"
        >
          <i className="fas fa-edit"></i>
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
        <button
          type="button"
          className="btn btn-outline-warning btn-sm"
          onClick={() => onRate({ id: reasoning.suggestionId, tag: reasoning.tag, reasoning: reasoning.reasoning })}
          disabled={disabled}
          title="Rate this suggestion"
        >
          <i className="fas fa-star"></i>
          <span>Rate</span>
        </button>
        <button
          type="button"
          className="btn btn-outline-info btn-sm reasoning-history-btn"
          onClick={() => onHistory(reasoning)}
          disabled={disabled}
          title="View reasoning history and manage versions"
        >
          <i className="fas fa-history"></i>
          <span>History</span>
        </button>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => onReject(reasoning)}
          disabled={disabled}
          title="Reject this tag"
        >
          <i className="fas fa-times"></i>
          <span>Reject</span>
        </button>
      </div>
      
      {isEditing ? (
        <div className="editing-reasoning">
          <textarea
            className="form-control"
            value={reasoning.reasoning}
            onChange={(e) => onReasoningChange(e.target.value)}
            rows={3}
            placeholder="Edit the explanation..."
          />
          <div className="edit-actions">
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => onSaveEdit(reasoning.id, reasoning.reasoning)}
            >
              Save
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onCancelEdit()}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="reasoning">{reasoning.reasoning}</p>
      )}
      
      {reasoning.userExplanation && (
        <p className="user-explanation">Your note: {reasoning.userExplanation}</p>
      )}
      <span className="source-badge">{reasoning.source}</span>
    </TagCard>
  );
};

export default TagCardSelected; 