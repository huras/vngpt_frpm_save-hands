import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storyApi } from '../../services/storyApi';
import StreamingTagSuggestions from '../../components/StreamingTagSuggestions';
import StoryTagReasoningList from '../../components/StoryTagReasoningList';
import { BACKEND_CONFIG } from '../../config/backend';
import './StoryView.scss';

const StoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTagManagement, setShowTagManagement] = useState(false);
  const [showReasonings, setShowReasonings] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await storyApi.getStory(id);
        setStory(response.data);
      } catch (err) {
        setError('Story not found or failed to load.');
        console.error('Error fetching story:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      try {
        await storyApi.deleteStory(id);
        navigate('/stories');
      } catch (err) {
        setError('Failed to delete story. Please try again.');
        console.error('Error deleting story:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="story-view-container">
        <div className="loading-spinner">Loading story...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="story-view-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/stories" className="btn btn-primary">Back to Stories</Link>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="story-view-container">
        <div className="error-message">
          <h2>Story Not Found</h2>
          <p>The story you're looking for doesn't exist.</p>
          <Link to="/stories" className="btn btn-primary">Back to Stories</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="story-view-container">
      <div className="story-header">
        <div className="story-title-section">
          <h1>{story.title}</h1>
          <div className="story-meta">
            <span className="created-date">
              Created: {formatDate(story.createdAt)}
            </span>
            {story.updatedAt !== story.createdAt && (
              <span className="updated-date">
                Updated: {formatDate(story.updatedAt)}
              </span>
            )}
          </div>
        </div>
        <div className="story-actions">
          <Link to={`/stories/${id}/edit`} className="btn btn-primary">
            <i className="fas fa-edit"></i> Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <i className="fas fa-trash"></i> Delete
          </button>
          <Link to="/stories" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Back to Stories
          </Link>
        </div>
      </div>

      <div className="story-content">
        <div className="story-section">
          <h2>Story Details</h2>
          <div className="story-info">
            <div className="story-field">
              <label>Title:</label>
              <span>{story.title}</span>
            </div>
            {story.brainstorm && (
              <div className="story-field">
                <label>Brainstorm:</label>
                <div className="brainstorm-content">
                  {story.brainstorm.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {story.tags && story.tags.length > 0 && (
          <div className="tags-section">
            <h2>Story Tags</h2>
            <div className="tags-list">
              {story.tags.map(tag => (
                <div key={tag.id} className="tag-item">
                  {tag.thumb_url ? (
                    <img 
                      src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
                      alt={tag.title}
                      className="tag-thumb"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('no-image');
                      }}
                    />
                  ) : (
                    <div className="tag-thumb no-image">
                      <span>{tag.title.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <span className="tag-title">{tag.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="tag-management-section">
        <div className="section-header">
          <h2>AI Tag Management</h2>
          <button 
            className="btn btn-outline-primary"
            onClick={() => setShowTagManagement(!showTagManagement)}
          >
            {showTagManagement ? 'Hide Tag Management' : 'Show Tag Management'}
          </button>
        </div>
        
        {showTagManagement && (
          <div className="tag-management-content">
            <p className="section-description">
              Use the intelligent streaming tag system below to manage your story's tags. 
              The AI will learn from your choices to provide better suggestions with real-time streaming updates.
            </p>
            <StreamingTagSuggestions storyId={id} />
          </div>
        )}
      </div>

      <div className="reasonings-section">
        <div className="section-header">
          <h2>Story Tag Reasonings</h2>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => setShowReasonings(!showReasonings)}
          >
            {showReasonings ? 'Hide Reasonings' : 'Show Reasonings'}
          </button>
        </div>
        
        {showReasonings && (
          <div className="reasonings-content">
            <p className="section-description">
              View and rate the reasoning behind each tag in your story. Your ratings help improve future AI suggestions.
            </p>
            <StoryTagReasoningList storyId={id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryView; 