import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storyApi } from '../../services/storyApi';
import { comprehensiveTagApi } from '../../services/comprehensiveTagApi';
import ComprehensiveTagResults from '../../components/ComprehensiveTagResults';
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
  const [comprehensiveResults, setComprehensiveResults] = useState(null);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [showComprehensiveResults, setShowComprehensiveResults] = useState(false);
  const [streamingData, setStreamingData] = useState(null);
  const [currentStoryTags, setCurrentStoryTags] = useState([]);
  const [loadingComprehensiveResults, setLoadingComprehensiveResults] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchStory();
      fetchComprehensiveResults();
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
      setCurrentStoryTags(story.tags || []);
    } catch (err) {
      setError('Failed to load story. Please try again.');
      console.error('Error fetching story:', err);
    } finally {
      setFetching(false);
    }
  };

  const fetchComprehensiveResults = async () => {
    try {
      setLoadingComprehensiveResults(true);
      setError(null);
      
      const response = await comprehensiveTagApi.getComprehensiveResults(id);
      
      if (response.data.success && response.data.data) {
        setComprehensiveResults(response.data.data);
        setShowComprehensiveResults(true);
        console.log('Loaded existing comprehensive results:', response.data.data);
      }
    } catch (err) {
      // Don't show error for this - it's optional data
      console.log('No existing comprehensive results found for this story');
    } finally {
      setLoadingComprehensiveResults(false);
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

  const handleGenerateTags = async () => {
    if (!formData.title.trim() || !formData.brainstorm.trim()) {
      setError('Please provide both title and brainstorm before generating tags.');
      return;
    }

    try {
      setGeneratingTags(true);
      setError(null);
      // Don't clear existing results - we'll add new ones on top
      // setComprehensiveResults(null);
      setStreamingData(null);
      setShowComprehensiveResults(true);

      console.log('Starting streaming comprehensive tag generation...');
      
      comprehensiveTagApi.generateComprehensiveTagsStreaming(
        formData.title.trim(),
        formData.brainstorm.trim(),
        15, // Increased limit for better category coverage
        // onUpdate callback - handle each streaming update
        (update) => {
          console.log('Received streaming update:', update);
          setStreamingData(update);
          
          // If we have data, merge with existing results instead of replacing
          if (update.data) {
            setComprehensiveResults(prevResults => {
              if (!prevResults) {
                return update.data;
              }
              
              // Merge new results with existing ones, avoiding duplicates
              const existingTagIds = new Set(prevResults.relevantTags?.map(tag => tag.id) || []);
              const newRelevantTags = (update.data.relevantTags || []).filter(tag => !existingTagIds.has(tag.id));
              
              const mergedResults = {
                ...prevResults,
                relevantTags: [
                  ...newRelevantTags, // New tags first
                  ...(prevResults.relevantTags || [])
                ],
                relatedTagsMap: {
                  ...(prevResults.relatedTagsMap || {}),
                  ...(update.data.relatedTagsMap || {})
                },
                worldBuildingEffects: [
                  ...(update.data.worldBuildingEffects || []),
                  ...(prevResults.worldBuildingEffects || [])
                ]
              };
              
              console.log(`Added ${newRelevantTags.length} new tags to existing ${prevResults.relevantTags?.length || 0} tags`);
              return mergedResults;
            });
          }
          
          // If completed, finish the process
          if (update.completed) {
            console.log('Streaming completed successfully');
            setGeneratingTags(false);
            setStreamingData(null);
          }
        },
        // onComplete callback
        () => {
          console.log('Streaming completed');
          setGeneratingTags(false);
          setStreamingData(null);
        },
        // onError callback
        (error) => {
          console.error('Streaming error:', error);
          setError('Failed to generate tags. Please try again.');
          setGeneratingTags(false);
          setStreamingData(null);
        },
        // storyId for auto-saving (only if editing)
        isEditing ? id : null
      );
    } catch (err) {
      console.error('Error starting streaming tag generation:', err);
      setError('Failed to start tag generation. Please try again.');
      setGeneratingTags(false);
      setStreamingData(null);
    }
  };

  const handleTagSelection = (tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleClearGeneratedTags = async () => {
    // Show confirmation dialog
    const confirmed = await showClearConfirmation();
    if (!confirmed) return;

    try {
      // Only call API if we're editing (have a story ID)
      if (isEditing && id) {
        const response = await comprehensiveTagApi.clearComprehensiveSuggestions(id);
        if (response.data?.success) {
          console.log(`Cleared ${response.data.clearedCount} comprehensive tag suggestions`);
          alert(`Successfully cleared ${response.data.clearedCount} comprehensive tag suggestions from the database.`);
        } else {
          console.error('Failed to clear suggestions:', response.data);
          alert('Failed to clear suggestions from database. Please try again.');
          return;
        }
      }

      // Clear frontend state
      setComprehensiveResults(null);
      setShowComprehensiveResults(false);
      setStreamingData(null);
    } catch (error) {
      console.error('Error clearing comprehensive tag suggestions:', error);
      alert('Error clearing suggestions. Please try again.');
    }
  };

  const showClearConfirmation = () => {
    return new Promise((resolve) => {
      // Check if SweetAlert is available
      if (typeof window !== 'undefined' && window.Swal) {
        window.Swal.fire({
          title: 'Clear All Generated Tags?',
          text: isEditing && id 
            ? 'This will permanently delete all comprehensive tag suggestions from the database. This action cannot be undone.'
            : 'This will clear all generated tags from the current session.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Yes, clear them!',
          cancelButtonText: 'Cancel',
          reverseButtons: true
        }).then((result) => {
          resolve(result.isConfirmed);
        });
      } else {
        // Fallback to browser confirm if SweetAlert is not available
        const message = isEditing && id 
          ? 'This will permanently delete all comprehensive tag suggestions from the database. This action cannot be undone. Are you sure?'
          : 'This will clear all generated tags from the current session. Are you sure?';
        const confirmed = window.confirm(message);
        resolve(confirmed);
      }
    });
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
          
          {formData.title.trim() && formData.brainstorm.trim() && (
            <button 
              type="button"
              onClick={handleGenerateTags}
              className="btn btn-success"
              disabled={generatingTags}
            >
              {generatingTags ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Generating Tags...
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i> {comprehensiveResults ? 'Generate More Tags' : 'Generate Comprehensive Tags'}
                </>
              )}
            </button>
          )}
          
          {comprehensiveResults && !generatingTags && (
            <button 
              type="button"
              onClick={handleClearGeneratedTags}
              className="btn btn-outline-danger"
            >
              <i className="fas fa-trash"></i> {isEditing && id ? 'Clear All Generated Tags (DB)' : 'Clear All Generated Tags'}
            </button>
          )}
          
          <Link to="/stories" className="btn btn-outline-secondary">
            Cancel
          </Link>
        </div>
      </form>

      {/* Comprehensive Tag Generation Results */}
      {(showComprehensiveResults || generatingTags || loadingComprehensiveResults || currentStoryTags.length > 0) && (
        <div className="comprehensive-tag-section">
          <ComprehensiveTagResults
            results={comprehensiveResults}
            isGenerating={generatingTags}
            streamingData={streamingData}
            storyId={isEditing ? id : null}
            currentStoryTags={currentStoryTags}
            selectedTags={selectedTags}
            onTagSelection={handleTagSelection}
            isLoading={loadingComprehensiveResults}
            storyTitle={formData.title}
            storyBrainstorm={formData.brainstorm}
          />
        </div>
      )}
    </div>
  );
};

export default StoryForm; 