import api from './api';

export const intelligentTagApi = {
  // Get suggestions for a story
  getSuggestions: (storyId, status = 'pending') => 
    api.get(`/intelligent-tags/suggestions/${storyId}?status=${status}`),

  // Generate new suggestions
  generateSuggestions: (storyId, limit = 10) => 
    api.post(`/intelligent-tags/suggestions/${storyId}/generate`, { limit }),

  // Generate suggestions with streaming (iterative)
  generateSuggestionsStreaming: (storyId, limit = 10, onSuggestion, onComplete, onError) => {
    // Create a fetch request with streaming - use the correct API URL
    fetch(`http://localhost:3056/api/intelligent-tags/suggestions/${storyId}/generate-streaming`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      function readStream() {
        return reader.read().then(({ done, value }) => {
          if (done) {
            return;
          }
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                switch (data.type) {
                  case 'connected':
                    console.log('Streaming connection established');
                    break;
                  case 'suggestion':
                    if (onSuggestion) {
                      onSuggestion(data.data);
                    }
                    break;
                  case 'complete':
                    if (onComplete) {
                      onComplete(data.data);
                    }
                    return;
                  case 'error':
                    if (onError) {
                      onError(data.error);
                    }
                    return;
                  default:
                    console.log('Unknown event type:', data.type);
                }
              } catch (error) {
                console.error('Error parsing streaming data:', error);
              }
            }
          });
          
          return readStream();
        });
      }
      
      return readStream();
    })
    .catch(error => {
      console.error('Streaming request error:', error);
      if (onError) {
        onError(error.message);
      }
    });
  },

  // Accept a suggestion
  acceptSuggestion: (suggestionId, userExplanation = null) => 
    api.post(`/intelligent-tags/suggestions/${suggestionId}/accept`, { userExplanation }),

  // Reject a suggestion
  rejectSuggestion: (suggestionId, reason = null) => 
    api.post(`/intelligent-tags/suggestions/${suggestionId}/reject`, { reason }),

  // Regenerate a single suggestion
  regenerateSuggestion: (suggestionId, userFeedback = null) => 
    api.post(`/intelligent-tags/suggestions/${suggestionId}/regenerate`, { userFeedback }),

  // Get suggestion history
  getSuggestionHistory: (storyId, tagId) => 
    api.get(`/intelligent-tags/suggestions/${storyId}/${tagId}/history`),

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

  // Clear pending suggestions
  clearPendingSuggestions: (storyId) => 
    api.delete(`/intelligent-tags/suggestions/${storyId}/clear-pending`),

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
    }),

  // Reject an accepted suggestion
  rejectAcceptedSuggestion: (reasoningId, reason = null) => 
    api.post(`/intelligent-tags/reasonings/${reasoningId}/reject`, { reason }),

  // Rate a reasoning directly
  rateReasoning: (reasoningId, rating, comment = null) => 
    api.post(`/intelligent-tags/reasonings/${reasoningId}/rate`, { 
      rating, 
      comment 
    }),

  // Update a reasoning
  updateReasoning: (reasoningId, reasoning) => 
    api.put(`/intelligent-tags/reasonings/${reasoningId}`, { reasoning }),

  // Pitch Management endpoints
  generatePitches: (suggestionId, count = 3) => 
    api.post(`/pitches/suggestions/${suggestionId}/generate`, { count }),

  getPitches: (suggestionId) => 
    api.get(`/pitches/suggestions/${suggestionId}`),

  deletePitch: (pitchId) => 
    api.delete(`/pitches/${pitchId}`),

  deleteAllPitches: (suggestionId) => 
    api.delete(`/pitches/suggestions/${suggestionId}`),

  ratePitch: (pitchId, rating, comment = null) => 
    api.post(`/pitches/${pitchId}/rate`, { rating, comment }),

  togglePitchFavorite: (pitchId) => 
    api.post(`/pitches/${pitchId}/favorite`),

  // Additional pitch endpoints
  regeneratePitch: (pitchId, userFeedback = null) => 
    api.post(`/pitches/${pitchId}/regenerate`, { userFeedback }),

  getPitchStats: (suggestionId = null) => {
    const params = suggestionId ? `?suggestionId=${suggestionId}` : '';
    return api.get(`/pitches/stats${params}`);
  },

  getTopRatedPitches: (limit = 10) => 
    api.get(`/pitches/top-rated?limit=${limit}`),

  getFavoritePitches: (limit = 10) => 
    api.get(`/pitches/favorites?limit=${limit}`),

  // TagSuggestionDirective endpoints
  getDirectives: (suggestionId) => 
    api.get(`/intelligent-tags/directives/${suggestionId}`),

  getDirective: (suggestionId, directiveId) => 
    api.get(`/intelligent-tags/directives/${suggestionId}/${directiveId}`),

  getDirectivesByIds: (directiveIds) => 
    api.post('/intelligent-tags/directives/by-ids', { directiveIds }),

  generateDirective: (suggestionId) => 
    api.post(`/intelligent-tags/directives/${suggestionId}/generate`),

  regenerateDirective: (suggestionId, directiveId) => 
    api.post(`/intelligent-tags/directives/${suggestionId}/${directiveId}/regenerate`),

  updateDirective: (suggestionId, directiveId, directive, directive_aim) => 
    api.put(`/intelligent-tags/directives/${suggestionId}/${directiveId}`, { directive, directive_aim }),

  deleteDirective: (suggestionId, directiveId) => 
    api.delete(`/intelligent-tags/directives/${suggestionId}/${directiveId}`)
}; 