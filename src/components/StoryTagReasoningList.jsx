import React, { useState, useEffect } from 'react';
import { intelligentTagApi } from '../services/intelligentTagApi';
import StoryTagReasoningCard from './StoryTagReasoningCard';
import './StoryTagReasoningList.scss';

const StoryTagReasoningList = ({ storyId }) => {
  const [reasonings, setReasonings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (storyId) {
      loadReasonings();
    }
  }, [storyId]);

  const loadReasonings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await intelligentTagApi.getStoryReasonings(storyId);
      // Ensure we have an array of reasonings
      const reasoningsData = Array.isArray(response.data) ? response.data : [];
      setReasonings(reasoningsData);
    } catch (error) {
      console.error('Error loading reasonings:', error);
      setError('Failed to load reasonings');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingUpdate = (updatedReasoning) => {
    setReasonings(prev => 
      prev.map(reasoning => 
        reasoning.id === updatedReasoning.id ? updatedReasoning : reasoning
      )
    );
  };

  const handleReasoningUpdate = (updatedReasoning) => {
    setReasonings(prev => 
      prev.map(reasoning => 
        reasoning.id === updatedReasoning.id ? updatedReasoning : reasoning
      )
    );
  };

  if (loading) {
    return (
      <div className="story-tag-reasoning-list">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading reasonings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="story-tag-reasoning-list">
        <div className="error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={loadReasonings} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reasonings || reasonings.length === 0) {
    return (
      <div className="story-tag-reasoning-list">
        <div className="empty-state">
          <i className="fas fa-info-circle"></i>
          <p>No reasonings found for this story.</p>
          <p>Reasonings will appear here when you accept tag suggestions or add tags manually.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="story-tag-reasoning-list">
      <div className="list-header">
        <h3>Story Tag Reasonings</h3>
        <p>These are the reasoning records for each tag in your story. You can rate and edit them to help improve future AI suggestions.</p>
      </div>
      
      <div className="reasonings-container">
        {reasonings.map(reasoning => (
          <StoryTagReasoningCard
            key={reasoning.id}
            reasoning={reasoning}
            onRatingUpdate={handleRatingUpdate}
            onReasoningUpdate={handleReasoningUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default StoryTagReasoningList; 