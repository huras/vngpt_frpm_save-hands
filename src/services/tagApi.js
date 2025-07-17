import api from './api';

export const tagApi = {
        // Get all tags with pagination and search
        getTags: (params) => api.get('/tags', { params }),

        // Get a specific tag by ID
        getTag: (id) => api.get(`/tags/${id}`),

        // Create a new tag
        createTag: (tagData) => api.post('/tags', tagData),

        // Update an existing tag
        updateTag: (id, data) => api.put(`/tags/${id}`, data),

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
        getStoriesByTag: (id) => api.get(`/tags/${id}/stories`).then(res => res.data),

        // Get tag recommendations based on a tag
        getTagRecommendations: (tagId, limit = 4) => api.get(`/tags/${tagId}/recommendations`, { 
            params: { limit } 
        }).then(res => res.data),

        // Get AI-powered recommendations based on multiple tags
        getAIRecommendations: (tagIds, limit = 4, storyBrainstorm = null, forceNew = false, focusedMode = false, focusTagId = null) => api.post('/tags/ai-recommendations', {
            tagIds,
            limit,
            storyBrainstorm,
            forceNew,
            focusedMode,
            focusTagId
        }).then(res => res.data),

        // Persist a single AI-suggested tag
        persistAISuggestedTag: (virtualTagData) => api.post('/tags/persist-ai-suggested', {
            virtualTagData
        }).then(res => res.data),

        // Persist multiple AI-suggested tags
        batchPersistAISuggestedTags: (virtualTagsData) => api.post('/tags/batch-persist-ai-suggested', {
            virtualTagsData
        }).then(res => res.data)
};