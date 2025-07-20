import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storyApi } from '../../services/storyApi';
import { BACKEND_CONFIG } from '../../config/backend';
import TagImagePopup from '../../components/TagImagePopup';
import './StoryList.scss';

const StoryList = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [storyToDuplicate, setStoryToDuplicate] = useState(null);
  const [duplicating, setDuplicating] = useState(false);

  const navigate = useNavigate();

  const fetchStories = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        perPage,
        ...(search && { search })
      };
      
      const response = await storyApi.getStories(params);
      const { data, pagination } = response.data;
      
      setStories(data);
      setCurrentPage(pagination.currentPage);
      setTotalPages(pagination.totalPages);
      setTotalItems(pagination.totalItems);
    } catch (err) {
      setError('Failed to fetch stories. Please try again.');
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStories(1, searchTerm);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchStories(page, searchTerm);
  };

  const handleDeleteClick = (story) => {
    setStoryToDelete(story);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await storyApi.deleteStory(storyToDelete.id);
      setShowDeleteModal(false);
      setStoryToDelete(null);
      fetchStories(currentPage, searchTerm);
    } catch (err) {
      setError('Failed to delete story. Please try again.');
      console.error('Error deleting story:', err);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setStoryToDelete(null);
  };

  const handleDuplicateClick = (story) => {
    setStoryToDuplicate(story);
    setShowDuplicateModal(true);
  };

  const handleDuplicateConfirm = async () => {
    try {
      setDuplicating(true);
      const response = await storyApi.duplicateStory(storyToDuplicate.id);
      setShowDuplicateModal(false);
      setStoryToDuplicate(null);
      setDuplicating(false);
      
      // Navigate to the new duplicated story
      navigate(`/stories/${response.data.id}`);
    } catch (err) {
      setError('Failed to duplicate story. Please try again.');
      console.error('Error duplicating story:', err);
      setDuplicating(false);
    }
  };

  const handleDuplicateCancel = () => {
    setShowDuplicateModal(false);
    setStoryToDuplicate(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading && stories.length === 0) {
    return (
      <div className="story-list-container">
        <div className="loading-spinner">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="story-list-container">
      <div className="story-list-header">
        <h1>Stories</h1>
        <Link to="/stories/new" className="btn btn-primary">
          <i className="fas fa-plus"></i> New Story
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search stories by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-outline-secondary">
              <i className="fas fa-search"></i> Search
            </button>
            {searchTerm && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  fetchStories(1, '');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="stories-stats">
        <p>Showing {stories.length} of {totalItems} stories</p>
      </div>

      {stories.length === 0 ? (
        <div className="no-stories">
          <p>No stories found.</p>
          <Link to="/stories/new" className="btn btn-primary">
            Create your first story
          </Link>
        </div>
      ) : (
        <div className="stories-grid">
          {stories.map((story) => (
            <div key={story.id} className="story-card">
              <div className="story-card-header">
                <h3 className="story-title">{story.title}</h3>
                <div className="story-actions">
                  <Link to={`/stories/${story.id}`} className="btn btn-sm btn-outline-primary">
                    <i className="fas fa-eye"></i>
                  </Link>
                  <Link to={`/stories/${story.id}/edit`} className="btn btn-sm btn-outline-secondary">
                    <i className="fas fa-edit"></i>
                  </Link>
                  <button
                    onClick={() => handleDuplicateClick(story)}
                    className="btn btn-sm btn-outline-info"
                    title="Duplicate story"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(story)}
                    className="btn btn-sm btn-outline-danger"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="story-content">
                <p className="story-brainstorm">
                  {truncateText(story.brainstorm, 150)}
                </p>
                
                {/* Story Tags */}
                {story.tags && story.tags.length > 0 && (
                  <div className="story-tags">
                    <h6 className="tags-section-title">Applied Tags:</h6>
                    {story.tags.map(tag => (
                      <span key={tag.id} className="story-tag">
                        {tag.thumb_url && (
                          <TagImagePopup tag={tag} position="top">
                            <img 
                              src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)} 
                              alt={tag.title} 
                              className="tag-thumb"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </TagImagePopup>
                        )}
                        <span className="tag-title">{tag.title}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag Suggestions */}
                {story.tagSuggestions && story.tagSuggestions.length > 0 && (
                  <div className="story-tag-suggestions">
                    <h6 className="tags-section-title">Tag Suggestions:</h6>
                    {story.tagSuggestions.map(suggestion => (
                      <span key={suggestion.id} className="story-tag suggestion-tag">
                        {suggestion.tag.thumb_url && (
                          <TagImagePopup tag={suggestion.tag} position="top">
                            <img 
                              src={BACKEND_CONFIG.getImageUrl(suggestion.tag.thumb_url)} 
                              alt={suggestion.tag.title} 
                              className="tag-thumb"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </TagImagePopup>
                        )}
                        <span className="tag-title">{suggestion.tag.title}</span>
                        <span className="suggestion-confidence">
                          ({Math.round(suggestion.confidence * 100)}%)
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="story-meta">
                <span className="story-date">
                  <i className="fas fa-calendar"></i> {formatDate(story.createdAt)}
                </span>
                {story.updatedAt !== story.createdAt && (
                  <span className="story-updated">
                    <i className="fas fa-edit"></i> Updated {formatDate(story.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-container">
          <nav aria-label="Stories pagination">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleDeleteCancel}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete "{storyToDelete?.title}"?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Confirmation Modal */}
      {showDuplicateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Duplicate</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleDuplicateCancel}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to duplicate "{storyToDuplicate?.title}"?</p>
              <p className="text-muted">This will create a new story with the same title and brainstorm content. Tags will not be duplicated.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDuplicateCancel}
                disabled={duplicating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-info"
                onClick={handleDuplicateConfirm}
                disabled={duplicating}
              >
                {duplicating ? 'Duplicating...' : 'Duplicate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryList; 