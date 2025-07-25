import React, { useState } from 'react';
import './DirectiveCard.scss';

const DirectiveCard = ({ directive, onUpdate, onDelete, onRegenerate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDirective, setEditDirective] = useState(directive.directive);
  const [editDirectiveAim, setEditDirectiveAim] = useState(directive.directive_aim);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!editDirective.trim() || !editDirectiveAim.trim()) {
      alert('Both directive and directive aim are required.');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(editDirective, editDirectiveAim);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating directive:', error);
      alert('Failed to update directive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditDirective(directive.directive);
    setEditDirectiveAim(directive.directive_aim);
    setIsEditing(false);
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Are you sure you want to regenerate this directive? This will replace the current content.')) {
      return;
    }

    setIsLoading(true);
    try {
      await onRegenerate();
    } catch (error) {
      console.error('Error regenerating directive:', error);
      alert('Failed to regenerate directive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this directive? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting directive:', error);
      alert('Failed to delete directive.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="directive-card editing">
        <div className="directive-header">
          <h4>Edit Directive</h4>
        </div>
        <div className="directive-content">
          <div className="form-group">
            <label>Directive:</label>
            <textarea
              value={editDirective}
              onChange={(e) => setEditDirective(e.target.value)}
              placeholder="Enter the directive..."
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Directive Aim:</label>
            <input
              type="text"
              value={editDirectiveAim}
              onChange={(e) => setEditDirectiveAim(e.target.value)}
              placeholder="Enter the directive aim..."
            />
          </div>
        </div>
        <div className="directive-actions">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="btn btn-primary btn-sm"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="directive-card">
      <div className="directive-header">
        <h4>Tag Directive</h4>
        <div className="directive-actions">
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-outline-primary btn-sm"
            title="Edit directive"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="btn btn-outline-secondary btn-sm"
            title="Regenerate directive"
          >
            <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="btn btn-outline-danger btn-sm"
            title="Delete directive"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div className="directive-content">
        {/* <div className="directive-aim">
          <strong>Aim:</strong> {directive.directive_aim}
        </div> */}
        <div className="directive-text">
          {directive.directive.split('\n').map((line, index) => (
            line.trim() && (
              <div key={index} className="directive-aim">
                {line.trim()}
              </div>
            )
          ))}
        </div>
      </div>
      <div className="directive-footer">
        <small className="text-muted">
          Created: {new Date(directive.createdAt).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

export default DirectiveCard; 