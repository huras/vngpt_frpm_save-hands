const { Story, Tag, TagSuggestion, StoryTagReasoning } = require('../models');
const AIService = require('./AIService');
const AICommentaryService = require('./AICommentaryService');

class IntelligentTagService {
    constructor() {
        this.aiService = new AIService();
        this.commentaryService = new AICommentaryService(this.aiService);
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
                
                // Double-check that this suggestion doesn't already exist
                const existingSuggestion = await TagSuggestion.findOne({
                    where: {
                        storyId,
                        tagId: aiSuggestion.tagId,
                        status: ['pending', 'accepted']
                    }
                });
                
                if (existingSuggestion) {
                    console.log(`Suggestion for tag ${aiSuggestion.tag.title} already exists, skipping`);
                    continue;
                }
                
                try {
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
                } catch (createError) {
                    console.error(`Error creating suggestion for tag ${aiSuggestion.tag.title}:`, createError);
                    // Continue with other suggestions instead of failing completely
                    continue;
                }
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

            // Create AI commentary for this tag-story relationship
            const commentary = await this.commentaryService.createCommentary(
                suggestion.storyId,
                suggestion.tagId,
                suggestion.reasoning,
                {
                    confidence: suggestion.confidence,
                    contextTags: suggestion.contextTags ? JSON.parse(suggestion.contextTags) : null,
                    triggerType: 'initial_suggestion',
                    userFeedback: userExplanation
                }
            );

            // Create reasoning record
            const reasoning = await StoryTagReasoning.create({
                storyId: suggestion.storyId,
                tagId: suggestion.tagId,
                reasoning: suggestion.reasoning,
                source: 'ai_suggestion',
                suggestionId: suggestion.id,
                userExplanation,
                contextTags: suggestion.contextTags,
                currentCommentaryId: commentary.id
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
            const suggestion = await TagSuggestion.findByPk(suggestionId, {
                include: [
                    { model: Story, as: 'story' },
                    { model: Tag, as: 'tag' }
                ]
            });

            if (!suggestion) {
                throw new Error('Suggestion not found');
            }

            await suggestion.update({
                status: 'rejected',
                rejectedAt: new Date(),
                rejectionReason: reason
            });

            // Learn from this rejection to improve future suggestions
            await this.learnFromRejection(suggestion);

            return { success: true, suggestion: suggestion.toJSON() };
        } catch (error) {
            console.error('Error rejecting suggestion:', error);
            throw error;
        }
    }

    /**
     * Learn from rejected suggestions to improve future recommendations
     */
    async learnFromRejection(rejectedSuggestion) {
        try {
            console.log(`Learning from rejection: ${rejectedSuggestion.tag.title} for story: ${rejectedSuggestion.story.title}`);
            
            // Get all rejected suggestions for this story to understand patterns
            const storyRejections = await TagSuggestion.findAll({
                where: { 
                    storyId: rejectedSuggestion.storyId,
                    status: 'rejected'
                },
                include: [
                    { model: Tag, as: 'tag' }
                ],
                order: [['rejectedAt', 'DESC']]
            });

            // Get accepted suggestions for comparison
            const storyAcceptances = await TagSuggestion.findAll({
                where: { 
                    storyId: rejectedSuggestion.storyId,
                    status: 'accepted'
                },
                include: [
                    { model: Tag, as: 'tag' }
                ],
                order: [['acceptedAt', 'DESC']]
            });

            // Analyze patterns to improve future suggestions
            const learningData = {
                storyId: rejectedSuggestion.storyId,
                rejectedTag: {
                    id: rejectedSuggestion.tagId,
                    title: rejectedSuggestion.tag.title,
                    category: rejectedSuggestion.tag.category,
                    keywords: rejectedSuggestion.tag.keywords,
                    reason: rejectedSuggestion.rejectionReason
                },
                contextTags: JSON.parse(rejectedSuggestion.contextTags || '[]'),
                storyRejections: storyRejections.map(r => ({
                    tagId: r.tagId,
                    tagTitle: r.tag.title,
                    tagCategory: r.tag.category,
                    rejectionReason: r.rejectionReason
                })),
                storyAcceptances: storyAcceptances.map(a => ({
                    tagId: a.tagId,
                    tagTitle: a.tag.title,
                    tagCategory: a.tag.category
                })),
                timestamp: new Date()
            };

            console.log('Learning data:', JSON.stringify(learningData, null, 2));

            // Store learning data for future analysis (you could store this in a separate table)
            // For now, we'll use it to improve the current suggestion generation
            await this.updateSuggestionStrategy(learningData);

        } catch (error) {
            console.error('Error learning from rejection:', error);
        }
    }

    /**
     * Update suggestion strategy based on learning data
     */
    async updateSuggestionStrategy(learningData) {
        try {
            // Analyze rejection patterns
            const rejectionPatterns = this.analyzeRejectionPatterns(learningData);
            
            // Store these patterns for future use
            // This could be stored in a separate table or configuration
            console.log('Updated suggestion strategy based on rejections:', rejectionPatterns);
            
        } catch (error) {
            console.error('Error updating suggestion strategy:', error);
        }
    }

    /**
     * Analyze patterns in rejections to improve future suggestions
     */
    analyzeRejectionPatterns(learningData) {
        const patterns = {
            categoryAvoidance: {},
            keywordAvoidance: {},
            commonRejectionReasons: {},
            successfulCategories: {},
            successfulKeywords: {}
        };

        // Analyze rejected categories
        learningData.storyRejections.forEach(rejection => {
            if (rejection.tagCategory) {
                patterns.categoryAvoidance[rejection.tagCategory] = 
                    (patterns.categoryAvoidance[rejection.tagCategory] || 0) + 1;
            }
        });

        // Analyze accepted categories
        learningData.storyAcceptances.forEach(acceptance => {
            if (acceptance.tagCategory) {
                patterns.successfulCategories[acceptance.tagCategory] = 
                    (patterns.successfulCategories[acceptance.tagCategory] || 0) + 1;
            }
        });

        // Analyze rejection reasons
        learningData.storyRejections.forEach(rejection => {
            if (rejection.rejectionReason) {
                const reason = rejection.rejectionReason.toLowerCase();
                patterns.commonRejectionReasons[reason] = 
                    (patterns.commonRejectionReasons[reason] || 0) + 1;
            }
        });

        return patterns;
    }

    /**
     * Get rejection statistics for analytics
     */
    async getRejectionStatistics(storyId = null) {
        try {
            const whereClause = storyId ? { storyId } : {};
            
            const rejections = await TagSuggestion.findAll({
                where: { 
                    ...whereClause,
                    status: 'rejected'
                },
                include: [
                    { model: Tag, as: 'tag' },
                    { model: Story, as: 'story' }
                ],
                order: [['rejectedAt', 'DESC']]
            });

            const acceptances = await TagSuggestion.findAll({
                where: { 
                    ...whereClause,
                    status: 'accepted'
                },
                include: [
                    { model: Tag, as: 'tag' },
                    { model: Story, as: 'story' }
                ],
                order: [['acceptedAt', 'DESC']]
            });

            const statistics = {
                totalRejections: rejections.length,
                totalAcceptances: acceptances.length,
                rejectionRate: acceptances.length > 0 ? 
                    (rejections.length / (rejections.length + acceptances.length) * 100).toFixed(1) : 0,
                categoryAnalysis: {},
                commonRejectionReasons: {},
                recentRejections: rejections.slice(0, 10).map(r => ({
                    tagTitle: r.tag.title,
                    storyTitle: r.story.title,
                    rejectionReason: r.rejectionReason,
                    rejectedAt: r.rejectedAt
                }))
            };

            // Analyze categories
            rejections.forEach(rejection => {
                if (rejection.tag.category) {
                    if (!statistics.categoryAnalysis[rejection.tag.category]) {
                        statistics.categoryAnalysis[rejection.tag.category] = {
                            rejected: 0,
                            accepted: 0,
                            rate: 0
                        };
                    }
                    statistics.categoryAnalysis[rejection.tag.category].rejected++;
                }
            });

            acceptances.forEach(acceptance => {
                if (acceptance.tag.category) {
                    if (!statistics.categoryAnalysis[acceptance.tag.category]) {
                        statistics.categoryAnalysis[acceptance.tag.category] = {
                            rejected: 0,
                            accepted: 0,
                            rate: 0
                        };
                    }
                    statistics.categoryAnalysis[acceptance.tag.category].accepted++;
                }
            });

            // Calculate rejection rates per category
            Object.keys(statistics.categoryAnalysis).forEach(category => {
                const data = statistics.categoryAnalysis[category];
                const total = data.rejected + data.accepted;
                data.rate = total > 0 ? (data.rejected / total * 100).toFixed(1) : 0;
            });

            // Analyze rejection reasons
            rejections.forEach(rejection => {
                if (rejection.rejectionReason) {
                    const reason = rejection.rejectionReason.toLowerCase();
                    statistics.commonRejectionReasons[reason] = 
                        (statistics.commonRejectionReasons[reason] || 0) + 1;
                }
            });

            return statistics;
        } catch (error) {
            console.error('Error getting rejection statistics:', error);
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

            // Create AI commentary for this manual tag addition
            const commentary = await this.commentaryService.createCommentary(
                storyId,
                tagId,
                reasoning,
                {
                    confidence: 0.9, // High confidence for manual additions
                    contextTags: [],
                    triggerType: 'manual_update',
                    userFeedback: userExplanation
                }
            );

            // Create reasoning record
            const reasoningRecord = await StoryTagReasoning.create({
                storyId,
                tagId,
                reasoning,
                source: 'manual_choice',
                userExplanation,
                contextTags: JSON.stringify([]),
                currentCommentaryId: commentary.id
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

            // Update the story's lastReevaluatedAt timestamp
            await story.update({
                lastReevaluatedAt: new Date()
            });

            return { 
                success: true, 
                message: `Re-evaluated ${pendingSuggestions.length} suggestions`,
                lastReevaluatedAt: story.lastReevaluatedAt
            };
        } catch (error) {
            console.error('Error re-evaluating suggestions:', error);
            throw error;
        }
    }

    /**
     * Get AI commentary for a story-tag relationship
     */
    async getCommentary(storyId, tagId) {
        try {
            return await this.commentaryService.getCurrentCommentary(storyId, tagId);
        } catch (error) {
            console.error('Error getting commentary:', error);
            throw error;
        }
    }

    /**
     * Get commentary history for a story-tag relationship
     */
    async getCommentaryHistory(storyId, tagId) {
        try {
            return await this.commentaryService.getCommentaryHistory(storyId, tagId);
        } catch (error) {
            console.error('Error getting commentary history:', error);
            throw error;
        }
    }

    /**
     * Update AI commentary based on user feedback
     */
    async updateCommentary(storyId, tagId, newCommentary, userFeedback = null) {
        try {
            return await this.commentaryService.updateCommentary(storyId, tagId, newCommentary, {
                userFeedback,
                triggerType: 'user_feedback'
            });
        } catch (error) {
            console.error('Error updating commentary:', error);
            throw error;
        }
    }

    /**
     * Get all commentaries for a story
     */
    async getStoryCommentaries(storyId) {
        try {
            return await this.commentaryService.getStoryCommentaries(storyId);
        } catch (error) {
            console.error('Error getting story commentaries:', error);
            throw error;
        }
    }

    /**
     * Analyze commentary quality
     */
    async analyzeCommentaryQuality(commentary) {
        try {
            return await this.commentaryService.analyzeCommentaryQuality(commentary);
        } catch (error) {
            console.error('Error analyzing commentary quality:', error);
            throw error;
        }
    }

    /**
     * Get commentary statistics for a story
     */
    async getCommentaryStats(storyId) {
        try {
            return await this.commentaryService.getCommentaryStats(storyId);
        } catch (error) {
            console.error('Error getting commentary stats:', error);
            throw error;
        }
    }

    /**
     * Check if re-evaluation is needed based on story changes
     */
    async isReevaluationNeeded(storyId) {
        try {
            const story = await Story.findByPk(storyId);
            
            if (!story) {
                return false;
            }

            // If never re-evaluated, it's needed
            if (!story.lastReevaluatedAt) {
                return true;
            }

            // Check if story was updated after last re-evaluation
            const storyUpdatedAfterReevaluation = story.updatedAt > story.lastReevaluatedAt;
            
            // Check if any tag reasonings were added after last re-evaluation
            const recentReasonings = await StoryTagReasoning.count({
                where: {
                    storyId,
                    createdAt: {
                        [require('sequelize').Op.gt]: story.lastReevaluatedAt
                    }
                }
            });

            return storyUpdatedAfterReevaluation || recentReasonings > 0;
        } catch (error) {
            console.error('Error checking if re-evaluation is needed:', error);
            return false;
        }
    }
}

module.exports = IntelligentTagService; 