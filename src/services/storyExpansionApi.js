import api from './api';

export const storyExpansionApi = {
    /**
     * Generate story expansion suggestions for a story
     * @param {number} storyId - The ID of the story
     * @returns {Promise<Object>} Promise resolving to the generated suggestions
     */
    generateStoryExpansion: async (storyId) => {
        try {
            const response = await api.post(`/story-expansion/generate/${storyId}`);
            return response;
        } catch (error) {
            console.error('Error generating story expansion:', error);
            throw error;
        }
    },

    /**
     * Generate a single character suggestion for a story
     * @param {number} storyId - The ID of the story
     * @returns {Promise<Object>} Promise resolving to the generated character suggestion
     */
    generateCharacterSuggestion: async (storyId) => {
        try {
            const response = await api.post(`/story-expansion/characters/generate/${storyId}`);
            return response;
        } catch (error) {
            console.error('Error generating character suggestion:', error);
            throw error;
        }
    },

    /**
     * Get all story expansion suggestions for a story
     * @param {number} storyId - The ID of the story
     * @returns {Promise<Object>} Promise resolving to the suggestions
     */
    getStoryExpansion: async (storyId) => {
        try {
            const response = await api.get(`/story-expansion/${storyId}`);
            return response;
        } catch (error) {
            console.error('Error getting story expansion:', error);
            throw error;
        }
    },

    /**
     * Accept an arc suggestion
     * @param {number} arcId - The ID of the arc suggestion
     * @param {Object} rating - Optional rating data
     * @returns {Promise<Object>} Promise resolving to the accepted arc
     */
    acceptArcSuggestion: async (arcId, rating = {}) => {
        try {
            const response = await api.post(`/story-expansion/arcs/${arcId}/accept`, rating);
            return response;
        } catch (error) {
            console.error('Error accepting arc suggestion:', error);
            throw error;
        }
    },

    /**
     * Accept a character suggestion
     * @param {number} characterId - The ID of the character suggestion
     * @param {Object} rating - Optional rating data
     * @returns {Promise<Object>} Promise resolving to the accepted character
     */
    acceptCharacterSuggestion: async (characterId, rating = {}) => {
        try {
            const response = await api.post(`/story-expansion/characters/${characterId}/accept`, rating);
            return response;
        } catch (error) {
            console.error('Error accepting character suggestion:', error);
            throw error;
        }
    },

    /**
     * Accept a place suggestion
     * @param {number} placeId - The ID of the place suggestion
     * @param {Object} rating - Optional rating data
     * @returns {Promise<Object>} Promise resolving to the accepted place
     */
    acceptPlaceSuggestion: async (placeId, rating = {}) => {
        try {
            const response = await api.post(`/story-expansion/places/${placeId}/accept`, rating);
            return response;
        } catch (error) {
            console.error('Error accepting place suggestion:', error);
            throw error;
        }
    },

    /**
     * Accept an organization suggestion
     * @param {number} organizationId - The ID of the organization suggestion
     * @param {Object} rating - Optional rating data
     * @returns {Promise<Object>} Promise resolving to the accepted organization
     */
    acceptOrganizationSuggestion: async (organizationId, rating = {}) => {
        try {
            const response = await api.post(`/story-expansion/organizations/${organizationId}/accept`, rating);
            return response;
        } catch (error) {
            console.error('Error accepting organization suggestion:', error);
            throw error;
        }
    },

    /**
     * Accept an object suggestion
     * @param {number} objectId - The ID of the object suggestion
     * @param {Object} rating - Optional rating data
     * @returns {Promise<Object>} Promise resolving to the accepted object
     */
    acceptObjectSuggestion: async (objectId, rating = {}) => {
        try {
            const response = await api.post(`/story-expansion/objects/${objectId}/accept`, rating);
            return response;
        } catch (error) {
            console.error('Error accepting object suggestion:', error);
            throw error;
        }
    },

    /**
     * Delete an arc suggestion
     * @param {number} arcId - The ID of the arc suggestion
     * @returns {Promise<Object>} Promise resolving to the deletion result
     */
    deleteArcSuggestion: async (arcId) => {
        try {
            const response = await api.delete(`/story-expansion/arcs/${arcId}`);
            return response;
        } catch (error) {
            console.error('Error deleting arc suggestion:', error);
            throw error;
        }
    },

    /**
     * Delete a character suggestion
     * @param {number} characterId - The ID of the character suggestion
     * @returns {Promise<Object>} Promise resolving to the deletion result
     */
    deleteCharacterSuggestion: async (characterId) => {
        try {
            const response = await api.delete(`/story-expansion/characters/${characterId}`);
            return response;
        } catch (error) {
            console.error('Error deleting character suggestion:', error);
            throw error;
        }
    },

    /**
     * Delete a place suggestion
     * @param {number} placeId - The ID of the place suggestion
     * @returns {Promise<Object>} Promise resolving to the deletion result
     */
    deletePlaceSuggestion: async (placeId) => {
        try {
            const response = await api.delete(`/story-expansion/places/${placeId}`);
            return response;
        } catch (error) {
            console.error('Error deleting place suggestion:', error);
            throw error;
        }
    },

    /**
     * Delete an organization suggestion
     * @param {number} organizationId - The ID of the organization suggestion
     * @returns {Promise<Object>} Promise resolving to the deletion result
     */
    deleteOrganizationSuggestion: async (organizationId) => {
        try {
            const response = await api.delete(`/story-expansion/organizations/${organizationId}`);
            return response;
        } catch (error) {
            console.error('Error deleting organization suggestion:', error);
            throw error;
        }
    },

    /**
     * Delete an object suggestion
     * @param {number} objectId - The ID of the object suggestion
     * @returns {Promise<Object>} Promise resolving to the deletion result
     */
    deleteObjectSuggestion: async (objectId) => {
        try {
            const response = await api.delete(`/story-expansion/objects/${objectId}`);
            return response;
        } catch (error) {
            console.error('Error deleting object suggestion:', error);
            throw error;
        }
    }
}; 