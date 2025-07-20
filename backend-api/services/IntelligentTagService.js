const { Story, Tag, TagSuggestion, StoryTagReasoning } = require('../models');
const AIService = require('./AIService');
const AICommentaryService = require('./AICommentaryService');
const IntelligentTagSuggestionService = require('./IntelligentTagSuggestionService');
const PitchService = require('./PitchService');
const TagSuggestionDirectiveService = require('./TagSuggestionDirectiveService');

class IntelligentTagService {
    constructor() {
        this.aiService = new AIService();
        this.commentaryService = new AICommentaryService(this.aiService);
        this.suggestionService = new IntelligentTagSuggestionService();
        this.pitchService = new PitchService();
        this.directiveService = new TagSuggestionDirectiveService();
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
     * Generate intelligent tag suggestions iteratively with streaming
     */
    async generateSuggestionsStreaming(storyId, limit = 10, onSuggestionCallback = null) {
        try {
            console.log(`Generating streaming suggestions for story ${storyId} with limit ${limit}`);
            
            const suggestions = [];
            const createdSuggestions = [];

            // Use the iterative AI service (data fetching is now handled inside the service)
            console.log('Starting iterative AI generation...');
            let aiGenerator;
            try {
                aiGenerator = this.suggestionService.generateIntelligentSuggestionsIterative(storyId, limit);
            } catch (aiError) {
                console.error('Failed to start iterative AI generation:', aiError);
                throw new Error('AI service failed to start: ' + aiError.message);
            }
            
            let suggestionCount = 0;
            for await (const aiSuggestion of aiGenerator) {
                suggestionCount++;
                console.log(`Received AI suggestion ${aiSuggestion.suggestionNumber}: ${aiSuggestion.tag.title}`);
                console.log(`AI reasoning: ${aiSuggestion.reasoning.substring(0, 100)}...`);
                
                // Check if this is a fallback suggestion
                if (aiSuggestion.reasoning.includes('Basic suggestion for') || aiSuggestion.reasoning.includes('this tag might fit your story based on general compatibility')) {
                    console.error('ERROR: Received fallback suggestion instead of AI-generated reasoning!');
                    console.error('This indicates the AI service is failing and falling back to simple suggestions.');
                    throw new Error('AI service failed - received fallback suggestion instead of AI reasoning');
                }
                
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
                    console.log(`Saving suggestion to database with reasoning: ${aiSuggestion.reasoning.substring(0, 100)}...`);
                    
                    // Get current story tags for context (since story data is refreshed each iteration)
                    const currentStory = await Story.findByPk(storyId, {
                        include: [{ model: Tag, as: 'tags' }]
                    });
                    
                    const suggestion = await TagSuggestion.create({
                        storyId,
                        tagId: aiSuggestion.tagId,
                        reasoning: aiSuggestion.reasoning,
                        confidence: aiSuggestion.confidence,
                        status: 'pending',
                        suggestionType: 'ai_generated',
                        contextTags: JSON.stringify(currentStory.tags.map(tag => tag.id))
                    });

                    const suggestionWithTag = {
                        ...suggestion.toJSON(),
                        tag: aiSuggestion.tag,
                        suggestionNumber: aiSuggestion.suggestionNumber,
                        totalSuggestions: aiSuggestion.totalSuggestions
                    };

                    console.log(`Saved suggestion with reasoning: ${suggestionWithTag.reasoning.substring(0, 100)}...`);

                    suggestions.push(suggestionWithTag);
                    createdSuggestions.push(suggestionWithTag);

                    // Call the callback to stream this suggestion
                    if (onSuggestionCallback) {
                        onSuggestionCallback(suggestionWithTag);
                    }

                } catch (createError) {
                    console.error(`Error creating suggestion for tag ${aiSuggestion.tag.title}:`, createError);
                    // Continue with other suggestions instead of failing completely
                    continue;
                }
            }

            console.log(`Created ${createdSuggestions.length} suggestion records via streaming`);
            return { suggestions: createdSuggestions, message: 'Streaming suggestions completed successfully' };
        } catch (error) {
            console.error('Error generating streaming suggestions:', error);
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

            // Generate and store directive for this accepted suggestion
            let directive = null;
            try {
                directive = await this.directiveService.generateAndStoreDirective(suggestion.id);
                console.log(`Generated directive for accepted suggestion ${suggestion.id}`);
            } catch (directiveError) {
                console.error('Error generating directive:', directiveError);
                // Don't fail the entire acceptance process if directive generation fails
            }

            return {
                success: true,
                suggestion: suggestion.toJSON(),
                reasoning: reasoning.toJSON(),
                directive: directive ? directive.toJSON() : null
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

            // Get ratings from StoryTagReasoning for each suggestion
            const suggestionsWithRatings = await Promise.all(
                suggestions.map(async (suggestion) => {
                    // Find the corresponding StoryTagReasoning for this suggestion
                    const reasoning = await StoryTagReasoning.findOne({
                        where: {
                            storyId: suggestion.storyId,
                            tagId: suggestion.tagId,
                            suggestionId: suggestion.id
                        }
                    });

                    return {
                        ...suggestion.toJSON(),
                        userRating: reasoning?.userRating || null, // Only use reasoning rating
                        ratingComment: reasoning?.ratingComment || null // Only use reasoning comment
                    };
                })
            );

            return suggestionsWithRatings;
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
     * Create new AI commentary (replaces current one)
     */
    async createCommentary(storyId, tagId, commentary, userFeedback = null, triggerType = 'user_feedback') {
        try {
            return await this.commentaryService.createCommentary(storyId, tagId, commentary, {
                userFeedback,
                triggerType
            });
        } catch (error) {
            console.error('Error creating commentary:', error);
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

    /**
     * Generate AI directive for how to use a tag effectively in a story
     */
    async generateTagDirective(storyId, tagId, storyTitle = null, storyBrainstorm = null) {
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

            const tag = await Tag.findByPk(tagId);
            if (!tag) {
                throw new Error('Tag not found');
            }

            // Use provided story data or fall back to database data
            const title = storyTitle || story.title;
            const brainstorm = storyBrainstorm || story.brainstorm;

            // Get current tag directives for context
            const currentDirectives = story.tagReasonings.map(reasoning => ({
                tagTitle: reasoning.tag.title,
                directive: reasoning.reasoning
            }));

            const prompt = `Generate a comprehensive directive for how to effectively use this anime/manga tag in this story.

Story Context:
- Title: ${title}
- Brainstorm/Content: ${brainstorm || 'No brainstorm provided'}

Current Tags and Their Directives:
${currentDirectives.map(d => `- ${d.tagTitle}: ${d.directive}`).join('\n')}

Tag to Generate Directive For:
- ${tag.title}: ${tag.short_description} (Category: ${tag.category}, Keywords: ${tag.keywords})

Please provide a comprehensive directive that:
1. **General Approach**: Outlines the overall strategy for incorporating this tag into the story
2. **Story Integration**: Explains how this tag can be woven into the narrative, characters, or world-building
3. **Complementary Usage**: Shows how it works with the existing tags and story elements
4. **Creative Opportunities**: Identifies specific creative possibilities this tag opens up
5. **Avoiding Clichés**: Suggests ways to use this tag in fresh, original ways
6. **Audience Appeal**: Explains how this tag enhances the story's appeal to its target audience

Consider:
- The story's current direction and themes
- How this tag can enhance existing story elements
- Creative ways to implement this tag that feel natural and engaging
- The synergy between this tag and the current tag selection
- Potential plot points, character development, or world-building opportunities

Return only the directive text, no JSON formatting or additional text. Make it practical, creative, and inspiring.`;

            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
                temperature: 0.8,
                max_tokens: 500
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error generating tag directive:', error);
            throw error;
        }
    }

    /**
     * Generate AI explanation for why a tag fits a story (legacy method)
     */
    async generateTagExplanation(storyId, tagId, storyTitle = null, storyBrainstorm = null) {
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

            const tag = await Tag.findByPk(tagId);
            if (!tag) {
                throw new Error('Tag not found');
            }

            // Use provided story data or fall back to database data
            const title = storyTitle || story.title;
            const brainstorm = storyBrainstorm || story.brainstorm;

            const prompt = `Generate a detailed explanation for why this anime/manga tag fits this story.

Story Context:
- Title: ${title}
- Brainstorm/Content: ${brainstorm || 'No brainstorm provided'}

Current Tags:
${story.tags.map(t => `- ${t.title}: ${t.short_description} (Category: ${t.category})`).join('\n')}

Tag to Explain:
- ${tag.title}: ${tag.short_description} (Category: ${tag.category}, Keywords: ${tag.keywords})

Please provide a detailed explanation that:
1. Explains how this tag specifically relates to the story's content, themes, or style
2. Shows how it complements or enhances the existing tag selection
3. Provides concrete reasoning based on the story's elements
4. Avoids generic statements like "this tag might fit your story"
5. Is specific and insightful about the story-tag relationship

Return only the explanation text, no JSON formatting or additional text.`;

            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
                temperature: 0.7,
                max_tokens: 300
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error generating tag explanation:', error);
            throw error;
        }
    }

    /**
     * Rate a tag suggestion (stores rating in StoryTagReasoning only)
     */
    async rateSuggestion(suggestionId, rating, comment = null) {
        try {
            const suggestion = await TagSuggestion.findByPk(suggestionId);
            if (!suggestion) {
                throw new Error('Suggestion not found');
            }

            // Validate rating
            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            // Find or create StoryTagReasoning for this suggestion
            let reasoning = await StoryTagReasoning.findOne({
                where: {
                    storyId: suggestion.storyId,
                    tagId: suggestion.tagId,
                    suggestionId: suggestion.id
                }
            });

            if (!reasoning) {
                // Create a new StoryTagReasoning record for this suggestion
                reasoning = await StoryTagReasoning.create({
                    storyId: suggestion.storyId,
                    tagId: suggestion.tagId,
                    reasoning: suggestion.reasoning,
                    source: 'ai_suggestion',
                    suggestionId: suggestion.id
                });
            }

            // Update the reasoning with rating (this is the primary storage)
            await reasoning.update({
                userRating: rating,
                ratingComment: comment,
                ratedAt: new Date()
            });

            // Learn from the rating for future suggestions
            await this.learnFromRating(suggestion, rating, comment);

            return {
                suggestion: suggestion,
                reasoning: reasoning
            };
        } catch (error) {
            console.error('Error rating suggestion:', error);
            throw error;
        }
    }

    /**
     * Learn from user ratings to improve future suggestions
     */
    async learnFromRating(suggestion, rating, comment) {
        try {
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

            // Store learning data for future use in suggestion generation
            const learningData = {
                storyId: suggestion.storyId,
                tagId: suggestion.tagId,
                rating: rating,
                comment: comment,
                suggestionReasoning: suggestion.reasoning,
                storyContext: {
                    title: story.title,
                    brainstorm: story.brainstorm,
                    currentTags: story.tags.map(t => t.title),
                    currentDirectives: story.tagReasonings.map(r => r.reasoning)
                },
                timestamp: new Date()
            };

            // This could be stored in a separate learning table or used to update suggestion strategies
            console.log('Learning from rating:', learningData);

            // For now, we'll use this data to improve the AI service's understanding
            // In a more sophisticated implementation, this would feed into a learning model
        } catch (error) {
            console.error('Error learning from rating:', error);
        }
    }

    /**
     * Regenerate a single suggestion with new AI reasoning
     */
    async regenerateSuggestion(suggestionId, userFeedback = null) {
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

            // Get the story with current context
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

            if (!story) {
                throw new Error('Story not found');
            }

            // Generate new reasoning using user feedback
            const newReasoning = await this.aiService.reevaluateSuggestionWithFeedback(
                story,
                suggestion.tag,
                suggestion.reasoning,
                userFeedback
            );

            // Get the next version number for this tag-story combination
            const lastVersion = await TagSuggestion.findOne({
                where: {
                    storyId: suggestion.storyId,
                    tagId: suggestion.tagId
                },
                order: [['versionNumber', 'DESC']]
            });
            const nextVersion = (lastVersion?.versionNumber || 0) + 1;

            // Mark the old suggestion as expired (if it was pending)
            if (suggestion.status === 'pending') {
                await suggestion.update({
                    status: 'expired'
                });
            }

            // Create a new suggestion version
            const newSuggestion = await TagSuggestion.create({
                storyId: suggestion.storyId,
                tagId: suggestion.tagId,
                reasoning: newReasoning.reasoning,
                confidence: newReasoning.confidence,
                status: 'pending',
                suggestionType: 'ai_generated',
                contextTags: suggestion.contextTags,
                previousVersionId: suggestion.id,
                versionNumber: nextVersion,
                regenerationReason: userFeedback ? `User feedback: ${userFeedback}` : `AI regeneration requested (from ${suggestion.status} status)`
            });

            return {
                success: true,
                suggestion: {
                    ...newSuggestion.toJSON(),
                    tag: suggestion.tag
                },
                previousStatus: suggestion.status
            };
        } catch (error) {
            console.error('Error regenerating suggestion:', error);
            throw error;
        }
    }

    /**
     * Reject an accepted suggestion (remove tag from story)
     */
    async rejectAcceptedSuggestion(reasoningId, reason = null) {
        try {
            const reasoning = await StoryTagReasoning.findByPk(reasoningId, {
                include: [
                    { model: Story, as: 'story' },
                    { model: Tag, as: 'tag' }
                ]
            });

            if (!reasoning) {
                throw new Error('Reasoning not found');
            }

            // Remove tag from story
            await reasoning.story.removeTag(reasoning.tag);

            // Update the original suggestion status to rejected if it exists
            if (reasoning.suggestionId) {
                const originalSuggestion = await TagSuggestion.findByPk(reasoning.suggestionId);
                if (originalSuggestion) {
                    await originalSuggestion.update({
                        status: 'rejected',
                        rejectedAt: new Date(),
                        rejectionReason: reason || 'Rejected after being accepted'
                    });
                }
            }

            // Delete the reasoning record
            await reasoning.destroy();

            // Learn from the rejection
            await this.learnFromRejection({
                storyId: reasoning.storyId,
                tagId: reasoning.tagId,
                reasoning: reasoning.reasoning,
                rejectionReason: reason,
                wasAccepted: true
            });

            return {
                success: true,
                message: `Tag "${reasoning.tag.title}" has been removed from the story`
            };
        } catch (error) {
            console.error('Error rejecting accepted suggestion:', error);
            throw error;
        }
    }

    /**
     * Get suggestion history for a specific tag-story combination
     */
    async getSuggestionHistory(storyId, tagId) {
        try {
            const suggestions = await TagSuggestion.findAll({
                where: {
                    storyId,
                    tagId
                },
                include: [
                    { model: Tag, as: 'tag' }
                ],
                order: [['versionNumber', 'ASC']]
            });

            // Get ratings from StoryTagReasoning for each suggestion
            const historyWithRatings = await Promise.all(
                suggestions.map(async (suggestion) => {
                    // Find the corresponding StoryTagReasoning for this suggestion
                    const reasoning = await StoryTagReasoning.findOne({
                        where: {
                            storyId: suggestion.storyId,
                            tagId: suggestion.tagId,
                            suggestionId: suggestion.id
                        }
                    });

                    return {
                        id: suggestion.id,
                        version: suggestion.versionNumber,
                        reasoning: suggestion.reasoning,
                        confidence: suggestion.confidence,
                        status: suggestion.status,
                        userRating: reasoning?.userRating || null, // Only use reasoning rating
                        ratingComment: reasoning?.ratingComment || null, // Only use reasoning comment
                        regenerationReason: suggestion.regenerationReason,
                        createdAt: suggestion.createdAt,
                        updatedAt: suggestion.updatedAt,
                        tag: suggestion.tag
                    };
                })
            );

            return {
                success: true,
                history: historyWithRatings
            };
        } catch (error) {
            console.error('Error getting suggestion history:', error);
            throw error;
        }
    }

    /**
     * Clear all pending suggestions for a story
     */
    async clearPendingSuggestions(storyId) {
        try {
            // Find all pending suggestions for the story
            const pendingSuggestions = await TagSuggestion.findAll({
                where: {
                    storyId,
                    status: 'pending'
                }
            });

            if (pendingSuggestions.length === 0) {
                return {
                    success: true,
                    message: 'No pending suggestions to clear',
                    clearedCount: 0
                };
            }

            // Update all pending suggestions to 'expired' status
            await TagSuggestion.update(
                {
                    status: 'expired',
                    updatedAt: new Date()
                },
                {
                    where: {
                        storyId,
                        status: 'pending'
                    }
                }
            );

            console.log(`Cleared ${pendingSuggestions.length} pending suggestions for story ${storyId}`);

            return {
                success: true,
                message: `Cleared ${pendingSuggestions.length} pending suggestions`,
                clearedCount: pendingSuggestions.length
            };
        } catch (error) {
            console.error('Error clearing pending suggestions:', error);
            throw error;
        }
    }

    /**
     * Rate a reasoning directly
     */
    async rateReasoning(reasoningId, rating, comment = null) {
        try {
            const reasoning = await StoryTagReasoning.findByPk(reasoningId, {
                include: [
                    { model: Tag, as: 'tag' }
                ]
            });

            if (!reasoning) {
                throw new Error('Reasoning not found');
            }

            // Validate rating
            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            // Update the reasoning with rating
            await reasoning.update({
                userRating: rating,
                ratingComment: comment,
                ratedAt: new Date()
            });

            return reasoning;
        } catch (error) {
            console.error('Error rating reasoning:', error);
            throw error;
        }
    }

    /**
     * Update a reasoning
     */
    async updateReasoning(reasoningId, newReasoning) {
        try {
            const reasoning = await StoryTagReasoning.findByPk(reasoningId, {
                include: [
                    { model: Tag, as: 'tag' }
                ]
            });

            if (!reasoning) {
                throw new Error('Reasoning not found');
            }

            // Update the reasoning
            await reasoning.update({
                reasoning: newReasoning,
                updatedAt: new Date()
            });

            return reasoning;
        } catch (error) {
            console.error('Error updating reasoning:', error);
            throw error;
        }
    }

    /**
     * Generate pitches for a tag suggestion
     */
    async generatePitches(suggestionId, count = 3) {
        return await this.pitchService.generatePitches(suggestionId, count);
    }

    /**
     * Get pitches for a tag suggestion
     */
    async getPitches(suggestionId) {
        return await this.pitchService.getPitches(suggestionId);
    }

    /**
     * Delete a pitch
     */
    async deletePitch(pitchId) {
        return await this.pitchService.deletePitch(pitchId);
    }

    /**
     * Delete all pitches for a suggestion
     */
    async deleteAllPitches(suggestionId) {
        return await this.pitchService.deleteAllPitches(suggestionId);
    }

    /**
     * Rate a pitch
     */
    async ratePitch(pitchId, rating, comment = null) {
        return await this.pitchService.ratePitch(pitchId, rating, comment);
    }

    /**
     * Toggle favorite status for a pitch
     */
    async togglePitchFavorite(pitchId) {
        return await this.pitchService.togglePitchFavorite(pitchId);
    }
}

module.exports = IntelligentTagService; 