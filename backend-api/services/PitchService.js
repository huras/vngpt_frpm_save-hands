const { Story, Tag, TagSuggestion, TagSuggestionPitch, StoryTagReasoning } = require('../models');
const AIService = require('./AIService');

class PitchService {
    constructor() {
        this.aiService = new AIService();
    }

    /**
     * Generate pitches for a tag suggestion
     */
    async generatePitches(suggestionId, count = 3) {
        try {
            const suggestion = await TagSuggestion.findByPk(suggestionId, {
                include: [
                    { model: Story, as: 'story' },
                    { model: Tag, as: 'tag' }
                ]
            });

            if (!suggestion) {
                throw new Error('Tag suggestion not found');
            }

            // Get story context for pitch generation
            const story = await Story.findByPk(suggestion.storyId, {
                include: [
                    { model: Tag, as: 'tags' },
                    { 
                        model: StoryTagReasoning, 
                        as: 'tagReasonings',
                        include: [{ model: Tag, as: 'tag' }]
                    }
                ]
            });

            // Generate pitches using AI
            const pitches = await this.aiService.generatePitches(
                suggestion,
                story,
                count
            );

            // Save pitches to database
            const savedPitches = [];
            for (const pitchData of pitches) {
                const pitch = await TagSuggestionPitch.create({
                    tagSuggestionId: suggestionId,
                    pitch: pitchData.pitch,
                    pitchType: pitchData.type,
                    confidence: pitchData.confidence,
                    generationContext: JSON.stringify({
                        storyTitle: story.title,
                        storyBrainstorm: story.brainstorm,
                        currentTags: story.tags.map(tag => tag.title),
                        suggestionReasoning: suggestion.reasoning,
                        tagTitle: suggestion.tag.title
                    })
                });
                savedPitches.push(pitch);
            }

            return {
                success: true,
                pitches: savedPitches,
                message: `Generated ${savedPitches.length} pitches`
            };
        } catch (error) {
            console.error('Error generating pitches:', error);
            throw error;
        }
    }

    /**
     * Get pitches for a tag suggestion
     */
    async getPitches(suggestionId) {
        try {
            const pitches = await TagSuggestionPitch.findAll({
                where: { tagSuggestionId: suggestionId },
                order: [['createdAt', 'DESC']]
            });

            return {
                success: true,
                pitches: pitches
            };
        } catch (error) {
            console.error('Error getting pitches:', error);
            throw error;
        }
    }

    /**
     * Delete a pitch
     */
    async deletePitch(pitchId) {
        try {
            const pitch = await TagSuggestionPitch.findByPk(pitchId);
            if (!pitch) {
                throw new Error('Pitch not found');
            }

            await pitch.destroy();

            return {
                success: true,
                message: 'Pitch deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting pitch:', error);
            throw error;
        }
    }

    /**
     * Delete all pitches for a suggestion
     */
    async deleteAllPitches(suggestionId) {
        try {
            const deletedCount = await TagSuggestionPitch.destroy({
                where: { tagSuggestionId: suggestionId }
            });

            return {
                success: true,
                message: `Deleted ${deletedCount} pitches`,
                deletedCount: deletedCount
            };
        } catch (error) {
            console.error('Error deleting all pitches:', error);
            throw error;
        }
    }

    /**
     * Rate a pitch
     */
    async ratePitch(pitchId, rating, comment = null) {
        try {
            const pitch = await TagSuggestionPitch.findByPk(pitchId);
            if (!pitch) {
                throw new Error('Pitch not found');
            }

            // Validate rating
            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            // Update the pitch with rating
            await pitch.update({
                userRating: rating,
                ratingComment: comment,
                ratedAt: new Date()
            });

            return {
                success: true,
                pitch: pitch
            };
        } catch (error) {
            console.error('Error rating pitch:', error);
            throw error;
        }
    }

    /**
     * Toggle favorite status for a pitch
     */
    async togglePitchFavorite(pitchId) {
        try {
            const pitch = await TagSuggestionPitch.findByPk(pitchId);
            if (!pitch) {
                throw new Error('Pitch not found');
            }

            // Toggle the favorite status
            await pitch.update({
                isFavorite: !pitch.isFavorite
            });

            return {
                success: true,
                pitch: pitch
            };
        } catch (error) {
            console.error('Error toggling pitch favorite:', error);
            throw error;
        }
    }

    /**
     * Get pitch statistics for analytics
     */
    async getPitchStats(suggestionId = null) {
        try {
            const whereClause = suggestionId ? { tagSuggestionId: suggestionId } : {};
            
            const pitches = await TagSuggestionPitch.findAll({
                where: whereClause,
                include: [
                    { 
                        model: TagSuggestion, 
                        as: 'tagSuggestion',
                        include: [
                            { model: Tag, as: 'tag' },
                            { model: Story, as: 'story' }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const stats = {
                totalPitches: pitches.length,
                ratedPitches: pitches.filter(p => p.userRating).length,
                favoritePitches: pitches.filter(p => p.isFavorite).length,
                averageRating: 0,
                typeDistribution: {},
                recentPitches: pitches.slice(0, 10).map(p => ({
                    id: p.id,
                    pitch: p.pitch.substring(0, 100) + '...',
                    type: p.pitchType,
                    rating: p.userRating,
                    isFavorite: p.isFavorite,
                    createdAt: p.createdAt,
                    tagTitle: p.tagSuggestion?.tag?.title,
                    storyTitle: p.tagSuggestion?.story?.title
                }))
            };

            // Calculate average rating
            const ratedPitches = pitches.filter(p => p.userRating);
            if (ratedPitches.length > 0) {
                const totalRating = ratedPitches.reduce((sum, p) => sum + p.userRating, 0);
                stats.averageRating = (totalRating / ratedPitches.length).toFixed(1);
            }

            // Calculate type distribution
            pitches.forEach(pitch => {
                const type = pitch.pitchType;
                stats.typeDistribution[type] = (stats.typeDistribution[type] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error getting pitch stats:', error);
            throw error;
        }
    }

    /**
     * Get top rated pitches
     */
    async getTopRatedPitches(limit = 10) {
        try {
            const pitches = await TagSuggestionPitch.findAll({
                where: {
                    userRating: {
                        [require('sequelize').Op.gte]: 4
                    }
                },
                include: [
                    { 
                        model: TagSuggestion, 
                        as: 'tagSuggestion',
                        include: [
                            { model: Tag, as: 'tag' },
                            { model: Story, as: 'story' }
                        ]
                    }
                ],
                order: [['userRating', 'DESC'], ['createdAt', 'DESC']],
                limit
            });

            return {
                success: true,
                pitches: pitches
            };
        } catch (error) {
            console.error('Error getting top rated pitches:', error);
            throw error;
        }
    }

    /**
     * Get favorite pitches
     */
    async getFavoritePitches(limit = 10) {
        try {
            const pitches = await TagSuggestionPitch.findAll({
                where: { isFavorite: true },
                include: [
                    { 
                        model: TagSuggestion, 
                        as: 'tagSuggestion',
                        include: [
                            { model: Tag, as: 'tag' },
                            { model: Story, as: 'story' }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit
            });

            return {
                success: true,
                pitches: pitches
            };
        } catch (error) {
            console.error('Error getting favorite pitches:', error);
            throw error;
        }
    }

    /**
     * Regenerate a specific pitch with new AI reasoning
     */
    async regeneratePitch(pitchId, userFeedback = null) {
        try {
            const pitch = await TagSuggestionPitch.findByPk(pitchId, {
                include: [
                    { 
                        model: TagSuggestion, 
                        as: 'tagSuggestion',
                        include: [
                            { model: Story, as: 'story' },
                            { model: Tag, as: 'tag' }
                        ]
                    }
                ]
            });

            if (!pitch) {
                throw new Error('Pitch not found');
            }

            // Get story context for regeneration
            const story = await Story.findByPk(pitch.tagSuggestion.storyId, {
                include: [
                    { model: Tag, as: 'tags' },
                    { 
                        model: StoryTagReasoning, 
                        as: 'tagReasonings',
                        include: [{ model: Tag, as: 'tag' }]
                    }
                ]
            });

            // Generate new pitch using AI with user feedback
            const newPitchData = await this.aiService.generatePitches(
                pitch.tagSuggestion,
                story,
                1
            );

            if (newPitchData.length === 0) {
                throw new Error('Failed to generate new pitch');
            }

            // Update the existing pitch
            await pitch.update({
                pitch: newPitchData[0].pitch,
                pitchType: newPitchData[0].type,
                confidence: newPitchData[0].confidence,
                userRating: null, // Reset rating since it's a new pitch
                ratingComment: null,
                ratedAt: null,
                generationContext: JSON.stringify({
                    storyTitle: story.title,
                    storyBrainstorm: story.brainstorm,
                    currentTags: story.tags.map(tag => tag.title),
                    suggestionReasoning: pitch.tagSuggestion.reasoning,
                    tagTitle: pitch.tagSuggestion.tag.title,
                    regenerationFeedback: userFeedback
                })
            });

            return {
                success: true,
                pitch: pitch,
                message: 'Pitch regenerated successfully'
            };
        } catch (error) {
            console.error('Error regenerating pitch:', error);
            throw error;
        }
    }
}

module.exports = PitchService; 