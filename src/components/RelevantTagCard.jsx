import React, { useState, useEffect } from 'react';
import { BACKEND_CONFIG } from '../config/backend';
import { tagApi } from '../services/tagApi';
import TagModal from './TagModal';
import TagDirectivesTab from './TagDirectivesTab';
import WorldBuildingDirectivesTab from './WorldBuildingDirectivesTab';
import WorldBuildingEffectsTab from './WorldBuildingEffectsTab';
import RelatedTagsTab from './RelatedTagsTab';
import './RelevantTagCard.scss';

const RelevantTagCard = ({
  tag,
  isCurrentTag = false,
  isSelected = false,
  isExpanded = false,
  isProcessing = false,
  onTagToggle,
  onTagAccept,
  onTagReject,
  onTagReset,
  onTagExpand,
  results = null,
  isGenerating = false,
  streamingData = null,
  storyId = null,
  onRelatedTagsGenerated = null,
  onWorldBuildingEffectsGenerated = null,
  storyTitle = null,
  storyBrainstorm = null,
  onRefresh = null
}) => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('world-building-directives');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeletingDirectives, setIsDeletingDirectives] = useState(false);

  // Function to trigger refresh of tab components
  const handleRefreshTabs = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  // Function to delete world building directives and tag directives
  const handleDeleteDirectives = async () => {
    console.log('Starting delete directives for tag:', tag.title, 'suggestionId:', tag.suggestionId);
    
    if (!tag.suggestionId) {
      alert('No directives to delete for this tag.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete all world building directives and tag directives for "${tag.title}"?\n\n` +
      'This will remove:\n' +
      '• All world building directives\n' +
      '• All tag directives\n' +
      '• All associated data\n\n' +
      'This action cannot be undone.'
    );
    
    if (!confirmed) {
      return;
    }

    setIsDeletingDirectives(true);
    try {
      await tagApi.deleteWorldBuildingDirectives(tag.suggestionId);
      alert('Successfully deleted all directives for this tag.');
      
      // Force a complete refresh of all tabs by incrementing refreshKey multiple times
      // This ensures both WorldBuildingDirectivesTab and TagDirectivesTab reload their data
      setRefreshKey(prev => {
        const newKey = prev + 10;
        console.log('Refreshing tabs with new key:', newKey);
        return newKey;
      });
      
      // Also trigger the parent's refresh mechanism if available
      if (typeof onRefresh === 'function') {
        console.log('Calling parent onRefresh function');
        onRefresh();
      } else {
        console.log('No parent onRefresh function available');
      }
    } catch (error) {
      console.error('Error deleting directives:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      alert(`Error deleting directives: ${errorMessage}`);
    } finally {
      setIsDeletingDirectives(false);
    }
  };



  const getTagStatusBadge = (tag) => {
    if (!tag.suggestionId) return null;

    switch (tag.suggestionStatus) {
      case 'accepted':
        return <span className="status-badge accepted">Accepted</span>;
      case 'rejected':
        return <span className="status-badge rejected">Rejected</span>;
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`relevant-tag-card ${isCurrentTag ? 'current-story-tag' : ''}`}>
      <div className="tag-header">
        {tag.thumb_url && (
          <img 
            src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
            alt={tag.title}
            className="tag-thumb"
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="tag-info">
          <h4 className="tag-title">
            {tag.title}
            {isCurrentTag && <span className="current-tag-badge">Current</span>}
            {getTagStatusBadge(tag)}
          </h4>
          <div className="tag-details">
            {tag.selectionReasoning && (
              <div className="selection-reasoning">
                <p title="Why this tag fits your story">{tag.selectionReasoning}</p>
              </div>
            )}
          </div>
          <div className="tag-meta">
            <span className="tag-category">{tag.category}</span>
            {tag.relevanceScore && (
              <span className="relevance-score">Score: {tag.relevanceScore}/100</span>
            )}
          </div>
        </div>
        <div className="tag-actions">
          {!isCurrentTag && (tag.suggestionId || tag.selectionReasoning) && (
            <>
              {tag.suggestionStatus === 'accepted' ? (
                <button
                  onClick={() => onTagReset(tag)}
                  className="btn btn-sm btn-warning"
                  disabled={isProcessing}
                >
                  <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-undo'}`}></i>
                  Reset to Pending
                </button>
              ) : (
                <button
                  onClick={() => onTagAccept(tag)}
                  className="btn btn-sm btn-outline-success"
                  disabled={isProcessing || tag.suggestionStatus === 'rejected'}
                >
                  <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-check-circle'}`}></i>
                  Accept
                </button>
              )}
              <button
                onClick={() => onTagReject(tag)}
                className={`btn btn-sm ${tag.suggestionStatus === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                disabled={isProcessing || tag.suggestionStatus === 'rejected'}
              >
                <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-times-circle'}`}></i>
                {tag.suggestionStatus === 'rejected' ? 'Rejected' : 'Reject'}
              </button>
            </>
          )}
          
          <button
            onClick={() => onTagExpand(tag.id)}
            className="btn btn-sm btn-outline-info"
            disabled={isProcessing}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
          </button>
          
          {tag.suggestionId && tag.suggestionStatus === 'accepted' && (
            <button
              onClick={handleDeleteDirectives}
              className="btn btn-sm btn-outline-danger"
              disabled={isProcessing || isDeletingDirectives}
              title="Delete all world building directives and tag directives for this tag"
              style={{ borderWidth: '2px' }}
            >
              <i className={`fas ${isDeletingDirectives ? 'fa-spinner fa-spin' : 'fa-trash-alt'}`}></i>
              {isDeletingDirectives ? 'Deleting...' : 'Delete Directives'}
            </button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="tag-details">
          <ul className="nav nav-tabs" id={`tag-tabs-${tag.id}`} role="tablist">
            {tag.suggestionId && tag.suggestionStatus === 'accepted' && (
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'world-building-directives' ? 'active' : ''}`}
                  id={`world-building-directives-tab-${tag.id}`}
                  data-bs-toggle="tab"
                  data-bs-target={`#world-building-directives-content-${tag.id}`}
                  type="button"
                  role="tab"
                  aria-controls={`world-building-directives-content-${tag.id}`}
                  aria-selected={activeTab === 'world-building-directives'}
                  onClick={() => setActiveTab('world-building-directives')}
                >
                  <i className="fas fa-globe"></i> World Building
                </button>
              </li>
            )}

            {tag.suggestionId && tag.suggestionStatus === 'accepted' && (
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'directives' ? 'active' : ''}`}
                  id={`directives-tab-${tag.id}`}
                  data-bs-toggle="tab"
                  data-bs-target={`#directives-content-${tag.id}`}
                  type="button"
                  role="tab"
                  aria-controls={`directives-content-${tag.id}`}
                  aria-selected={activeTab === 'directives'}
                  onClick={() => setActiveTab('directives')}
                >
                  <i className="fas fa-tasks"></i> Tag Directives
                </button>
              </li>
            )}
            
            
            
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'effects' ? 'active' : ''}`}
                id={`effects-tab-${tag.id}`}
                data-bs-toggle="tab"
                data-bs-target={`#effects-content-${tag.id}`}
                type="button"
                role="tab"
                aria-controls={`effects-content-${tag.id}`}
                aria-selected={activeTab === 'effects'}
                onClick={() => setActiveTab('effects')}
              >
                <i className="fas fa-magic"></i> World-Building Effects
              </button>
            </li>
            
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'related' ? 'active' : ''}`}
                id={`related-tab-${tag.id}`}
                data-bs-toggle="tab"
                data-bs-target={`#related-content-${tag.id}`}
                type="button"
                role="tab"
                aria-controls={`related-content-${tag.id}`}
                aria-selected={activeTab === 'related'}
                onClick={() => setActiveTab('related')}
              >
                <i className="fas fa-tags"></i> Related Tags
              </button>
            </li>
          </ul>
          
          <div className="tab-content" id={`tag-tabs-content-${tag.id}`}>
            {tag.suggestionId && tag.suggestionStatus === 'accepted' && (
              <div
                className={`tab-pane fade ${activeTab === 'directives' ? 'show active' : ''}`}
                id={`directives-content-${tag.id}`}
                role="tabpanel"
                aria-labelledby={`directives-tab-${tag.id}`}
              >
                <TagDirectivesTab 
                  tag={tag} 
                  isExpanded={isExpanded}
                  refreshKey={refreshKey}
                  onRefresh={handleRefreshTabs}
                />
              </div>
            )}
            
            {tag.suggestionId && tag.suggestionStatus === 'accepted' && (
              <div
                className={`tab-pane fade ${activeTab === 'world-building-directives' ? 'show active' : ''}`}
                id={`world-building-directives-content-${tag.id}`}
                role="tabpanel"
                aria-labelledby={`world-building-directives-tab-${tag.id}`}
              >
                <WorldBuildingDirectivesTab 
                  tag={tag} 
                  isExpanded={isExpanded}
                  refreshKey={refreshKey}
                  onRefresh={handleRefreshTabs}
                />
              </div>
            )}
            
            <div
              className={`tab-pane fade ${activeTab === 'effects' ? 'show active' : ''}`}
              id={`effects-content-${tag.id}`}
              role="tabpanel"
              aria-labelledby={`effects-tab-${tag.id}`}
            >
              <WorldBuildingEffectsTab 
                tag={tag}
                results={results}
                storyId={storyId}
                onWorldBuildingEffectsGenerated={onWorldBuildingEffectsGenerated}
                storyTitle={storyTitle}
                storyBrainstorm={storyBrainstorm}
              />
            </div>
            
            <div
              className={`tab-pane fade ${activeTab === 'related' ? 'show active' : ''}`}
              id={`related-content-${tag.id}`}
              role="tabpanel"
              aria-labelledby={`related-tab-${tag.id}`}
            >
              <RelatedTagsTab 
                tag={tag}
                results={results}
                storyId={storyId}
                onRelatedTagsGenerated={onRelatedTagsGenerated}
              />
            </div>
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

export default RelevantTagCard; 