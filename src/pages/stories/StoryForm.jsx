import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storyApi } from '../../services/storyApi';
import IntelligentTagSelector from '../../components/IntelligentTagSelector';
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
        brainstorm: formData.brainstorm.trim()
      };

      let storyId = id;
      if (isEditing) {
        await storyApi.updateStory(id, storyData);
      } else {
        const res = await storyApi.createStory(storyData);
        storyId = res.data.id;
      }

      // Navigate to the story view where the intelligent tag selector will handle tag management
      navigate(`/stories/${storyId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save story. Please try again.');
      console.error('Error saving story:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/stories');
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
      <div className="story-form-header">
        <h1>{isEditing ? 'Edit Story' : 'Create New Story'}</h1>
        <Link to="/stories" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left"></i> Back to Stories
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="story-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter story title..."
            maxLength={255}
            required
          />
          {validationErrors.title && (
            <div className="invalid-feedback">
              {validationErrors.title}
            </div>
          )}
          <small className="form-text text-muted">
            {formData.title.length}/255 characters
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="brainstorm" className="form-label">
            Brainstorm
          </label>
          <textarea
            id="brainstorm"
            name="brainstorm"
            className="form-control"
            value={formData.brainstorm}
            onChange={handleInputChange}
            placeholder="Write your story brainstorm, ideas, notes, or content here..."
            rows={12}
            style={{ resize: 'vertical' }}
          />
          <small className="form-text text-muted">
            Use this space to brainstorm ideas, write notes, or develop your story content.
            This will help the AI generate better tag suggestions.
          </small>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Story' : 'Create Story')}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>

      {isEditing && (
        <div className="tag-management-section">
          <h2>Tag Management</h2>
          <p className="section-description">
            Use the intelligent tag system below to manage your story's tags. 
            The AI will learn from your choices to provide better suggestions.
          </p>
          <IntelligentTagSelector
            storyId={id}
            onTagsChange={setSelectedTags}
            disabled={loading}
            title="Story Tag Management"
          />
        </div>
      )}
    </div>
  );
};

export default StoryForm; 