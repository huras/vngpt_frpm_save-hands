const { TagSuggestion, TagSuggestionDirective, TagWorldBuildingDirectives, Story, Tag } = require('../models');
const AIService = require('./AIService');
const TagWorldBuildingDirectivesService = require('./TagWorldBuildingDirectivesService');

class TagSuggestionDirectiveService {
    constructor() {
        this.aiService = new AIService();
    }

    /**
     * Generate and store a directive for an accepted tag suggestion
     * @param {number} tagSuggestionId - The ID of the accepted tag suggestion
     * @returns {Promise<Object>} The created directive
     */
    async generateAndStoreDirective(tagSuggestionId) {
        try {
            // Get the tag suggestion with related data and existing directives
            const tagSuggestion = await TagSuggestion.findByPk(tagSuggestionId, {
                include: [
                    { model: Story, as: 'story' },
                    { model: Tag, as: 'tag' },
                    { model: TagSuggestionDirective, as: 'directives' }
                ]
            });

            if (!tagSuggestion) {
                throw new Error('Tag suggestion not found');
            }

            if (tagSuggestion.status !== 'accepted') {
                throw new Error('Can only generate directives for accepted tag suggestions');
            }

            // Generate the directive using AI with context from existing directives
            const directiveData = await this.generateDirective(tagSuggestion);

            // Create the directive record
            const directive = await TagSuggestionDirective.create({
                tagSuggestionId,
                directive: directiveData.directive,
                directive_aim: directiveData.directive_aim
            });

            console.log(`Created directive for tag suggestion ${tagSuggestionId}`);
            return directive;

        } catch (error) {
            console.error('Error generating and storing directive:', error);
            throw error;
        }
    }

    /**
     * Generate directive content using AI
     * @param {Object} tagSuggestion - The tag suggestion object with story, tag, and existing directives data
     * @returns {Promise<Object>} Object containing directive and directive_aim
     */
    async generateDirective(tagSuggestion) {
        try {
            const { story, tag, directives } = tagSuggestion;
            const existingDirectives = directives || [];

            let contextSection = '';
            if (existingDirectives.length > 0) {
                contextSection = `\n\nExisting Directives (${existingDirectives.length}):
${existingDirectives.map((d, index) => `${index + 1}. AIM: ${d.directive_aim}
   CONTENT: ${d.directive.substring(0, 150)}${d.directive.length > 150 ? '...' : ''}`).join('\n\n')}

IMPORTANT: Your new directive should be DIFFERENT from the existing ones. Focus on a new aspect, perspective, or approach that hasn't been covered yet.`;
            }

            const prompt = `Generate a comprehensive directive for effectively using the anime/manga tag "${tag.title}" in this story.

Story Information:
- Title: ${story.title || 'Untitled'}
- Description: ${story.description || 'No description provided'}
- Brainstorm: ${story.brainstorm || 'No brainstorm provided'}

Tag Information:
- Tag: ${tag.title}
- Description: ${tag.description || 'No description provided'}
- Broader Description: ${tag.broaderDescription || 'No broader description provided'}

Tag Suggestion Reasoning:
${tagSuggestion.reasoning}${contextSection}

Please provide two parts:

1. DIRECTIVE: A practical, creative, and inspiring directive on how to effectively use this tag in the story. Focus on specific ways to implement the tag's themes, elements, or concepts.

2. DIRECTIVE_AIM: A clear, concise statement of what this directive aims to achieve (e.g., "Enhance character development", "Strengthen plot conflict", "Deepen world-building", "Improve thematic resonance", "Create emotional impact", "Build audience engagement").

${existingDirectives.length > 0 ? 'Make sure your directive and aim are distinct from the existing ones. Focus on a different aspect or approach.' : ''}

Return the response in this exact format:
DIRECTIVE: [your directive text here]
DIRECTIVE_AIM: [your aim statement here]`;

            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8, // Slightly higher temperature for more variety
                max_tokens: 500
            });

            const content = response.choices[0].message.content;

            // Parse the response to extract directive and directive_aim
            const lines = content.split('\n');
            let directive = '';
            let directive_aim = '';

            for (const line of lines) {
                if (line.startsWith('DIRECTIVE:')) {
                    directive = line.replace('DIRECTIVE:', '').trim();
                } else if (line.startsWith('DIRECTIVE_AIM:')) {
                    directive_aim = line.replace('DIRECTIVE_AIM:', '').trim();
                }
            }

            // Fallback if parsing fails
            if (!directive || !directive_aim) {
                directive = content.trim();
                directive_aim = 'Enhance story development and thematic depth';
            }

            return { directive, directive_aim };

        } catch (error) {
            console.error('Error generating directive with AI:', error);
            // Return fallback directive
            return {
                directive: `Consider how the tag "${tagSuggestion.tag.title}" can enhance your story's themes, characters, or plot elements.`,
                directive_aim: 'Provide guidance for effective tag implementation'
            };
        }
    }

    /**
     * Generate world building directives for an accepted tag suggestion
     * @param {number} tagSuggestionId - The ID of the accepted tag suggestion
     * @returns {Promise<Object>} The generated world building directives
     */
    async generateWorldBuildingDirectives(tagSuggestionId) {
        try {
            const tagSuggestion = await TagSuggestion.findByPk(tagSuggestionId, {
                include: [
                    { model: Story, as: 'story' },
                    { model: Tag, as: 'tag' }
                ]
            });

            if (!tagSuggestion) {
                throw new Error(`TagSuggestion with ID ${tagSuggestionId} not found`);
            }

            if (tagSuggestion.status !== 'accepted') {
                throw new Error('World building directives can only be generated for accepted tag suggestions');
            }

            // Check if world building directives already exist
            const existingDirectives = await TagWorldBuildingDirectives.findOne({
                where: { tagSuggestionId }
            });

            if (existingDirectives) {
                throw new Error('World building directives already exist for this tag suggestion');
            }

            // Generate world building directives
            const worldBuildingDirectives = await TagWorldBuildingDirectivesService.generateWorldBuildingDirectives(tagSuggestion);

            return worldBuildingDirectives;
        } catch (error) {
            console.error('Error generating world building directives:', error);
            throw error;
        }
    }

    /**
     * Generate world building directives with streaming progress updates
     * @param {number} tagSuggestionId - The ID of the tag suggestion
     * @param {Function} progressCallback - Callback function to send progress updates
     * @returns {Promise<Object>} The generated world building directives
     */
    async generateWorldBuildingDirectivesStreaming(tagSuggestionId, progressCallback) {
        try {
            const tagSuggestion = await TagSuggestion.findByPk(tagSuggestionId, {
                include: [
                    { model: Story, as: 'story' },
                    { model: Tag, as: 'tag' }
                ]
            });

            if (!tagSuggestion) {
                throw new Error(`TagSuggestion with ID ${tagSuggestionId} not found`);
            }

            if (tagSuggestion.status !== 'accepted') {
                throw new Error('World building directives can only be generated for accepted tag suggestions');
            }

            // Check if world building directives already exist
            const existingDirectives = await TagWorldBuildingDirectives.findOne({
                where: { tagSuggestionId }
            });

            if (existingDirectives) {
                throw new Error('World building directives already exist for this tag suggestion');
            }

            // Generate world building directives with streaming
            const worldBuildingDirectives = await TagWorldBuildingDirectivesService.generateWorldBuildingDirectivesStreaming(tagSuggestion, progressCallback);

            return worldBuildingDirectives;
        } catch (error) {
            console.error('Error generating world building directives:', error);
            throw error;
        }
    }

    /**
     * Get all directives for a tag suggestion
     * @param {number} tagSuggestionId - The ID of the tag suggestion
     * @returns {Promise<Array>} Array of directives
     */
    async getDirectives(tagSuggestionId) {
        try {
            const directives = await TagSuggestionDirective.findAll({
                where: { tagSuggestionId },
                include: [
                    {
                        model: TagSuggestion,
                        as: 'tagSuggestion',
                        include: [
                            { model: Story, as: 'story' },
                            { model: Tag, as: 'tag' }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return directives;
        } catch (error) {
            console.error('Error getting directives:', error);
            throw error;
        }
    }

    /**
     * Get world building directives for a tag suggestion
     * @param {number} tagSuggestionId - The ID of the tag suggestion
     * @returns {Promise<Object>} The world building directives with associated directives
     */
    async getWorldBuildingDirectives(tagSuggestionId) {
        try {
            return await TagWorldBuildingDirectivesService.getWorldBuildingDirectives(tagSuggestionId);
        } catch (error) {
            console.error('Error getting world building directives:', error);
            throw error;
        }
    }

    /**
     * Get directives by type for a tag suggestion
     * @param {number} tagSuggestionId - The ID of the tag suggestion
     * @param {string} directiveType - The type of directive to get
     * @returns {Promise<Array>} Array of directives of the specified type
     */
    async getDirectivesByType(tagSuggestionId, directiveType) {
        try {
            return await TagWorldBuildingDirectivesService.getDirectivesByType(tagSuggestionId, directiveType);
        } catch (error) {
            console.error('Error getting directives by type:', error);
            throw error;
        }
    }

    /**
     * Get a specific directive by ID
     * @param {number} directiveId - The ID of the directive
     * @returns {Promise<Object|null>} The directive or null if not found
     */
    async getDirectiveById(directiveId) {
        try {
            const directive = await TagSuggestionDirective.findByPk(directiveId, {
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

            return directive;
        } catch (error) {
            console.error('Error getting directive by ID:', error);
            throw error;
        }
    }

    /**
     * Get directives by array of IDs
     * @param {Array<number>} directiveIds - Array of directive IDs
     * @returns {Promise<Array>} Array of directives
     */
    async getDirectivesByIds(directiveIds) {
        try {
            const { Op } = require('sequelize');
            
            const directives = await TagSuggestionDirective.findAll({
                where: { 
                    id: { [Op.in]: directiveIds }
                },
                include: [
                    {
                        model: TagSuggestion,
                        as: 'tagSuggestion',
                        include: [
                            { model: Story, as: 'story' },
                            { model: Tag, as: 'tag' }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return directives;
        } catch (error) {
            console.error('Error getting directives by IDs:', error);
            throw error;
        }
    }

    /**
     * Update an existing directive
     * @param {number} directiveId - The ID of the directive
     * @param {string} directive - The new directive text
     * @param {string} directive_aim - The new directive aim
     * @returns {Promise<Object>} The updated directive
     */
    async updateDirective(directiveId, directive, directive_aim) {
        try {
            const directiveRecord = await TagSuggestionDirective.findByPk(directiveId);

            if (!directiveRecord) {
                throw new Error('Directive not found');
            }

            await directiveRecord.update({
                directive,
                directive_aim
            });

            return directiveRecord;
        } catch (error) {
            console.error('Error updating directive:', error);
            throw error;
        }
    }

    /**
     * Delete a directive
     * @param {number} directiveId - The ID of the directive
     * @returns {Promise<boolean>} Success status
     */
    async deleteDirective(directiveId) {
        try {
            const result = await TagSuggestionDirective.destroy({
                where: { id: directiveId }
            });

            return result > 0;
        } catch (error) {
            console.error('Error deleting directive:', error);
            throw error;
        }
    }

    /**
     * Regenerate a specific directive with context awareness
     * @param {number} directiveId - The ID of the directive to regenerate
     * @returns {Promise<Object>} The regenerated directive
     */
    async regenerateDirective(directiveId) {
        try {
            // Get the directive to regenerate
            const directiveToRegenerate = await TagSuggestionDirective.findByPk(directiveId, {
                include: [
                    {
                        model: TagSuggestion,
                        as: 'tagSuggestion',
                        include: [
                            { model: Story, as: 'story' },
                            { model: Tag, as: 'tag' },
                            { model: TagSuggestionDirective, as: 'directives' }
                        ]
                    }
                ]
            });

            if (!directiveToRegenerate) {
                throw new Error('Directive not found');
            }

            // Generate new directive content with context awareness
            const directiveData = await this.generateDirective(directiveToRegenerate.tagSuggestion);

            // Update the existing directive
            await directiveToRegenerate.update({
                directive: directiveData.directive,
                directive_aim: directiveData.directive_aim
            });

            console.log(`Regenerated directive ${directiveId}`);
            return directiveToRegenerate;

        } catch (error) {
            console.error('Error regenerating directive:', error);
            throw error;
        }
    }
}

module.exports = TagSuggestionDirectiveService; 