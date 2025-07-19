import api from './api';

export const storyApi = {
        // Get all stories with pagination and search
        getStories: (params = {}) => {
                const { page = 1, perPage = 10, search } = params;
                const queryParams = new URLSearchParams();

                if (page) queryParams.append('page', page);
                if (perPage) queryParams.append('perPage', perPage);
                if (search) queryParams.append('search', search);

                const queryString = queryParams.toString();
                return api.get(`/stories${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific story by ID
  getStory: (id) => api.get(`/stories/${id}`),

  // Create a new story
  createStory: (storyData) => api.post('/stories', storyData),

  // Update an existing story
  updateStory: (id, storyData) => api.put(`/stories/${id}`, storyData),

  // Delete a story
  deleteStory: (id) => api.delete(`/stories/${id}`),

  // Duplicate a story
  duplicateStory: (id) => api.post(`/stories/${id}/duplicate`),

  // Search stories
  searchStories: (searchTerm, params = {}) => {
    const { page = 1, perPage = 10 } = params;
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.append('page', page);
    if (perPage) queryParams.append('perPage', perPage);
    
    const queryString = queryParams.toString();
    return api.get(`/stories/search/${encodeURIComponent(searchTerm)}${queryString ? `?${queryString}` : ''}`);
  },

  // Add tag to a story
  addTagToStory: (storyId, tagId) => api.post(`/stories/${storyId}/tags/${tagId}`),

  // Remove tag from a story
  removeTagFromStory: (storyId, tagId) => api.delete(`/stories/${storyId}/tags/${tagId}`)
};