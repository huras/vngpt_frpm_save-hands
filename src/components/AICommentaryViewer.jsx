import React, { useState, useEffect } from 'react';
import { intelligentTagApi } from '../services/intelligentTagApi';
import './AICommentaryViewer.scss';

const AICommentaryViewer = ({ storyId, tagId, tag, onCommentaryUpdate }) => {
  const [commentary, setCommentary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newCommentary, setNewCommentary] = useState('');
  const [userFeedback, setUserFeedback] = useState('');
  const [updating, setUpdating] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (storyId && tagId) {
      fetchCommentary();
      fetchHistory();
    }
  }, [storyId, tagId]);

  const fetchCommentary = async () => {
    try {
      setLoading(true);
      const response = await intelligentTagApi.getCommentary(storyId, tagId);
      if (response.data.success) {
        setCommentary(response.data.data);
        setNewCommentary(response.data.data?.commentary || '');
      }
    } catch (error) {
      console.error('Error fetching commentary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await intelligentTagApi.getCommentaryHistory(storyId, tagId);
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleUpdateCommentary = async () => {
    try {
      setUpdating(true);
      const response = await intelligentTagApi.updateCommentary(
        storyId, 
        tagId, 
        newCommentary, 
        userFeedback
      );
      
      if (response.data.success) {
        setCommentary(response.data.data);
        setEditing(false);
        setUserFeedback('');
        await fetchHistory();
        if (onCommentaryUpdate) {
          onCommentaryUpdate(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error updating commentary:', error);
    } finally {
      setUpdating(false);
    }
  };

  const analyzeCommentary = async (commentaryText) => {
    try {
      const response = await intelligentTagApi.analyzeCommentary(commentaryText);
      if (response.data.success) {
        setAnalysis(response.data.data);
      }
    } catch (error) {
      console.error('Error analyzing commentary:', error);
    }
  };

  const getTriggerTypeLabel = (triggerType) => {
    const labels = {
      'initial_suggestion': 'Initial Suggestion',
      'reevaluation': 'Re-evaluation',
      'user_feedback': 'User Feedback',
      'story_update': 'Story Update',
      'manual_update': 'Manual Update'
    };
    return labels[triggerType] || triggerType;
  };

  const getQualityColor = (score) => {
    if (score >= 8) return '#4CAF50';
    if (score >= 6) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return <div className="ai-commentary-viewer loading">Loading commentary...</div>;
  }

  return (
    <div className="ai-commentary-viewer">
      <div className="commentary-header">
        <h4>AI Commentary for {tag?.title}</h4>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
          <button 
            className="btn-secondary"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {commentary && (
        <div className="current-commentary">
          <div className="commentary-meta">
            <span className="version">Version {commentary.version}</span>
            <span className="trigger-type">{getTriggerTypeLabel(commentary.triggerType)}</span>
            <span className="confidence">
              Confidence: {Math.round(commentary.confidence * 100)}%
            </span>
            <span className="date">
              {new Date(commentary.createdAt).toLocaleDateString()}
            </span>
          </div>

          {editing ? (
            <div className="edit-form">
              <textarea
                value={newCommentary}
                onChange={(e) => setNewCommentary(e.target.value)}
                placeholder="Enter improved commentary..."
                rows={4}
              />
              <textarea
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                placeholder="Optional: Provide feedback on why this needs improvement..."
                rows={2}
              />
              <div className="edit-actions">
                <button 
                  className="btn-primary"
                  onClick={handleUpdateCommentary}
                  disabled={updating || !newCommentary.trim()}
                >
                  {updating ? 'Updating...' : 'Update Commentary'}
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => analyzeCommentary(newCommentary)}
                >
                  Analyze Quality
                </button>
              </div>
            </div>
          ) : (
            <div className="commentary-content">
              <p>{commentary.commentary}</p>
              {commentary.userFeedback && (
                <div className="user-feedback">
                  <strong>User Feedback:</strong> {commentary.userFeedback}
                </div>
              )}
            </div>
          )}

          {analysis && (
            <div className="quality-analysis">
              <h5>Quality Analysis</h5>
              <div className="scores">
                <div className="score-item">
                  <span>Specificity:</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ 
                        width: `${analysis.scores.specificity * 10}%`,
                        backgroundColor: getQualityColor(analysis.scores.specificity)
                      }}
                    ></div>
                    <span>{analysis.scores.specificity}/10</span>
                  </div>
                </div>
                <div className="score-item">
                  <span>Insightfulness:</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ 
                        width: `${analysis.scores.insightfulness * 10}%`,
                        backgroundColor: getQualityColor(analysis.scores.insightfulness)
                      }}
                    ></div>
                    <span>{analysis.scores.insightfulness}/10</span>
                  </div>
                </div>
                <div className="score-item">
                  <span>Avoidance of Generic:</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ 
                        width: `${analysis.scores.avoidance_of_generic * 10}%`,
                        backgroundColor: getQualityColor(analysis.scores.avoidance_of_generic)
                      }}
                    ></div>
                    <span>{analysis.scores.avoidance_of_generic}/10</span>
                  </div>
                </div>
                <div className="score-item">
                  <span>Concreteness:</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ 
                        width: `${analysis.scores.concreteness * 10}%`,
                        backgroundColor: getQualityColor(analysis.scores.concreteness)
                      }}
                    ></div>
                    <span>{analysis.scores.concreteness}/10</span>
                  </div>
                </div>
              </div>
              <div className="overall-score">
                <strong>Overall Score: {analysis.overall_score}/10</strong>
                {analysis.is_generic && (
                  <span className="generic-warning">⚠️ Contains generic statements</span>
                )}
              </div>
              {analysis.suggestions.length > 0 && (
                <div className="suggestions">
                  <strong>Suggestions for improvement:</strong>
                  <ul>
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showHistory && history.length > 0 && (
        <div className="commentary-history">
          <h5>Commentary History</h5>
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-meta">
                  <span className="version">Version {item.version}</span>
                  <span className="trigger-type">{getTriggerTypeLabel(item.triggerType)}</span>
                  <span className="date">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  {item.isCurrent && <span className="current-badge">Current</span>}
                </div>
                <div className="history-content">
                  <p>{item.commentary}</p>
                  {item.userFeedback && (
                    <div className="user-feedback">
                      <strong>User Feedback:</strong> {item.userFeedback}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!commentary && (
        <div className="no-commentary">
          <p>No AI commentary found for this tag-story relationship.</p>
        </div>
      )}
    </div>
  );
};

export default AICommentaryViewer; 