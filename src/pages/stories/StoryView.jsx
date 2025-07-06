import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storyApi } from '../../services/storyApi';
import { BACKEND_CONFIG } from '../../config/backend';
import './StoryView.scss';

const StoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (error || !story) {
    return (
      <div className="story-view-container">
        <div className="error-message">
          <h2>Story Not Found</h2>
          <p>{error || 'The story you are looking for does not exist.'}</p>
          <Link to="/stories" className="btn btn-primary">
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="story-view-container">
      <div className="story-view-header">
        <div className="story-navigation">
          <Link to="/stories" className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left"></i> Back to Stories
          </Link>
        </div>
        
        <div className="story-actions">
          <Link to={`/stories/${id}/edit`} className="btn btn-primary">
            <i className="fas fa-edit"></i> Edit Story
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <i className="fas fa-trash"></i> Delete Story
          </button>
        </div>
      </div>

      <div className="story-content">
        <div className="story-header">
          <h1 className="story-title">{story.title}</h1>
          <div className="story-meta">
            <div className="story-dates">
              <span className="story-created">
                <i className="fas fa-calendar-plus"></i> Created: {formatDate(story.createdAt)}
              </span>
              {story.updatedAt !== story.createdAt && (
                <span className="story-updated">
                  <i className="fas fa-calendar-check"></i> Updated: {formatDate(story.updatedAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="story-body">
          {story.brainstorm ? (
            <div className="story-brainstorm">
              <h3>Brainstorm</h3>
              <div className="brainstorm-content">
                {story.brainstorm.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-brainstorm">
              <p className="text-muted">No brainstorm content available.</p>
            </div>
          )}

          {/* Story Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="story-tags-section">
              <h3>Tags</h3>
              <div className="story-tags">
                {story.tags.map(tag => (
                  <div key={tag.id} className="story-tag">
                    {tag.thumb_url && (
                      <img 
                        src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
                        alt={tag.title} 
                        className="tag-thumb"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="tag-info">
                      <span className="tag-title">{tag.title}</span>
                      {tag.short_description && (
                        <span className="tag-description">{tag.short_description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="story-footer">
        <div className="story-actions-bottom">
          <Link to={`/stories/${id}/edit`} className="btn btn-primary">
            <i className="fas fa-edit"></i> Edit Story
          </Link>
          <Link to="/stories" className="btn btn-outline-secondary">
            <i className="fas fa-list"></i> All Stories
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StoryView; 