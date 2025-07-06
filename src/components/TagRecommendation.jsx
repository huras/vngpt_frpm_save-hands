import React, { useState, useEffect } from 'react';
import { tagApi } from '../services/tagApi';
import { BACKEND_CONFIG } from '../config/backend';
import './TagRecommendation.scss';

const TagRecommendation = ({ 
  baseTags = [], // Can be single tag or array of tags
  onTagSelect,
  disabled = false,
  title = 'AI Recommendations',
  maxRecommendations = 6,
  showBaseTags = true,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);

  // Normalize baseTags to always be an array
  const normalizedBaseTags = Array.isArray(baseTags) ? baseTags : [baseTags];

  useEffect(() => {
    if (normalizedBaseTags.length > 0) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
      setAiInsights(null);
    }
  }, [normalizedBaseTags]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tagIds = normalizedBaseTags.map(tag => tag.id);
      const response = await tagApi.getAIRecommendations(tagIds, maxRecommendations);
      
      setRecommendations(response.data.recommendations || []);
      setAiInsights(response.data.aiInsights || null);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      setError('Failed to load AI recommendations');
      
      // Fallback to basic recommendations
      try {
        const fallbackResponse = await tagApi.getTagRecommendations(
          normalizedBaseTags[0].id, 
          maxRecommendations
        );
        setRecommendations(fallbackResponse);
      } catch (fallbackError) {
        console.error('Fallback recommendations also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag) => {
    if (disabled) return;
    onTagSelect && onTagSelect(tag);
  };

  const getBaseTagsText = () => {
    if (normalizedBaseTags.length === 1) {
      return `Based on "${normalizedBaseTags[0].title}"`;
    } else if (normalizedBaseTags.length === 2) {
      return `Based on "${normalizedBaseTags[0].title}" and "${normalizedBaseTags[1].title}"`;
    } else {
      const tagNames = normalizedBaseTags.map(tag => tag.title);
      const lastTag = tagNames.pop();
      return `Based on ${tagNames.join(', ')}, and ${lastTag}`;
    }
  };

  if (normalizedBaseTags.length === 0) {
    return null;
  }

  return (
    <div className={`tag-recommendation-container ${className}`}>
      {/* Header */}
      <div className="recommendation-header">
        <h3 className="recommendation-title">
          <i className="fas fa-robot"></i>
          {title}
        </h3>
        <p className="recommendation-subtitle">{getBaseTagsText()}</p>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <div className="ai-insights">
          <div className="insights-header">
            <i className="fas fa-lightbulb"></i>
            <span>AI Analysis</span>
          </div>
          <p className="insights-text">{aiInsights}</p>
        </div>
      )}

      {/* Base Tags Display */}
      {showBaseTags && (
        <div className="base-tags-display">
          <span className="base-tags-label">Your selection:</span>
          <div className="base-tags-list">
            {normalizedBaseTags.map(tag => (
              <span key={tag.id} className="base-tag">
                {tag.thumb_url && (
                  <img 
                    src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
                    alt={tag.title} 
                    className="base-tag-thumb"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <span className="base-tag-title">{tag.title}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="recommendations-section">
        {loading ? (
          <div className="recommendations-loading">
            <div className="ai-loading-spinner">
              <i className="fas fa-brain"></i>
            </div>
            <p>AI is analyzing your preferences...</p>
          </div>
        ) : error ? (
          <div className="recommendations-error">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button 
              className="retry-btn"
              onClick={fetchRecommendations}
            >
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="no-recommendations">
            <i className="fas fa-search"></i>
            <p>No AI recommendations found</p>
          </div>
        ) : (
          <div className="recommendations-grid">
            {recommendations.map(recommendation => (
              <div
                key={recommendation.id}
                className={`recommendation-card ${disabled ? 'disabled' : ''}`}
                onClick={() => handleTagClick(recommendation)}
              >
                <div className="recommendation-image">
                  {recommendation.thumb_url ? (
                    <img 
                      src={BACKEND_CONFIG.getImageUrl(recommendation.thumb_url)} 
                      alt={recommendation.title} 
                      className="rec-thumb"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('no-image');
                      }}
                    />
                  ) : (
                    <div className="rec-no-image">
                      <span>{recommendation.title.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  {recommendation.confidence && (
                    <div className="confidence-badge">
                      <span>{Math.round(recommendation.confidence * 100)}%</span>
                    </div>
                  )}
                </div>
                <div className="recommendation-content">
                  <h5 className="rec-title">{recommendation.title}</h5>
                  {recommendation.short_description && (
                    <p className="rec-description">{recommendation.short_description}</p>
                  )}
                  {recommendation.reason && (
                    <p className="rec-reason">
                      <i className="fas fa-info-circle"></i>
                      {recommendation.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="recommendation-footer">
        <p className="ai-disclaimer">
          <i className="fas fa-shield-alt"></i>
          Recommendations powered by AI analysis of your preferences
        </p>
      </div>
    </div>
  );
};

export default TagRecommendation; 