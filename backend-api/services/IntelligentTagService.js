const { Story, Tag, TagSuggestion, StoryTagReasoning } = require('../models');
const AIService = require('./AIService');

class IntelligentTagService {
    constructor() {
        this.aiService = new AIService();
    }

    /**
     * Generate intelligent tag suggestions for a story
     */
    async generateSuggestions(storyId, limit = 10) {
        try {
            console.log(`Generating suggestions for story ${storyId} with limit ${limit}`);
            
            const story = await Story.findByPk(storyId, {
                include: [
                    { model: Tag, as: 'tags' },
                    { 
                        model: StoryTagReasoning, 
                        as: 'tagReasonings',
                        include: [{ model: Tag, as: 'tag' }]
                    }
                ]
            });

            if (!story) {
                throw new Error('Story not found');
            }

            console.log(`Found story: ${story.title} with ${story.tags?.length || 0} tags`);

            // Get all available tags
            const allTags = await Tag.findAll({
                order: [['title', 'ASC']]
            });

            console.log(`Found ${allTags.length} total tags available`);

            // Get existing suggestions to avoid duplicates
            const existingSuggestions = await TagSuggestion.findAll({
                where: { 
                    storyId,
                    status: ['pending', 'accepted']
                }
            });

            console.log(`Found ${existingSuggestions.length} existing suggestions`);

            const existingTagIds = new Set([
                ...story.tags.map(tag => tag.id),
                ...existingSuggestions.map(suggestion => suggestion.tagId)
            ]);

            // Filter out already suggested or selected tags
            const availableTags = allTags.filter(tag => !existingTagIds.has(tag.id));

            console.log(`Available tags after filtering: ${availableTags.length}`);

            if (availableTags.length === 0) {
                console.log('No available tags for suggestion');
                return { suggestions: [], message: 'No more tags available for suggestion' };
            }

            // Try AI suggestions first, fallback to simple suggestions if AI fails
            let aiSuggestions = [];
            try {
                console.log('Calling AI service to generate suggestions...');
                aiSuggestions = await this.aiService.generateIntelligentSuggestions(
                    story,
                    availableTags,
                    limit
                );
                console.log(`AI service returned ${aiSuggestions.length} suggestions`);
            } catch (aiError) {
                console.error('AI service failed, using fallback:', aiError);
                // Use simple fallback suggestions
                aiSuggestions = this.getSimpleFallbackSuggestions(availableTags, limit);
            }

            // If AI still returns empty, use simple fallback
            if (aiSuggestions.length === 0) {
                console.log('AI returned empty suggestions, using simple fallback');
                aiSuggestions = this.getSimpleFallbackSuggestions(availableTags, limit);
            }

            // Create TagSuggestion records
            const suggestions = [];
            for (const aiSuggestion of aiSuggestions) {
                console.log(`Creating suggestion for tag: ${aiSuggestion.tag.title}`);
                const suggestion = await TagSuggestion.create({
                    storyId,
                    tagId: aiSuggestion.tagId,
                    reasoning: aiSuggestion.reasoning,
                    confidence: aiSuggestion.confidence,
                    status: 'pending',
                    suggestionType: 'ai_generated',
                    contextTags: JSON.stringify(story.tags.map(tag => tag.id))
                });

                suggestions.push({
                    ...suggestion.toJSON(),
                    tag: aiSuggestion.tag
                });
            }

            console.log(`Created ${suggestions.length} suggestion records`);
            return { suggestions, message: 'Suggestions generated successfully' };
        } catch (error) {
            console.error('Error generating suggestions:', error);
            throw error;
        }
    }

    /**
     * Simple fallback suggestions when AI fails
     */
    getSimpleFallbackSuggestions(availableTags, limit = 10) {
        try {
            console.log('Generating simple fallback suggestions');
            
            // Just take the first available tags and provide basic reasoning
            const suggestions = availableTags
                .slice(0, limit)
                .map(tag => ({
                    tagId: tag.id,
                    tag: tag,
                    reasoning: `Basic suggestion for ${tag.title} - this tag might fit your story based on general compatibility.`,
                    confidence: 0.5,
                    relevance: 'medium'
                }));

            console.log(`Generated ${suggestions.length} fallback suggestions`);
            return suggestions;
        } catch (error) {
            console.error('Error in simple fallback suggestions:', error);
            return [];
        }
    }

    /**
     * Accept a tag suggestion and create reasoning
     */
    async acceptSuggestion(suggestionId, userExplanation = null) {
        try {
            const suggestion = await TagSuggestion.findByPk(suggestionId, {
                include: [
                    { model: Story, as: 'story' },
                    { model: Tag, as: 'tag' }
                ]
            });

            if (!suggestion) {
                throw new Error('Suggestion not found');
            }

            if (suggestion.status !== 'pending') {
                throw new Error('Suggestion is not pending');
            }

            // Update suggestion status
            await suggestion.update({
                status: 'accepted',
                acceptedAt: new Date()
            });

            // Add tag to story
            await suggestion.story.addTag(suggestion.tag);

            // Create reasoning record
            const reasoning = await StoryTagReasoning.create({
                storyId: suggestion.storyId,
                tagId: suggestion.tagId,
                reasoning: suggestion.reasoning,
                source: 'ai_suggestion',
                suggestionId: suggestion.id,
                userExplanation,
                contextTags: suggestion.contextTags
            });

            return {
                success: true,
                suggestion: suggestion.toJSON(),
                reasoning: reasoning.toJSON()
            };
        } catch (error) {
            console.error('Error accepting suggestion:', error);
            throw error;
        }
    }

    /**
     * Reject a tag suggestion
     */
    async rejectSuggestion(suggestionId, reason = null) {
        try {
            const suggestion = await TagSuggestion.findByPk(suggestionId);

            if (!suggestion) {
                throw new Error('Suggestion not found');
            }

            await suggestion.update({
                status: 'rejected',
                rejectedAt: new Date()
            });

            return { success: true, suggestion: suggestion.toJSON() };
        } catch (error) {
            console.error('Error rejecting suggestion:', error);
            throw error;
        }
    }

    /**
     * Add a tag manually with reasoning
     */
    async addTagManually(storyId, tagId, reasoning, userExplanation = null) {
        try {
            const story = await Story.findByPk(storyId);
            const tag = await Tag.findByPk(tagId);

            if (!story || !tag) {
                throw new Error('Story or tag not found');
            }

            // Check if tag is already associated
            const existingAssociation = await story.hasTag(tag);
            if (existingAssociation) {
                throw new Error('Tag is already associated with this story');
            }

            // Add tag to story
            await story.addTag(tag);

            // Create reasoning record
            const reasoningRecord = await StoryTagReasoning.create({
                storyId,
                tagId,
                reasoning,
                source: 'manual_choice',
                userExplanation,
                contextTags: JSON.stringify([])
            });

            return {
                success: true,
                reasoning: reasoningRecord.toJSON()
            };
        } catch (error) {
            console.error('Error adding tag manually:', error);
            throw error;
        }
    }

    /**
     * Get suggestions for a story
     */
    async getStorySuggestions(storyId, status = 'pending') {
        try {
            const suggestions = await TagSuggestion.findAll({
                where: { storyId, status },
                include: [
                    { model: Tag, as: 'tag' },
                    { model: Story, as: 'story' }
                ],
                order: [['confidence', 'DESC'], ['createdAt', 'ASC']]
            });

            return suggestions;
        } catch (error) {
            console.error('Error getting story suggestions:', error);
            throw error;
        }
    }

    /**
     * Get reasoning for story tags
     */
    async getStoryReasonings(storyId) {
        try {
            const reasonings = await StoryTagReasoning.findAll({
                where: { storyId },
                include: [
                    { model: Tag, as: 'tag' },
                    { model: TagSuggestion, as: 'originalSuggestion' }
                ],
                order: [['createdAt', 'ASC']]
            });

            return reasonings;
        } catch (error) {
            console.error('Error getting story reasonings:', error);
            throw error;
        }
    }

    /**
     * Search tags manually
     */
    async searchTags(query, limit = 20) {
        try {
            const { Op } = require('sequelize');
            
            const tags = await Tag.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${query}%` } },
                        { short_description: { [Op.like]: `%${query}%` } },
                        { keywords: { [Op.like]: `%${query}%` } }
                    ]
                },
                order: [['title', 'ASC']],
                limit
            });

            return tags;
        } catch (error) {
            console.error('Error searching tags:', error);
            throw error;
        }
    }

    /**
     * Re-evaluate existing suggestions based on new story context
     */
    async reevaluateSuggestions(storyId) {
        try {
            const story = await Story.findByPk(storyId, {
                include: [
                    { model: Tag, as: 'tags' },
                    { 
                        model: StoryTagReasoning, 
                        as: 'tagReasonings',
                        include: [{ model: Tag, as: 'tag' }]
                    }
                ]
            });

            if (!story) {
                throw new Error('Story not found');
            }

            // Get pending suggestions
            const pendingSuggestions = await TagSuggestion.findAll({
                where: { storyId, status: 'pending' },
                include: [{ model: Tag, as: 'tag' }]
            });

            // Re-evaluate each suggestion
            for (const suggestion of pendingSuggestions) {
                const newReasoning = await this.aiService.reevaluateSuggestion(
                    story,
                    suggestion.tag,
                    suggestion.reasoning
                );

                await suggestion.update({
                    reasoning: newReasoning.reasoning,
                    confidence: newReasoning.confidence
                });
            }

            return { 
                success: true, 
                message: `Re-evaluated ${pendingSuggestions.length} suggestions` 
            };
        } catch (error) {
            console.error('Error re-evaluating suggestions:', error);
            throw error;
        }
    }
}

module.exports = IntelligentTagService; 