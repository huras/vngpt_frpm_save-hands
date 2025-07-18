import React, { useState, useEffect } from 'react';
import { intelligentTagApi } from '../services/intelligentTagApi';
import './ReasoningDialogTree.scss';

const ReasoningDialogTree = ({ 
  storyId, 
  tagId, 
  tagTitle, 
  isOpen, 
  onClose, 
  onReasoningUpdate 
}) => {
  const [commentaryHistory, setCommentaryHistory] = useState([]);
  const [currentCommentary, setCurrentCommentary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [generatingNew, setGeneratingNew] = useState(false);
  const [newReasoningPrompt, setNewReasoningPrompt] = useState('');

  useEffect(() => {
    if (isOpen && storyId && tagId) {
      fetchCommentaryHistory();
    }
  }, [isOpen, storyId, tagId]);

  const fetchCommentaryHistory = async () => {
    try {
      setLoading(true);
      const [historyResponse, currentResponse] = await Promise.all([
        intelligentTagApi.getCommentaryHistory(storyId, tagId),
        intelligentTagApi.getCommentary(storyId, tagId)
      ]);

      if (historyResponse.data.success) {
        setCommentaryHistory(historyResponse.data.data);
      }

      if (currentResponse.data.success) {
        setCurrentCommentary(currentResponse.data.data);
        setSelectedVersion(currentResponse.data.data?.id || null);
      }
    } catch (error) {
      console.error('Error fetching commentary history:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewReasoning = async () => {
    if (!newReasoningPrompt.trim()) return;

    try {
      setGeneratingNew(true);
      const response = await intelligentTagApi.createCommentary(
        storyId,
        tagId,
        newReasoningPrompt,
        'User requested new reasoning',
        'user_feedback'
      );

      if (response.data.success) {
        setNewReasoningPrompt('');
        await fetchCommentaryHistory();
        onReasoningUpdate && onReasoningUpdate(response.data.data.commentary);
      }
    } catch (error) {
      console.error('Error generating new reasoning:', error);
    } finally {
      setGeneratingNew(false);
    }
  };

  const setActiveVersion = async (commentaryId) => {
    try {
      // Find the commentary to get its text
      const commentary = commentaryHistory.find(c => c.id === commentaryId);
      if (!commentary) return;

      const response = await intelligentTagApi.createCommentary(
        storyId,
        tagId,
        commentary.commentary,
        'User selected this version as active',
        'user_feedback'
      );

      if (response.data.success) {
        setSelectedVersion(commentaryId);
        setCurrentCommentary(commentary);
        onReasoningUpdate && onReasoningUpdate(commentary.commentary);
      }
    } catch (error) {
      console.error('Error setting active version:', error);
    }
  };

  const getTriggerTypeLabel = (triggerType) => {
    const labels = {
      'initial_suggestion': 'Initial AI Suggestion',
      'reevaluation': 'AI Re-evaluation',
      'user_feedback': 'User Feedback',
      'story_update': 'Story Update',
      'manual_update': 'Manual Update',
      'ai_regenerate': 'AI Regenerate',
      'ai_directive': 'AI Directive'
    };
    return labels[triggerType] || triggerType;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="reasoning-dialog-overlay">
      <div className="reasoning-dialog-container">
        <div className="dialog-header">
          <h3>Reasoning History: {tagTitle}</h3>
          <button 
            className="btn-close" 
            onClick={onClose}
            title="Close dialog"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="dialog-content">
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading reasoning history...</p>
            </div>
          ) : (
            <>
              {/* Current Active Reasoning */}
              {currentCommentary && (
                <div className="current-reasoning-section">
                  <h4>
                    <i className="fas fa-star"></i>
                    Current Active Reasoning
                  </h4>
                  <div className="reasoning-card active">
                    <div className="reasoning-content">
                      <p>{currentCommentary.commentary}</p>
                    </div>
                    <div className="reasoning-meta">
                      <span className="version">v{currentCommentary.version}</span>
                      <span className="trigger-type">{getTriggerTypeLabel(currentCommentary.triggerType)}</span>
                      <span className="date">{formatDate(currentCommentary.createdAt)}</span>
                      {currentCommentary.confidence && (
                        <span className="confidence">{Math.round(currentCommentary.confidence * 100)}% confidence</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Reasoning History Tree */}
              <div className="reasoning-history-section">
                <h4>
                  <i className="fas fa-history"></i>
                  Reasoning History
                </h4>
                
                {commentaryHistory.length === 0 ? (
                  <div className="empty-history">
                    <p>No reasoning history available.</p>
                  </div>
                ) : (
                  <div className="reasoning-tree">
                    {commentaryHistory.map((commentary, index) => (
                      <div 
                        key={commentary.id} 
                        className={`reasoning-card ${commentary.id === selectedVersion ? 'selected' : ''}`}
                        onClick={() => setSelectedVersion(commentary.id)}
                      >
                        <div className="reasoning-content">
                          <p>{commentary.commentary}</p>
                        </div>
                        <div className="reasoning-meta">
                          <span className="version">v{commentary.version}</span>
                          <span className="trigger-type">{getTriggerTypeLabel(commentary.triggerType)}</span>
                          <span className="date">{formatDate(commentary.createdAt)}</span>
                          {commentary.confidence && (
                            <span className="confidence">{Math.round(commentary.confidence * 100)}% confidence</span>
                          )}
                        </div>
                        <div className="reasoning-actions">
                          {commentary.id !== selectedVersion && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveVersion(commentary.id);
                              }}
                            >
                              Set as Active
                            </button>
                          )}
                          {commentary.id === selectedVersion && (
                            <span className="active-badge">
                              <i className="fas fa-check"></i> Active
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate New Reasoning */}
              <div className="generate-new-section">
                <h4>
                  <i className="fas fa-magic"></i>
                  Generate New Reasoning
                </h4>
                <div className="generate-form">
                  <textarea
                    className="form-control"
                    placeholder="Describe what you want to change or improve about the reasoning..."
                    value={newReasoningPrompt}
                    onChange={(e) => setNewReasoningPrompt(e.target.value)}
                    rows={3}
                  />
                  <button
                    className="btn btn-success"
                    onClick={generateNewReasoning}
                    disabled={!newReasoningPrompt.trim() || generatingNew}
                  >
                    {generatingNew ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic"></i>
                        Generate New Reasoning
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReasoningDialogTree; 