import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storyApi } from '../../services/storyApi';
import StreamingTagSuggestions from '../../components/StreamingTagSuggestions';
import './StoryForm.scss';

const StoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    brainstorm: ''
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      fetchStory();
    }
  }, [id]);

  const fetchStory = async () => {
    try {
      setFetching(true);
      setError(null);
      const response = await storyApi.getStory(id);
      const story = response.data;
      setFormData({
        title: story.title || '',
        brainstorm: story.brainstorm || ''
      });
      setSelectedTags(story.tags || []);
    } catch (err) {
      setError('Failed to load story. Please try again.');
      console.error('Error fetching story:', err);
    } finally {
      setFetching(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const storyData = {
        title: formData.title.trim(),
        brainstorm: formData.brainstorm.trim(),
        tags: selectedTags.map(tag => tag.id)
      };

      if (isEditing) {
        await storyApi.updateStory(id, storyData);
      } else {
        await storyApi.createStory(storyData);
      }

      navigate('/stories');
    } catch (err) {
      setError('Failed to save story. Please try again.');
      console.error('Error saving story:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  if (fetching) {
    return (
      <div className="story-form-container">
        <div className="loading-spinner">Loading story...</div>
      </div>
    );
  }

  return (
    <div className="story-form-container">
      <div className="form-header">
        <h1>{isEditing ? 'Edit Story' : 'Create New Story'}</h1>
        <Link to="/stories" className="btn btn-secondary">
          <i className="fas fa-arrow-left"></i> Back to Stories
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="story-form">
        <div className="form-group">
          <label htmlFor="title">Story Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
            placeholder="Enter your story title..."
            required
          />
          {validationErrors.title && (
            <div className="invalid-feedback">{validationErrors.title}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="brainstorm">Story Brainstorm</label>
          <textarea
            id="brainstorm"
            name="brainstorm"
            value={formData.brainstorm}
            onChange={handleInputChange}
            className="form-control"
            rows="8"
            placeholder="Describe your story idea, plot, characters, themes, or any other details that will help AI understand your story better..."
          />
          <small className="form-text text-muted">
            This helps the AI provide better tag suggestions for your story.
          </small>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> {isEditing ? 'Update Story' : 'Create Story'}
              </>
            )}
          </button>
          <Link to="/stories" className="btn btn-outline-secondary">
            Cancel
          </Link>
        </div>
      </form>

      {isEditing && (
        <div className="tag-management-section">
          <h2>AI Tag Management</h2>
          <p className="section-description">
            Use the intelligent streaming tag system below to manage your story's tags. 
            The AI will learn from your choices to provide better suggestions with real-time streaming updates.
          </p>
          
          <StreamingTagSuggestions storyId={id} />
        </div>
      )}
    </div>
  );
};

export default StoryForm; 