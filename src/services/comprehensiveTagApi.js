import api from './api';

// Base URL for API calls
const API_BASE_URL = 'http://localhost:3056/api';

export const comprehensiveTagApi = {
  // Generate comprehensive tags for a story
  generateComprehensiveTags: (storyTitle, storyBrainstorm, limit = 10) => 
    api.post('/comprehensive-tags/generate', { 
      storyTitle, 
      storyBrainstorm, 
      limit 
    }),

  // Generate comprehensive tags with streaming updates
  generateComprehensiveTagsStreaming: (storyTitle, storyBrainstorm, limit = 10, onUpdate, onComplete, onError, storyId = null) => {
    fetch(`${API_BASE_URL}/comprehensive-tags/generate-streaming`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storyTitle, storyBrainstorm, limit, storyId })
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
            if (onComplete) onComplete();
            return;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());
          
          lines.forEach(line => {
            try {
              const update = JSON.parse(line);
              if (onUpdate) onUpdate(update);
            } catch (error) {
              console.error('Error parsing streaming update:', error);
            }
          });
          
          return readStream();
        });
      }
      
      return readStream();
    })
    .catch(error => {
      console.error('Streaming error:', error);
      if (onError) onError(error);
    });
  },

  // Save comprehensive results to database
  saveComprehensiveResults: (storyId, results) => 
    api.post(`/comprehensive-tags/save/${storyId}`, { results }),

  // Get comprehensive results for a specific story
  getComprehensiveResults: (storyId) => 
    api.get(`/comprehensive-tags/story/${storyId}`),

  // Get related tags for a specific tag
  getTagRelationships: (tagId, limit = 10) => 
    api.get(`/comprehensive-tags/relationships/${tagId}?limit=${limit}`),

  // Get world-building effects for a specific tag
  getWorldBuildingEffects: (tagId) => 
    api.get(`/comprehensive-tags/world-building/${tagId}`),

  // Create a new tag relationship
  createTagRelationship: (sourceTagId, relatedTagId, relationshipType, confidence, reasoning) => 
    api.post('/comprehensive-tags/relationships', {
      sourceTagId,
      relatedTagId,
      relationshipType,
      confidence,
      reasoning
    }),

  // Create a new world-building effect
  createWorldBuildingEffect: (tagId, effectType, title, description, impactLevel, storyElements, examples, conflicts, synergies, confidence) => 
    api.post('/comprehensive-tags/world-building', {
      tagId,
      effectType,
      title,
      description,
      impactLevel,
      storyElements,
      examples,
      conflicts,
      synergies,
      confidence
    }),

  // Accept a tag suggestion
  acceptTagSuggestion: (suggestionId, userRating = null, ratingComment = null) => 
    api.post(`/comprehensive-tags/suggestions/${suggestionId}/accept`, {
      userRating,
      ratingComment
    }),

  // Reject a tag suggestion
  rejectTagSuggestion: (suggestionId, rejectionReason = null, userRating = null, ratingComment = null) => 
    api.post(`/comprehensive-tags/suggestions/${suggestionId}/reject`, {
      rejectionReason,
      userRating,
      ratingComment
    }),

  // Rate a tag suggestion
  rateTagSuggestion: (suggestionId, userRating, ratingComment = null) => 
    api.post(`/comprehensive-tags/suggestions/${suggestionId}/rate`, {
      userRating,
      ratingComment
    }),

  // Clear all comprehensive tag suggestions for a story
  clearComprehensiveSuggestions: (storyId) => 
    api.delete(`/comprehensive-tags/suggestions/${storyId}/clear`),

  // Reset a tag suggestion back to pending status
  resetTagSuggestion: (suggestionId) => 
    api.post(`/comprehensive-tags/suggestions/${suggestionId}/reset`)
}; 