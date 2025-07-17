import React, { useState, useEffect, useCallback, useRef } from 'react';
import { tagApi } from '../services/tagApi';
import { BACKEND_CONFIG } from '../config/backend';
import './TagRecommendationSlot.scss';

const TagRecommendationSlot = ({ 
  slotId, 
  baseTags, 
  storyBrainstorm, 
  onTagSelect, 
  disabled, 
  selectedTags, 
  onSlotEmpty,
  onSlotReady,
  maxRetries = 3,
  focusedMode = false,
  focusTag = null
}) => {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [persisting, setPersisting] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading recommendation...');
  const [buttonLoading, setButtonLoading] = useState({ reload: false, forceNew: false });
  const loadingTimeoutRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  const loadRecommendation = useCallback(async (isRetry = false, forceNew = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update loading message based on action type
      if (forceNew) {
        setLoadingMessage('Generating new recommendation...');
      } else {
        setLoadingMessage('Loading recommendation...');
      }
      
      // Add a small delay for better UX
      await new Promise(resolve => {
        loadingTimeoutRef.current = setTimeout(resolve, 200 + Math.random() * 300);
      });
      
      const tagIds = baseTags.map(tag => tag.id);
      
      const response = await tagApi.getAIRecommendations(
        tagIds, 
        1, 
        storyBrainstorm, 
        forceNew, 
        focusedMode, 
        focusTag?.id
      );
      
      if (response.data.recommendations && response.data.recommendations.length > 0) {
        const newRecommendation = response.data.recommendations[0];
        
        // Simple check: if already selected, show empty state
        const isAlreadySelected = selectedTags.some(tag => 
          tag.id === newRecommendation.id || 
          (newRecommendation.isVirtual && tag.title.toLowerCase() === newRecommendation.title.toLowerCase())
        );
        
        if (isAlreadySelected) {
          setRecommendation(null);
        } else {
          setRecommendation(newRecommendation);
        }
      } else {
        setRecommendation(null);
      }
    } catch (error) {
      console.error('Error loading recommendation for slot:', slotId, error);
      setError('Failed to load recommendation');
      setRecommendation(null);
    } finally {
      setLoading(false);
    }
  }, [baseTags, storyBrainstorm, selectedTags, slotId, focusedMode, focusTag]);

  const handleReload = async (e) => {
    e.stopPropagation();
    if (disabled || buttonLoading.reload || loading) return;
    
    setButtonLoading(prev => ({ ...prev, reload: true }));
    try {
      await loadRecommendation(false, false);
    } catch (error) {
      console.error('Error reloading recommendation:', error);
    } finally {
      setButtonLoading(prev => ({ ...prev, reload: false }));
    }
  };

  const handleForceNew = async (e) => {
    e.stopPropagation();
    if (disabled || buttonLoading.forceNew || loading) return;
    
    setButtonLoading(prev => ({ ...prev, forceNew: true }));
    try {
      await loadRecommendation(false, true);
    } catch (error) {
      console.error('Error generating new recommendation:', error);
    } finally {
      setButtonLoading(prev => ({ ...prev, forceNew: false }));
    }
  };

  const handleTagClick = async () => {
    if (disabled || fadingOut || persisting || !recommendation) return;
    
    try {
      // If this is a virtual AI-suggested tag, persist it first
      if (recommendation.isVirtual && !recommendation.isExisting) {
        setPersisting(true);
        const persistResult = await tagApi.persistAISuggestedTag(recommendation);
        
        if (persistResult.success) {
          // Replace the virtual tag with the persisted one
          const persistedTag = {
            ...recommendation,
            ...persistResult.data,
            isVirtual: false,
            isExisting: true
          };
          
          onTagSelect && onTagSelect(persistedTag);
        } else {
          console.error('Failed to persist AI-suggested tag:', persistResult.error);
          onTagSelect && onTagSelect(recommendation);
        }
      } else {
        onTagSelect && onTagSelect(recommendation);
      }
      
      // Start fade out animation
      setFadingOut(true);
      
      // Wait for fade out animation, then load new recommendation
      fadeTimeoutRef.current = setTimeout(async () => {
        setFadingOut(false);
        setPersisting(false);
        await loadRecommendation();
      }, 300);
      
    } catch (error) {
      console.error('Error handling tag selection:', error);
      onTagSelect && onTagSelect(recommendation);
      
      setFadingOut(true);
      fadeTimeoutRef.current = setTimeout(async () => {
        setFadingOut(false);
        setPersisting(false);
        await loadRecommendation();
      }, 300);
    }
  };

  // Load initial recommendation
  useEffect(() => {
    loadRecommendation();
    
    // Cleanup timeouts on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [loadRecommendation]);

  if (loading) {
    return (
      <div className="recommendation-slot loading-slot">
        <div className="recommendation-image">
          <div className="loading-placeholder">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </div>
        <div className="recommendation-content">
          <div className="loading-title"></div>
          <div className="loading-description"></div>
          <div className="loading-message">
            <i className="fas fa-clock"></i>
            {loadingMessage}
          </div>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="recommendation-slot empty-slot">
        <div className="recommendation-image">
          <div className="empty-placeholder">
            <i className="fas fa-plus"></i>
          </div>
        </div>
        <div className="recommendation-content">
          <div className="empty-title">No recommendation</div>
          <div className="empty-message">
            <button 
              className="retry-btn"
              onClick={() => loadRecommendation(false, true)}
              disabled={loading}
            >
              <i className="fas fa-redo"></i> Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`recommendation-slot${fadingOut ? ' fading-out' : ''}${disabled ? ' disabled' : ''}${persisting ? ' persisting' : ''}`}
      onClick={handleTagClick}
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
        {recommendation.isFallback && (
          <span className="fallback-badge" title="Fallback (not AI)">Fallback</span>
        )}
        {recommendation.isVirtual && !recommendation.isExisting && (
          <span className="virtual-badge" title="AI-suggested (will be created)">New</span>
        )}
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className={`action-btn reload-btn${buttonLoading.reload ? ' loading' : ''}`}
            onClick={handleReload}
            disabled={disabled || buttonLoading.reload || buttonLoading.forceNew || loading}
            title="Reload current recommendation"
            aria-label="Reload current recommendation"
          >
            {buttonLoading.reload ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-redo"></i>
            )}
          </button>
          <button
            className={`action-btn force-new-btn${buttonLoading.forceNew ? ' loading' : ''}`}
            onClick={handleForceNew}
            disabled={disabled || buttonLoading.reload || buttonLoading.forceNew || loading}
            title="Generate new AI recommendation"
            aria-label="Generate new AI recommendation"
          >
            {buttonLoading.forceNew ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-magic"></i>
            )}
          </button>
        </div>
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
  );
};

export default TagRecommendationSlot; 