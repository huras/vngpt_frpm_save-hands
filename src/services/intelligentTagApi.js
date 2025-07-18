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

  // Check if re-evaluation is needed
  checkReevaluationStatus: (storyId) => 
    api.get(`/intelligent-tags/suggestions/${storyId}/reevaluate-status`),

  // Re-evaluate existing suggestions
  reevaluateSuggestions: (storyId) => 
    api.post(`/intelligent-tags/suggestions/${storyId}/reevaluate`),

  // Get rejection statistics
  getRejectionStatistics: (storyId = null) => {
    const params = storyId ? `?storyId=${storyId}` : '';
    return api.get(`/intelligent-tags/statistics${params}`);
  },

  // AI Commentary endpoints
  getCommentary: (storyId, tagId) => 
    api.get(`/intelligent-tags/commentaries/${storyId}/${tagId}`),

  getCommentaryHistory: (storyId, tagId) => 
    api.get(`/intelligent-tags/commentaries/${storyId}/${tagId}/history`),

  updateCommentary: (storyId, tagId, commentary, userFeedback = null) => 
    api.put(`/intelligent-tags/commentaries/${storyId}/${tagId}`, { commentary, userFeedback }),

  createCommentary: (storyId, tagId, commentary, userFeedback = null, triggerType = 'user_feedback') => 
    api.post(`/intelligent-tags/commentaries/${storyId}/${tagId}`, { commentary, userFeedback, triggerType }),

  getStoryCommentaries: (storyId) => 
    api.get(`/intelligent-tags/commentaries/${storyId}`),

  analyzeCommentary: (commentary) => 
    api.post(`/intelligent-tags/commentaries/analyze`, { commentary }),

  getCommentaryStats: (storyId) => 
    api.get(`/intelligent-tags/commentaries/${storyId}/stats`),

  // Generate AI directive for tag
  generateDirective: (storyId, tagId, storyTitle = null, storyBrainstorm = null) => 
    api.post('/intelligent-tags/generate-directive', { 
      storyId, 
      tagId, 
      storyTitle, 
      storyBrainstorm 
    }),

  // Generate AI explanation for tag (legacy)
  generateExplanation: (storyId, tagId, storyTitle = null, storyBrainstorm = null) => 
    api.post('/intelligent-tags/generate-explanation', { 
      storyId, 
      tagId, 
      storyTitle, 
      storyBrainstorm 
    }),

  // Rate a tag suggestion
  rateSuggestion: (suggestionId, rating, comment = null) => 
    api.post(`/intelligent-tags/suggestions/${suggestionId}/rate`, { 
      rating, 
      comment 
    })
}; 