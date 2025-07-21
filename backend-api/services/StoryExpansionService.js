const { 
    Story, 
    TagSuggestionDirective, 
    TagSuggestion, 
    Tag, 
    StoryTagReasoning,
    ArcSuggestion, 
    CharacterSuggestion, 
    PlaceSuggestion, 
    CharacterOrganizationSuggestion, 
    NotableObjectSuggestion 
} = require('../models');
const AIService = require('./AIService');

class StoryExpansionService {
    constructor() {
        this.aiService = new AIService();
    }

    /**
     * Generate story expansion suggestions based on collected directives
     * @param {number} storyId - The ID of the story
     * @returns {Promise<Object>} Object containing all generated suggestions
     */
    async generateStoryExpansion(storyId) {
        try {
            console.log(`Generating story expansion for story ${storyId}`);

            // Get story with all related data
            const story = await Story.findByPk(storyId, {
                include: [
                    { 
                        model: TagSuggestion, 
                        as: 'tagSuggestions',
                        include: [{ model: Tag, as: 'tag' }]
                    },
                    { 
                        model: StoryTagReasoning, 
                        as: 'tagReasonings',
                        include: [{ model: Tag, as: 'tag' }]
                    },
                    { model: ArcSuggestion, as: 'arcSuggestions' },
                    { model: CharacterSuggestion, as: 'characterSuggestions' },
                    { model: PlaceSuggestion, as: 'placeSuggestions' },
                    { model: CharacterOrganizationSuggestion, as: 'organizationSuggestions' },
                    { model: NotableObjectSuggestion, as: 'objectSuggestions' }
                ]
            });

            if (!story) {
                throw new Error('Story not found');
            }

            // Collect all directives for accepted tag suggestions
            const directives = await this.collectDirectives(storyId);
            
            if (directives.length === 0) {
                throw new Error('No directives found. Please accept some tag suggestions first to generate story expansion.');
            }

            console.log(`Found ${directives.length} directives for story expansion`);

            // Generate each type of suggestion
            const [arcSuggestions, characterSuggestions, placeSuggestions, organizationSuggestions, objectSuggestions] = await Promise.all([
                this.generateArcSuggestions(story, directives),
                this.generateCharacterSuggestions(story, directives),
                this.generatePlaceSuggestions(story, directives),
                this.generateOrganizationSuggestions(story, directives),
                this.generateObjectSuggestions(story, directives)
            ]);

            return {
                storyId,
                storyTitle: story.title,
                directivesCount: directives.length,
                arcSuggestions,
                characterSuggestions,
                placeSuggestions,
                organizationSuggestions,
                objectSuggestions,
                generatedAt: new Date()
            };

        } catch (error) {
            console.error('Error generating story expansion:', error);
            throw error;
        }
    }

    /**
     * Get all tags associated with a story through accepted suggestions and reasonings
     * @param {Object} story - Story object with tagSuggestions and tagReasonings
     * @returns {Array} Array of tag objects
     */
    getStoryTags(story) {
        const tagMap = new Map();
        
        // Get tags from accepted suggestions
        if (story.tagSuggestions) {
            story.tagSuggestions.forEach(suggestion => {
                if (suggestion.tag && suggestion.status === 'accepted') {
                    tagMap.set(suggestion.tag.id, suggestion.tag);
                }
            });
        }
        
        // Get tags from reasonings
        if (story.tagReasonings) {
            story.tagReasonings.forEach(reasoning => {
                if (reasoning.tag) {
                    tagMap.set(reasoning.tag.id, reasoning.tag);
                }
            });
        }
        
        return Array.from(tagMap.values());
    }

    /**
     * Collect all directives from accepted tag suggestions
     * @param {number} storyId - The ID of the story
     * @returns {Promise<Array>} Array of directive objects
     */
    async collectDirectives(storyId) {
        try {
            const directives = await TagSuggestionDirective.findAll({
                include: [
                    {
                        model: TagSuggestion,
                        as: 'tagSuggestion',
                        where: { 
                            storyId,
                            status: 'accepted'
                        },
                        include: [
                            { model: Tag, as: 'tag' },
                            { model: Story, as: 'story' }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return directives.map(directive => ({
                id: directive.id,
                directive: directive.directive,
                directive_aim: directive.directive_aim,
                tagSuggestion: directive.tagSuggestion,
                tag: directive.tagSuggestion.tag,
                story: directive.tagSuggestion.story,
                createdAt: directive.createdAt
            }));
        } catch (error) {
            console.error('Error collecting directives:', error);
            throw error;
        }
    }

    /**
     * Generate arc suggestions based on directives
     * @param {Object} story - Story object with related data
     * @param {Array} directives - Array of directive objects
     * @returns {Promise<Array>} Array of generated arc suggestions
     */
    async generateArcSuggestions(story, directives) {
        try {
            const prompt = this.buildArcGenerationPrompt(story, directives);
            
            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 2000
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.aiService.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            const arcSuggestions = [];
            for (const arcData of result.arcs || []) {
                const arcSuggestion = await ArcSuggestion.create({
                    storyId: story.id,
                    name: arcData.name,
                    high_level_description: arcData.high_level_description,
                    arcType: arcData.arcType || 'plot_arc',
                    complexity: arcData.complexity || 'moderate',
                    estimatedDuration: arcData.estimatedDuration || 'medium',
                    keyEvents: arcData.keyEvents ? JSON.stringify(arcData.keyEvents) : null,
                    characterInvolvement: arcData.characterInvolvement ? JSON.stringify(arcData.characterInvolvement) : null,
                    relatedTags: arcData.relatedTags ? JSON.stringify(arcData.relatedTags) : null,
                    sourceDirectives: arcData.sourceDirectives ? JSON.stringify(arcData.sourceDirectives) : null,
                    confidence: arcData.confidence || 0.8
                });
                arcSuggestions.push(arcSuggestion);
            }

            console.log(`Generated ${arcSuggestions.length} arc suggestions`);
            return arcSuggestions;

        } catch (error) {
            console.error('Error generating arc suggestions:', error);
            return [];
        }
    }

    /**
     * Generate character suggestions based on directives
     * @param {Object} story - Story object with related data
     * @param {Array} directives - Array of directive objects
     * @param {number} count - Number of characters to generate (default: 4-6)
     * @returns {Promise<Array>} Array of generated character suggestions
     */
    async generateCharacterSuggestions(story, directives, count = null) {
        try {
            const prompt = this.buildCharacterGenerationPrompt(story, directives, count);
            
            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 2000
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.aiService.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            const characterSuggestions = [];
            for (const characterData of result.characters || []) {
                const characterSuggestion = await CharacterSuggestion.create({
                    storyId: story.id,
                    name: characterData.name,
                    high_level_description: characterData.high_level_description,
                    characterType: characterData.characterType || 'supporting',
                    archetype: characterData.archetype,
                    personalityTraits: characterData.personalityTraits ? JSON.stringify(characterData.personalityTraits) : null,
                    background: characterData.background,
                    motivations: characterData.motivations ? JSON.stringify(characterData.motivations) : null,
                    relationships: characterData.relationships ? JSON.stringify(characterData.relationships) : null,
                    relatedTags: characterData.relatedTags ? JSON.stringify(characterData.relatedTags) : null,
                    sourceDirectives: characterData.sourceDirectives ? JSON.stringify(characterData.sourceDirectives) : null,
                    confidence: characterData.confidence || 0.8
                });
                characterSuggestions.push(characterSuggestion);
            }

            console.log(`Generated ${characterSuggestions.length} character suggestions`);
            return characterSuggestions;

        } catch (error) {
            console.error('Error generating character suggestions:', error);
            return [];
        }
    }

    /**
     * Generate place suggestions based on directives
     * @param {Object} story - Story object with related data
     * @param {Array} directives - Array of directive objects
     * @returns {Promise<Array>} Array of generated place suggestions
     */
    async generatePlaceSuggestions(story, directives) {
        try {
            const prompt = this.buildPlaceGenerationPrompt(story, directives);
            
            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 2000
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.aiService.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            const placeSuggestions = [];
            for (const placeData of result.places || []) {
                const placeSuggestion = await PlaceSuggestion.create({
                    storyId: story.id,
                    name: placeData.name,
                    high_level_description: placeData.high_level_description,
                    placeType: placeData.placeType || 'city',
                    atmosphere: placeData.atmosphere,
                    significance: placeData.significance || 'minor',
                    description: placeData.description,
                    keyFeatures: placeData.keyFeatures ? JSON.stringify(placeData.keyFeatures) : null,
                    inhabitants: placeData.inhabitants ? JSON.stringify(placeData.inhabitants) : null,
                    storyEvents: placeData.storyEvents ? JSON.stringify(placeData.storyEvents) : null,
                    relatedTags: placeData.relatedTags ? JSON.stringify(placeData.relatedTags) : null,
                    sourceDirectives: placeData.sourceDirectives ? JSON.stringify(placeData.sourceDirectives) : null,
                    confidence: placeData.confidence || 0.8
                });
                placeSuggestions.push(placeSuggestion);
            }

            console.log(`Generated ${placeSuggestions.length} place suggestions`);
            return placeSuggestions;

        } catch (error) {
            console.error('Error generating place suggestions:', error);
            return [];
        }
    }

    /**
     * Generate organization suggestions based on directives
     * @param {Object} story - Story object with related data
     * @param {Array} directives - Array of directive objects
     * @returns {Promise<Array>} Array of generated organization suggestions
     */
    async generateOrganizationSuggestions(story, directives) {
        try {
            const prompt = this.buildOrganizationGenerationPrompt(story, directives);
            
            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 2000
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.aiService.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            const organizationSuggestions = [];
            for (const orgData of result.organizations || []) {
                const organizationSuggestion = await CharacterOrganizationSuggestion.create({
                    storyId: story.id,
                    name: orgData.name,
                    high_level_description: orgData.high_level_description,
                    organizationType: orgData.organizationType || 'corporation',
                    alignment: orgData.alignment || 'neutral',
                    structure: orgData.structure,
                    purpose: orgData.purpose,
                    leadership: orgData.leadership,
                    membership: orgData.membership ? JSON.stringify(orgData.membership) : null,
                    resources: orgData.resources ? JSON.stringify(orgData.resources) : null,
                    conflicts: orgData.conflicts ? JSON.stringify(orgData.conflicts) : null,
                    storyRole: orgData.storyRole || 'neutral',
                    relatedTags: orgData.relatedTags ? JSON.stringify(orgData.relatedTags) : null,
                    sourceDirectives: orgData.sourceDirectives ? JSON.stringify(orgData.sourceDirectives) : null,
                    confidence: orgData.confidence || 0.8
                });
                organizationSuggestions.push(organizationSuggestion);
            }

            console.log(`Generated ${organizationSuggestions.length} organization suggestions`);
            return organizationSuggestions;

        } catch (error) {
            console.error('Error generating organization suggestions:', error);
            return [];
        }
    }

    /**
     * Generate object suggestions based on directives
     * @param {Object} story - Story object with related data
     * @param {Array} directives - Array of directive objects
     * @returns {Promise<Array>} Array of generated object suggestions
     */
    async generateObjectSuggestions(story, directives) {
        try {
            const prompt = this.buildObjectGenerationPrompt(story, directives);
            
            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 2000
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.aiService.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            const objectSuggestions = [];
            for (const objectData of result.objects || []) {
                const objectSuggestion = await NotableObjectSuggestion.create({
                    storyId: story.id,
                    name: objectData.name,
                    high_level_description: objectData.high_level_description,
                    objectType: objectData.objectType || 'artifact',
                    rarity: objectData.rarity || 'uncommon',
                    significance: objectData.significance || 'character_important',
                    description: objectData.description,
                    properties: objectData.properties ? JSON.stringify(objectData.properties) : null,
                    history: objectData.history,
                    currentOwner: objectData.currentOwner,
                    storyEvents: objectData.storyEvents ? JSON.stringify(objectData.storyEvents) : null,
                    relatedTags: objectData.relatedTags ? JSON.stringify(objectData.relatedTags) : null,
                    sourceDirectives: objectData.sourceDirectives ? JSON.stringify(objectData.sourceDirectives) : null,
                    confidence: objectData.confidence || 0.8
                });
                objectSuggestions.push(objectSuggestion);
            }

            console.log(`Generated ${objectSuggestions.length} object suggestions`);
            return objectSuggestions;

        } catch (error) {
            console.error('Error generating object suggestions:', error);
            return [];
        }
    }

    /**
     * Build prompt for arc generation
     */
    buildArcGenerationPrompt(story, directives) {
        const directiveContext = directives.map(d => 
            `* ${d.directive.id} - "${d.directive}" (Tag: ${d.tag.title}) (Aim: ${d.directive_aim})`
        ).join('\n');

        return `Based on the following story and its accepted tag directives, generate 3-5 compelling story arcs that could expand the narrative:

STORY CONTEXT:
Title: ${story.title}
Brainstorm: ${story.brainstorm || 'No brainstorm provided'}

CURRENT TAGS:
${this.getStoryTags(story).map(tag => `- ${tag.title}: ${tag.short_description}`).join('\n')}

ACCEPTED DIRECTIVES:
${directiveContext}

Generate story arcs that:
1. Build upon the established themes and directions from the directives
2. Create compelling character development opportunities
3. Introduce new plot elements that complement existing ones
4. Vary in complexity and duration
5. Feel natural and integrated with the story's world

Provide a JSON response with:
{
  "arcs": [
    {
      "name": "Arc name",
      "high_level_description": "Brief description of the arc concept",
      "arcType": "character_arc|plot_arc|relationship_arc|world_arc|theme_arc",
      "complexity": "simple|moderate|complex|epic",
      "estimatedDuration": "short|medium|long|series_spanning",
      "keyEvents": ["Event 1", "Event 2", "Event 3"],
      "characterInvolvement": ["Character 1", "Character 2"],
      "relatedTags": [tagId1, tagId2],
      "sourceDirectives": [directiveId1, directiveId2],
      "confidence": 0.8
    }
  ]
}

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;
    }

    /**
     * Build prompt for character generation
     */
    buildCharacterGenerationPrompt(story, directives, count = null) {
        const directiveContext = directives.map(d => 
            `* ${d.id} - "${d.directive}" (Aim: ${d.directive_aim})`
        ).join('\n');

        const characterCount = count !== null ? count : '4-6';

        return `Based on the following story and its accepted tag directives, generate ${characterCount} compelling character suggestions that could enrich the narrative:

STORY CONTEXT:
Title: ${story.title}
Brainstorm: ${story.brainstorm || 'No brainstorm provided'}

ACCEPTED DIRECTIVES:
${directiveContext}

Generate characters that:
1. Serve different story functions (protagonist, antagonist, supporting, etc.)
2. Have clear motivations and personality traits
3. Create interesting dynamics with existing story elements
4. Feel authentic to the story's genre and setting
5. Offer opportunities for character development and conflict

Provide a JSON response with:
{
  "characters": [
    {
      "name": "Character name",
      "high_level_description": "Brief description of the character concept",
      "characterType": "protagonist|antagonist|supporting|mentor|love_interest|comic_relief|foil|deuteragonist",
      "archetype": "Hero|Mentor|Trickster|etc.",
      "personalityTraits": ["Trait 1", "Trait 2", "Trait 3"],
      "background": "Character background and history",
      "motivations": ["Motivation 1", "Motivation 2"],
      "relationships": ["Relationship with Character A", "Relationship with Character B"],
      "sourceDirectives": [directiveId1, directiveId2],
      "confidence": 0.8
    }
  ]
}

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;
    }

    /**
     * Build prompt for place generation
     */
    buildPlaceGenerationPrompt(story, directives) {
        const directiveContext = directives.map(d => 
            `* ${d.directive.id} - "${d.directive}" (Tag: ${d.tag.title}) (Aim: ${d.directive_aim})`
        ).join('\n');

        return `Based on the following story and its accepted tag directives, generate 3-5 compelling location/place suggestions that could enrich the story's world:

STORY CONTEXT:
Title: ${story.title}
Brainstorm: ${story.brainstorm || 'No brainstorm provided'}

CURRENT TAGS:
${this.getStoryTags(story).map(tag => `- ${tag.title}: ${tag.short_description}`).join('\n')}

ACCEPTED DIRECTIVES:
${directiveContext}

Generate places that:
1. Serve different story functions (major plot locations, character homes, atmospheric settings)
2. Have distinct atmospheres and significance levels
3. Create opportunities for interesting story events
4. Feel authentic to the story's genre and setting
5. Offer world-building opportunities

Provide a JSON response with:
{
  "places": [
    {
      "name": "Place name",
      "high_level_description": "Brief description of the place concept",
      "placeType": "city|town|village|castle|school|hospital|shop|restaurant|park|forest|mountain|beach|island|space_station|underground|fantasy_realm|historical_period|future_setting",
      "atmosphere": "mysterious|bustling|peaceful|etc.",
      "significance": "major|minor|background|pivotal",
      "description": "Detailed description of the place",
      "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
      "inhabitants": ["Type of inhabitant 1", "Type of inhabitant 2"],
      "storyEvents": ["Event that could happen here 1", "Event that could happen here 2"],
      "relatedTags": [tagId1, tagId2],
      "sourceDirectives": [directiveId1, directiveId2],
      "confidence": 0.8
    }
  ]
}

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;
    }

    /**
     * Build prompt for organization generation
     */
    buildOrganizationGenerationPrompt(story, directives) {
        const directiveContext = directives.map(d => 
            `* ${d.directive.id} - "${d.directive}" (Tag: ${d.tag.title}) (Aim: ${d.directive_aim})`
        ).join('\n');

        return `Based on the following story and its accepted tag directives, generate 2-4 compelling organization suggestions that could enrich the story's world:

STORY CONTEXT:
Title: ${story.title}
Brainstorm: ${story.brainstorm || 'No brainstorm provided'}

CURRENT TAGS:
${this.getStoryTags(story).map(tag => `- ${tag.title}: ${tag.short_description}`).join('\n')}

ACCEPTED DIRECTIVES:
${directiveContext}

Generate organizations that:
1. Serve different story functions (allies, antagonists, neutral parties)
2. Have clear purposes and structures
3. Create opportunities for conflict and cooperation
4. Feel authentic to the story's genre and setting
5. Offer world-building and character development opportunities

Provide a JSON response with:
{
  "organizations": [
    {
      "name": "Organization name",
      "high_level_description": "Brief description of the organization concept",
      "organizationType": "government|military|school|corporation|guild|gang|family|religious|secret_society|academy|hospital|research_institute|mercenary_group|resistance_movement|royal_court|council",
      "alignment": "good|neutral|evil|chaotic|lawful|complex",
      "structure": "hierarchy|democracy|oligarchy|etc.",
      "purpose": "Primary purpose and goals of the organization",
      "leadership": "Description of the organization's leadership",
      "membership": ["Member type 1", "Member type 2"],
      "resources": ["Resource 1", "Resource 2"],
      "conflicts": ["Conflict with Organization A", "Conflict with Character B"],
      "storyRole": "ally|antagonist|neutral|pivotal|background",
      "relatedTags": [tagId1, tagId2],
      "sourceDirectives": [directiveId1, directiveId2],
      "confidence": 0.8
    }
  ]
}

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;
    }

    /**
     * Build prompt for object generation
     */
    buildObjectGenerationPrompt(story, directives) {
        const directiveContext = directives.map(d => 
            `* ${d.directive.id} - "${d.directive}" (Tag: ${d.tag.title}) (Aim: ${d.directive_aim})`
        ).join('\n');

        return `Based on the following story and its accepted tag directives, generate 3-5 compelling notable object suggestions that could enrich the story:

STORY CONTEXT:
Title: ${story.title}
Brainstorm: ${story.brainstorm || 'No brainstorm provided'}

CURRENT TAGS:
${this.getStoryTags(story).map(tag => `- ${tag.title}: ${tag.short_description}`).join('\n')}

ACCEPTED DIRECTIVES:
${directiveContext}

Generate objects that:
1. Serve different story functions (plot-critical items, character possessions, world-building elements)
2. Have varying levels of significance and rarity
3. Create opportunities for interesting story events
4. Feel authentic to the story's genre and setting
5. Offer character development and world-building opportunities

Provide a JSON response with:
{
  "objects": [
    {
      "name": "Object name",
      "high_level_description": "Brief description of the object concept",
      "objectType": "weapon|artifact|tool|vehicle|clothing|jewelry|book|document|technology|magical_item|symbol|trophy|heirloom|currency|medicine|food|furniture|decoration",
      "rarity": "common|uncommon|rare|legendary|unique",
      "significance": "plot_critical|character_important|world_building|atmospheric|background",
      "description": "Detailed description of the object",
      "properties": ["Property 1", "Property 2", "Property 3"],
      "history": "History and origin of the object",
      "currentOwner": "Current owner or possessor",
      "storyEvents": ["Event involving this object 1", "Event involving this object 2"],
      "relatedTags": [tagId1, tagId2],
      "sourceDirectives": [directiveId1, directiveId2],
      "confidence": 0.8
    }
  ]
}

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;
    }

    /**
     * Get all story expansion suggestions for a story
     * @param {number} storyId - The ID of the story
     * @returns {Promise<Object>} Object containing all suggestions
     */
    async getStoryExpansion(storyId) {
        try {
            const [arcSuggestions, characterSuggestions, placeSuggestions, organizationSuggestions, objectSuggestions] = await Promise.all([
                ArcSuggestion.findAll({
                    where: { storyId, isActive: true },
                    order: [['confidence', 'DESC']]
                }),
                CharacterSuggestion.findAll({
                    where: { storyId, isActive: true },
                    order: [['confidence', 'DESC']]
                }),
                PlaceSuggestion.findAll({
                    where: { storyId, isActive: true },
                    order: [['confidence', 'DESC']]
                }),
                CharacterOrganizationSuggestion.findAll({
                    where: { storyId, isActive: true },
                    order: [['confidence', 'DESC']]
                }),
                NotableObjectSuggestion.findAll({
                    where: { storyId, isActive: true },
                    order: [['confidence', 'DESC']]
                })
            ]);

            return {
                storyId,
                arcSuggestions,
                characterSuggestions,
                placeSuggestions,
                organizationSuggestions,
                objectSuggestions
            };
        } catch (error) {
            console.error('Error getting story expansion:', error);
            throw error;
        }
    }
}

module.exports = StoryExpansionService; 