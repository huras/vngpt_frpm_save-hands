const { TagSuggestion, TagWorldBuildingDirectives, TagSuggestionDirective, Story, Tag } = require('../models');
const AIService = require('./AIService');

class TagWorldBuildingDirectivesService {
    constructor() {
        this.aiService = new AIService();
    }

    /**
     * Generate comprehensive world building directives for a tag suggestion
     * @param {Object} tagSuggestion - The tag suggestion object
     * @returns {Promise<Object>} The generated world building directives
     */
    async generateWorldBuildingDirectives(tagSuggestion) {
        try {
            const story = await Story.findByPk(tagSuggestion.storyId);
            const tag = await Tag.findByPk(tagSuggestion.tagId);

            if (!story || !tag) {
                throw new Error('Story or Tag not found');
            }

            const prompt = `You are embodying the anime/manga tag "${tag.title}". As this tag, analyze which world-building areas are most relevant and provide comprehensive directives for both generation and evolution of those areas.

Story Information:
- Title: ${story.title || 'Untitled'}
- Description: ${story.description || 'No description provided'}
- Brainstorm: ${story.brainstorm || 'No brainstorm provided'}

Tag Information:
- Tag: ${tag.title}
- Description: ${tag.description || 'No description provided'}
- Broader Description: ${tag.broaderDescription || 'No broader description provided'}

Tag Suggestion Reasoning:
${tagSuggestion.reasoning}

First, analyze which of these world-building areas are MOST RELEVANT for this specific tag:
1. CHARACTER GENERATION & EVOLUTION: Character creation, development, growth, and transformation
2. PLACE GENERATION & EVOLUTION: Locations, settings, environments, and their changes over time
3. OBJECT GENERATION & EVOLUTION: Items, artifacts, tools, weapons, and their transformation
4. ARC GENERATION & EVOLUTION: Story arcs, plot developments, narrative structure, and progression
5. PAST EVENTS GENERATION & EVOLUTION: Historical events, backstory, world history, and historical development

For each RELEVANT area, provide comprehensive directives for both GENERATION (initial creation) and EVOLUTION (ongoing development). Skip areas that are not significantly impacted by this tag.

For each relevant area, provide:
- Generation: Specific directives for initial creation/development
- Evolution: Specific directives for ongoing growth, transformation, and progression
- Potential concerns or challenges to consider
- How this area contributes to the tag's themes

Return the response in this exact format:
RELEVANT_AREAS: [comma-separated list of relevant areas, e.g., "character_generation,character_evolution,place_generation,place_evolution,arc_generation,arc_evolution"]
CHARACTER_GENERATION: [detailed directives for character generation, or "NOT_RELEVANT" if not applicable]
CHARACTER_EVOLUTION: [detailed directives for character evolution and development, or "NOT_RELEVANT" if not applicable]
PLACE_GENERATION: [detailed directives for place generation, or "NOT_RELEVANT" if not applicable]
PLACE_EVOLUTION: [detailed directives for place evolution and changes, or "NOT_RELEVANT" if not applicable]
OBJECT_GENERATION: [detailed directives for object generation, or "NOT_RELEVANT" if not applicable]
OBJECT_EVOLUTION: [detailed directives for object evolution and transformation, or "NOT_RELEVANT" if not applicable]
ARC_GENERATION: [detailed directives for arc generation, or "NOT_RELEVANT" if not applicable]
ARC_EVOLUTION: [detailed directives for arc evolution and progression, or "NOT_RELEVANT" if not applicable]
PAST_EVENTS_GENERATION: [detailed directives for past events generation, or "NOT_RELEVANT" if not applicable]
PAST_EVENTS_EVOLUTION: [detailed directives for past events evolution and historical development, or "NOT_RELEVANT" if not applicable]`;

            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 2000
            });

            const content = response.choices[0].message.content;

            // Parse the response to extract each section
            const sections = this.parseWorldBuildingResponse(content);

            // Create the TagWorldBuildingDirectives record
            const worldBuildingDirectives = await TagWorldBuildingDirectives.create({
                tagSuggestionId: tagSuggestion.id,
                characterGeneration: sections.characterGeneration,
                characterEvolution: sections.characterEvolution,
                placeGeneration: sections.placeGeneration,
                placeEvolution: sections.placeEvolution,
                objectGeneration: sections.objectGeneration,
                objectEvolution: sections.objectEvolution,
                arcGeneration: sections.arcGeneration,
                arcEvolution: sections.arcEvolution,
                pastEventsGeneration: sections.pastEventsGeneration,
                pastEventsEvolution: sections.pastEventsEvolution,
                relevantAreas: JSON.stringify(sections.relevantAreas)
            });

            // Create individual TagSuggestionDirective records for each section
            const createdDirectives = await this.createDirectivesFromSections(worldBuildingDirectives.id, tagSuggestion.id, sections);

            // Return the world building directives with the associated directives
            const result = await this.getWorldBuildingDirectives(tagSuggestion.id);
            return result;
        } catch (error) {
            console.error('Error generating world building directives:', error);
            throw error;
        }
    }

    /**
     * Parse the AI response into sections
     * @param {string} content - The AI response content
     * @returns {Object} Parsed sections with relevant areas
     */
    parseWorldBuildingResponse(content) {
        const sections = {
            relevantAreas: [],
            characterGeneration: '',
            characterEvolution: '',
            placeGeneration: '',
            placeEvolution: '',
            objectGeneration: '',
            objectEvolution: '',
            arcGeneration: '',
            arcEvolution: '',
            pastEventsGeneration: '',
            pastEventsEvolution: ''
        };

        const lines = content.split('\n');
        let currentSection = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('RELEVANT_AREAS:')) {
                const areas = trimmedLine.replace('RELEVANT_AREAS:', '').trim();
                sections.relevantAreas = areas.split(',').map(area => area.trim());
            } else if (trimmedLine.startsWith('CHARACTER_GENERATION:')) {
                currentSection = 'characterGeneration';
                const content = trimmedLine.replace('CHARACTER_GENERATION:', '').trim();
                sections[currentSection] = content === 'NOT_RELEVANT' ? '' : content;
            } else if (trimmedLine.startsWith('CHARACTER_EVOLUTION:')) {
                currentSection = 'characterEvolution';
                const content = trimmedLine.replace('CHARACTER_EVOLUTION:', '').trim();
                sections[currentSection] = content === 'NOT_RELEVANT' ? '' : content;
            } else if (trimmedLine.startsWith('PLACE_GENERATION:')) {
                currentSection = 'placeGeneration';
                const content = trimmedLine.replace('PLACE_GENERATION:', '').trim();
                sections[currentSection] = content === 'NOT_RELEVANT' ? '' : content;
            } else if (trimmedLine.startsWith('PLACE_EVOLUTION:')) {
                currentSection = 'placeEvolution';
                const content = trimmedLine.replace('PLACE_EVOLUTION:', '').trim();
                sections[currentSection] = content === 'NOT_RELEVANT' ? '' : content;
            } else if (trimmedLine.startsWith('OBJECT_GENERATION:')) {
                currentSection = 'objectGeneration';
                const content = trimmedLine.replace('OBJECT_GENERATION:', '').trim();
                sections[currentSection] = content === 'NOT_RELEVANT' ? '' : content;
            } else if (trimmedLine.startsWith('OBJECT_EVOLUTION:')) {
                currentSection = 'objectEvolution';
                const content = trimmedLine.replace('OBJECT_EVOLUTION:', '').trim();
                sections[currentSection] = content === 'NOT_RELEVANT' ? '' : content;
            } else if (trimmedLine.startsWith('ARC_GENERATION:')) {
                currentSection = 'arcGeneration';
                const content = trimmedLine.replace('ARC_GENERATION:', '').trim();
                sections[currentSection] = content === 'NOT_RELEVANT' ? '' : content;
            } else if (trimmedLine.startsWith('ARC_EVOLUTION:')) {
                currentSection = 'arcEvolution';
                const content = trimmedLine.replace('ARC_EVOLUTION:', '').trim();
                sections[currentSection] = content === 'NOT_RELEVANT' ? '' : content;
            } else if (trimmedLine.startsWith('PAST_EVENTS_GENERATION:')) {
                currentSection = 'pastEventsGeneration';
                const content = trimmedLine.replace('PAST_EVENTS_GENERATION:', '').trim();
                sections[currentSection] = content === 'NOT_RELEVANT' ? '' : content;
            } else if (trimmedLine.startsWith('PAST_EVENTS_EVOLUTION:')) {
                currentSection = 'pastEventsEvolution';
                const content = trimmedLine.replace('PAST_EVENTS_EVOLUTION:', '').trim();
                sections[currentSection] = content === 'NOT_RELEVANT' ? '' : content;
            } else if (currentSection && trimmedLine) {
                sections[currentSection] += '\n' + trimmedLine;
            }
        }

        return sections;
    }

    /**
     * Create individual TagSuggestionDirective records from the sections
     * @param {number} worldBuildingDirectivesId - The ID of the world building directives
     * @param {number} tagSuggestionId - The ID of the tag suggestion
     * @param {Object} sections - The parsed sections
     * @returns {Promise<Array>} Array of created directives
     */
    async createDirectivesFromSections(worldBuildingDirectivesId, tagSuggestionId, sections) {
        const directives = [];

        const directiveTypes = [
            { key: 'characterGeneration', type: 'character_generation' },
            { key: 'characterEvolution', type: 'character_evolution' },
            { key: 'placeGeneration', type: 'place_generation' },
            { key: 'placeEvolution', type: 'place_evolution' },
            { key: 'objectGeneration', type: 'object_generation' },
            { key: 'objectEvolution', type: 'object_evolution' },
            { key: 'arcGeneration', type: 'arc_generation' },
            { key: 'arcEvolution', type: 'arc_evolution' },
            { key: 'pastEventsGeneration', type: 'past_events_generation' },
            { key: 'pastEventsEvolution', type: 'past_events_evolution' }
        ];

        // Only create directives for areas that are marked as relevant
        for (const { key, type } of directiveTypes) {
            if (sections.relevantAreas.includes(type) && sections[key] && sections[key].trim()) {
                const directive = await TagSuggestionDirective.create({
                    tagSuggestionId: tagSuggestionId,
                    tagWorldBuildingDirectivesId: worldBuildingDirectivesId,
                    directiveType: type,
                    directive: sections[key],
                    directive_aim: `Guide ${type.replace('_', ' ')} based on tag themes and elements`
                });
                directives.push(directive);
            }
        }

        return directives;
    }

    /**
     * Get world building directives for a tag suggestion
     * @param {number} tagSuggestionId - The ID of the tag suggestion
     * @returns {Promise<Object>} The world building directives with associated directives
     */
    async getWorldBuildingDirectives(tagSuggestionId) {
        try {
            const worldBuildingDirectives = await TagWorldBuildingDirectives.findOne({
                where: { tagSuggestionId },
                include: [
                    {
                        model: TagSuggestionDirective,
                        as: 'directives',
                        order: [['directiveType', 'ASC']]
                    },
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

            return worldBuildingDirectives;
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
            const directives = await TagSuggestionDirective.findAll({
                where: {
                    '$tagSuggestion.tagSuggestionId$': tagSuggestionId,
                    directiveType: directiveType
                },
                include: [
                    {
                        model: TagWorldBuildingDirectives,
                        as: 'tagWorldBuildingDirectives',
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
                    }
                ],
                order: [['createdAt', 'ASC']]
            });

            return directives;
        } catch (error) {
            console.error('Error getting directives by type:', error);
            throw error;
        }
    }
}

module.exports = new TagWorldBuildingDirectivesService(); 