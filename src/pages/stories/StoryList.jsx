import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storyApi } from '../../services/storyApi';
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
    </div>
  );
};

export default StoryList; 