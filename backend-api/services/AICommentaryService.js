const { AICommentary, Story, Tag, StoryTagReasoning } = require('../models');

class AICommentaryService {
    constructor(aiService) {
        this.aiService = aiService;
    }

    /**
     * Create a new AI commentary for a story-tag relationship
     */
    async createCommentary(storyId, tagId, commentary, options = {}) {
        try {
            const {
                confidence = 0.8,
                contextTags = null,
                storyContext = null,
                triggerType = 'initial_suggestion',
                userFeedback = null,
                previousCommentaryId = null
            } = options;

            // Mark any existing current commentary as not current
            await AICommentary.update(
                { isCurrent: false },
                {
                    where: {
                        storyId,
                        tagId,
                        isCurrent: true
                    }
                }
            );

            // Get the next version number
            const lastCommentary = await AICommentary.findOne({
                where: { storyId, tagId },
                order: [['version', 'DESC']]
            });
            const nextVersion = (lastCommentary?.version || 0) + 1;

            // Create the new commentary
            const newCommentary = await AICommentary.create({
                storyId,
                tagId,
                commentary,
                version: nextVersion,
                isCurrent: true,
                confidence,
                contextTags: contextTags ? JSON.stringify(contextTags) : null,
                storyContext: storyContext ? JSON.stringify(storyContext) : null,
                triggerType,
                previousCommentaryId,
                userFeedback
            });

            // Update the StoryTagReasoning to reference this commentary
            await StoryTagReasoning.update(
                { 
                    reasoning: commentary,
                    currentCommentaryId: newCommentary.id
                },
                {
                    where: { storyId, tagId }
                }
            );

            return newCommentary;
        } catch (error) {
            console.error('Error creating AI commentary:', error);
            throw error;
        }
    }

    /**
     * Get the current AI commentary for a story-tag relationship
     */
    async getCurrentCommentary(storyId, tagId) {
        try {
            return await AICommentary.findOne({
                where: {
                    storyId,
                    tagId,
                    isCurrent: true
                },
                include: [
                    { model: Tag, as: 'tag' },
                    { model: Story, as: 'story' }
                ]
            });
        } catch (error) {
            console.error('Error getting current commentary:', error);
            throw error;
        }
    }

    /**
     * Get all commentaries for a story-tag relationship (history)
     */
    async getCommentaryHistory(storyId, tagId) {
        try {
            return await AICommentary.findAll({
                where: { storyId, tagId },
                order: [['version', 'ASC']],
                include: [
                    { model: Tag, as: 'tag' },
                    { model: Story, as: 'story' }
                ]
            });
        } catch (error) {
            console.error('Error getting commentary history:', error);
            throw error;
        }
    }

    /**
     * Update AI commentary based on user feedback or story changes
     */
    async updateCommentary(storyId, tagId, newCommentary, options = {}) {
        try {
            const {
                userFeedback = null,
                triggerType = 'user_feedback',
                storyContext = null
            } = options;

            // Get current commentary
            const currentCommentary = await this.getCurrentCommentary(storyId, tagId);
            if (!currentCommentary) {
                throw new Error('No current commentary found for this story-tag relationship');
            }

            // Generate improved commentary using AI
            const improvedCommentary = await this.generateImprovedCommentary(
                storyId,
                tagId,
                currentCommentary,
                newCommentary,
                userFeedback,
                storyContext
            );

            // Create new commentary version
            const updatedCommentary = await this.createCommentary(storyId, tagId, improvedCommentary, {
                confidence: currentCommentary.confidence,
                contextTags: currentCommentary.contextTags,
                storyContext: storyContext || currentCommentary.storyContext,
                triggerType,
                userFeedback,
                previousCommentaryId: currentCommentary.id
            });

            return updatedCommentary;
        } catch (error) {
            console.error('Error updating commentary:', error);
            throw error;
        }
    }

    /**
     * Generate improved commentary using AI
     */
    async generateImprovedCommentary(storyId, tagId, currentCommentary, newCommentary, userFeedback, storyContext) {
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

            const tag = await Tag.findByPk(tagId);

            const prompt = `Improve the AI commentary for this tag-story relationship based on the provided feedback and context.

Story Context:
- Title: ${story.title}
- Brainstorm: ${story.brainstorm || 'No brainstorm provided'}

Current Tags:
${story.tags.map(t => `- ${t.title}: ${t.short_description} (Category: ${t.category})`).join('\n')}

Tag to Comment On:
- ${tag.title}: ${tag.short_description} (Category: ${tag.category}, Keywords: ${tag.keywords})

Current Commentary (Version ${currentCommentary.version}):
"${currentCommentary.commentary}"

${userFeedback ? `User Feedback: "${userFeedback}"` : ''}

${newCommentary ? `New Commentary Request: "${newCommentary}"` : ''}

${storyContext ? `Updated Story Context: ${JSON.stringify(storyContext)}` : ''}

Please provide an improved, more specific and insightful commentary that:
1. Addresses any user feedback provided
2. Is more specific to this particular story and tag combination
3. Avoids generic statements like "this tag might fit your story"
4. Provides concrete reasoning based on the story's themes, content, and existing tags
5. Shows understanding of how this tag complements or enhances the story

Return only the improved commentary text, no JSON formatting or additional text.`;

            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
                temperature: 0.7,
                max_tokens: 500
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error generating improved commentary:', error);
            // Fallback to the new commentary or current commentary
            return newCommentary || currentCommentary.commentary;
        }
    }

    /**
     * Get all current commentaries for a story
     */
    async getStoryCommentaries(storyId) {
        try {
            return await AICommentary.findAll({
                where: {
                    storyId,
                    isCurrent: true
                },
                include: [
                    { model: Tag, as: 'tag' },
                    { model: Story, as: 'story' }
                ],
                order: [['createdAt', 'ASC']]
            });
        } catch (error) {
            console.error('Error getting story commentaries:', error);
            throw error;
        }
    }

    /**
     * Analyze commentary quality and suggest improvements
     */
    async analyzeCommentaryQuality(commentary) {
        try {
            const prompt = `Analyze this AI commentary for quality and specificity:

Commentary: "${commentary}"

Rate the following aspects (1-10) and provide suggestions for improvement:
1. Specificity (how specific is it to the story/tag combination)
2. Insightfulness (how much value does it add)
3. Avoidance of generic statements
4. Concreteness (provides concrete reasoning)

Return a JSON response with:
{
  "scores": {
    "specificity": number,
    "insightfulness": number,
    "avoidance_of_generic": number,
    "concreteness": number
  },
  "overall_score": number,
  "suggestions": ["suggestion1", "suggestion2"],
  "is_generic": boolean
}`;

            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
                temperature: 0.3,
                max_tokens: 300
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.aiService.cleanAIResponse(content);
            return JSON.parse(cleanedContent);
        } catch (error) {
            console.error('Error analyzing commentary quality:', error);
            return {
                scores: { specificity: 5, insightfulness: 5, avoidance_of_generic: 5, concreteness: 5 },
                overall_score: 5,
                suggestions: ['Unable to analyze commentary quality'],
                is_generic: true
            };
        }
    }

    /**
     * Get commentary statistics for a story
     */
    async getCommentaryStats(storyId) {
        try {
            const commentaries = await AICommentary.findAll({
                where: { storyId },
                include: [{ model: Tag, as: 'tag' }]
            });

            const stats = {
                totalCommentaries: commentaries.length,
                uniqueTags: new Set(commentaries.map(c => c.tagId)).size,
                averageVersions: commentaries.length / Math.max(1, new Set(commentaries.map(c => c.tagId)).size),
                triggerTypes: {},
                averageConfidence: 0
            };

            // Count trigger types
            commentaries.forEach(c => {
                stats.triggerTypes[c.triggerType] = (stats.triggerTypes[c.triggerType] || 0) + 1;
            });

            // Calculate average confidence
            if (commentaries.length > 0) {
                stats.averageConfidence = commentaries.reduce((sum, c) => sum + (c.confidence || 0), 0) / commentaries.length;
            }

            return stats;
        } catch (error) {
            console.error('Error getting commentary stats:', error);
            throw error;
        }
    }
}

module.exports = AICommentaryService; 