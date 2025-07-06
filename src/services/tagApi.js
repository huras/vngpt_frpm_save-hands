import api from './api';

export const tagApi = {
        // Get all tags with pagination and search
        getTags: (params = {}) => {
                const { page = 1, perPage = 10, search } = params;
                const queryParams = new URLSearchParams();

                if (page) queryParams.append('page', page);
                if (perPage) queryParams.append('perPage', perPage);
                if (search) queryParams.append('search', search);

                const queryString = queryParams.toString();
                return api.get(`/tags${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific tag by ID
  getTag: (id) => api.get(`/tags/${id}`),

  // Create a new tag
  createTag: (tagData) => api.post('/tags', tagData),

  // Update an existing tag
  updateTag: (id, tagData) => api.put(`/tags/${id}`, tagData),

  // Delete a tag
  deleteTag: (id) => api.delete(`/tags/${id}`),

  // Search tags
  searchTags: (searchTerm, params = {}) => {
    const { page = 1, perPage = 10 } = params;
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.append('page', page);
    if (perPage) queryParams.append('perPage', perPage);
    
    const queryString = queryParams.toString();
    return api.get(`/tags/search/${encodeURIComponent(searchTerm)}${queryString ? `?${queryString}` : ''}`);
  },

  // Get tags for a specific story
  getTagsByStory: (storyId) => api.get(`/stories/${storyId}/tags`),

  // Add tag to story
  addTagToStory: (storyId, tagId) => api.post(`/stories/${storyId}/tags/${tagId}`),

  // Remove tag from story
  removeTagFromStory: (storyId, tagId) => api.delete(`/stories/${storyId}/tags/${tagId}`),

  // Get stories for a specific tag
  getStoriesByTag: (tagId) => api.get(`/tags/${tagId}/stories`)
};