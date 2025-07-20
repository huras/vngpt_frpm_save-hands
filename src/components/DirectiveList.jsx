import React, { useState } from 'react';
import DirectiveCard from './DirectiveCard';
import './DirectiveList.scss';

const DirectiveList = ({ 
  directives = [], 
  suggestionId, 
  onUpdateDirective, 
  onDeleteDirective, 
  onRegenerateDirective,
  onGenerateNewDirective,
  isLoading = false,
  error = null 
}) => {
  const [expandedDirectiveId, setExpandedDirectiveId] = useState(null);

  const handleUpdateDirective = async (directiveId, newDirective, newDirectiveAim) => {
    try {
      await onUpdateDirective(suggestionId, directiveId, newDirective, newDirectiveAim);
    } catch (error) {
      console.error('Error updating directive:', error);
      throw error;
    }
  };

  const handleDeleteDirective = async (directiveId) => {
    try {
      await onDeleteDirective(suggestionId, directiveId);
      if (expandedDirectiveId === directiveId) {
        setExpandedDirectiveId(null);
      }
    } catch (error) {
      console.error('Error deleting directive:', error);
      throw error;
    }
  };

  const handleRegenerateDirective = async (directiveId) => {
    try {
      await onRegenerateDirective(suggestionId, directiveId);
      // Close the expanded directive after regeneration
      setExpandedDirectiveId(null);
    } catch (error) {
      console.error('Error regenerating directive:', error);
      throw error;
    }
  };

  const handleGenerateNew = async () => {
    try {
      await onGenerateNewDirective(suggestionId);
    } catch (error) {
      console.error('Error generating new directive:', error);
      throw error;
    }
  };

  const toggleDirectiveExpansion = (directiveId) => {
    setExpandedDirectiveId(expandedDirectiveId === directiveId ? null : directiveId);
  };

  if (isLoading) {
    return (
      <div className="directive-list">
        <div className="loading-directives">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading directives...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="directive-list">
        <div className="directive-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="directive-list">
      {/* Header with count and generate button */}
      <div className="directive-list-header">
        <div className="directive-count">
          <span className="count-number">{directives.length}</span>
          <span className="count-label">
            {directives.length === 1 ? 'Directive' : 'Directives'}
          </span>
        </div>
        <button
          onClick={handleGenerateNew}
          className="btn btn-sm btn-outline-primary"
          disabled={isLoading}
        >
          <i className="fas fa-plus"></i>
          Generate New
        </button>
      </div>

      {/* Directives list */}
      {directives.length === 0 ? (
        <div className="no-directives">
          <i className="fas fa-lightbulb"></i>
          <span>No directives yet. Generate your first directive to get started!</span>
        </div>
      ) : (
        <div className="directives-container">
          {directives.map((directive, index) => (
            <div key={directive.id} className="directive-item">
                             {/* Directive summary (always visible) */}
               <div 
                 className="directive-summary"
                 onClick={() => toggleDirectiveExpansion(directive.id)}
               >
                 <div className="directive-info">
                   <div className="directive-number">#{index + 1}</div>
                   <div className="directive-content">
                     <div className="directive-aim">
                       {directive.directive_aim}
                       {index > 0 && (
                         <span className="perspective-badge" title="Generated with awareness of existing directives">
                           <i className="fas fa-lightbulb"></i>
                           New Perspective
                         </span>
                       )}
                     </div>
                     <div className="directive-preview">
                       {directive.directive.length > 100 
                         ? `${directive.directive.substring(0, 100)}...` 
                         : directive.directive
                       }
                     </div>
                   </div>
                   <div className="directive-meta">
                     <small className="directive-date">
                       {new Date(directive.createdAt).toLocaleDateString()}
                     </small>
                   </div>
                 </div>
                 <div className="directive-toggle">
                   <i className={`fas fa-chevron-${expandedDirectiveId === directive.id ? 'up' : 'down'}`}></i>
                 </div>
               </div>

              {/* Expanded directive card */}
              {expandedDirectiveId === directive.id && (
                <div className="directive-expanded">
                  <DirectiveCard
                    directive={directive}
                    onUpdate={(newDirective, newDirectiveAim) => 
                      handleUpdateDirective(directive.id, newDirective, newDirectiveAim)
                    }
                    onDelete={() => handleDeleteDirective(directive.id)}
                    onRegenerate={() => handleRegenerateDirective(directive.id)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectiveList; 