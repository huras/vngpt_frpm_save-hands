import api from './api';

export const intelligentTagApi = {
  // Get suggestions for a story
  getSuggestions: (storyId, status = 'pending') => 
    api.get(`/intelligent-tags/suggestions/${storyId}?status=${status}`),

  // Generate new suggestions
  generateSuggestions: (storyId, limit = 10) => 
    api.post(`/intelligent-tags/suggestions/${storyId}/generate`, { limit }),

  // Accept a suggestion
  acceptSuggestion: (suggestionId, userExplanation = null) => 
    api.post(`/intelligent-tags/suggestions/${suggestionId}/accept`, { userExplanation }),

  // Reject a suggestion
  rejectSuggestion: (suggestionId, reason = null) => 
    api.post(`/intelligent-tags/suggestions/${suggestionId}/reject`, { reason }),

  // Add tag manually with reasoning
  addTagManually: (storyId, tagId, reasoning, userExplanation = null) => 
    api.post(`/intelligent-tags/stories/${storyId}/tags`, { 
      tagId, 
      reasoning, 
      userExplanation 
    }),

  // Get reasoning for story tags
  getStoryReasonings: (storyId) => 
    api.get(`/intelligent-tags/stories/${storyId}/reasonings`),

  // Search tags manually
  searchTags: (query, limit = 20) => 
    api.get(`/intelligent-tags/search?query=${encodeURIComponent(query)}&limit=${limit}`),

  // Re-evaluate existing suggestions
  reevaluateSuggestions: (storyId) => 
    api.post(`/intelligent-tags/suggestions/${storyId}/reevaluate`)
}; 