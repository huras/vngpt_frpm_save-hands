const { Story, Tag, TagSuggestion, TagRelationship, TagWorldBuildingEffect } = require('../models');
const AIService = require('./AIService');

class ComprehensiveTagGenerationService {
    constructor() {
        this.aiService = new AIService();
    }

    /**
     * Generate comprehensive tag suggestions for a story with iterative streaming
     * This is the main method that orchestrates the three-stage process with real-time updates
     */
    async *generateComprehensiveTagsIterative(storyTitle, storyBrainstorm, limit = 10) {
        try {
            console.log(`Starting iterative comprehensive tag generation for story: ${storyTitle}`);
            
            // Stage 1: Select relevant tags based on story content
            console.log('Stage 1: Selecting relevant tags...');
            yield {
                stage: 1,
                stageName: 'Selecting Relevant Tags',
                progress: 0,
                total: 1,
                message: 'Analyzing story content and selecting relevant tags...',
                data: null
            };

            const relevantTags = await this.selectRelevantTags(storyTitle, storyBrainstorm, limit);
            console.log(`Selected ${relevantTags.length} relevant tags`);

            yield {
                stage: 1,
                stageName: 'Selecting Relevant Tags',
                progress: 1,
                total: 1,
                message: `Found ${relevantTags.length} relevant tags for your story`,
                data: { relevantTags }
            };

            // Stage 2: Generate related tags for each selected tag
            console.log('Stage 2: Generating related tags...');
            const relatedTagsMap = {};
            const totalRelatedTags = relevantTags.length;

            for (let i = 0; i < relevantTags.length; i++) {
                const tag = relevantTags[i];
                console.log(`Generating related tags for: ${tag.title} (${i + 1}/${totalRelatedTags})`);
                
                yield {
                    stage: 2,
                    stageName: 'Generating Related Tags',
                    progress: i,
                    total: totalRelatedTags,
                    message: `Finding related tags for "${tag.title}"...`,
                    data: { 
                        relevantTags,
                        relatedTagsMap: { ...relatedTagsMap },
                        currentTag: tag
                    }
                };

                try {
                    const relatedTags = await this.generateRelatedTagsForTag(tag, 3);
                    relatedTagsMap[tag.id] = relatedTags;
                    console.log(`Generated ${relatedTags.length} related tags for ${tag.title}`);
                } catch (error) {
                    console.error(`Error generating related tags for ${tag.title}:`, error);
                    relatedTagsMap[tag.id] = [];
                }
            }

            yield {
                stage: 2,
                stageName: 'Generating Related Tags',
                progress: totalRelatedTags,
                total: totalRelatedTags,
                message: `Generated related tags for all ${totalRelatedTags} tags`,
                data: { 
                    relevantTags,
                    relatedTagsMap
                }
            };

            // Stage 3: Generate world-building effects for each tag
            console.log('Stage 3: Generating world-building effects...');
            const worldBuildingEffects = [];

            for (let i = 0; i < relevantTags.length; i++) {
                const tag = relevantTags[i];
                console.log(`Generating world-building effects for: ${tag.title} (${i + 1}/${totalRelatedTags})`);
                
                yield {
                    stage: 3,
                    stageName: 'Generating World-Building Effects',
                    progress: i,
                    total: totalRelatedTags,
                    message: `Analyzing world-building effects for "${tag.title}"...`,
                    data: { 
                        relevantTags,
                        relatedTagsMap,
                        worldBuildingEffects: [...worldBuildingEffects],
                        currentTag: tag
                    }
                };

                try {
                    const effects = await this.generateWorldBuildingEffectsForTag(
                        tag, 
                        storyTitle, 
                        storyBrainstorm
                    );
                    worldBuildingEffects.push({
                        tagId: tag.id,
                        tagTitle: tag.title,
                        effects
                    });
                    console.log(`Generated ${effects.length} world-building effects for ${tag.title}`);
                } catch (error) {
                    console.error(`Error generating world-building effects for ${tag.title}:`, error);
                    worldBuildingEffects.push({
                        tagId: tag.id,
                        tagTitle: tag.title,
                        effects: []
                    });
                }
            }

            // Final result
            const finalResult = {
                relevantTags,
                relatedTagsMap,
                worldBuildingEffects,
                summary: {
                    totalRelevantTags: relevantTags.length,
                    totalRelatedTags: Object.values(relatedTagsMap).flat().length,
                    totalWorldBuildingEffects: worldBuildingEffects.length
                }
            };

            yield {
                stage: 3,
                stageName: 'Generating World-Building Effects',
                progress: totalRelatedTags,
                total: totalRelatedTags,
                message: 'Comprehensive tag analysis completed!',
                data: finalResult,
                completed: true
            };

        } catch (error) {
            console.error('Error in iterative comprehensive tag generation:', error);
            yield {
                stage: 'error',
                stageName: 'Error',
                progress: 0,
                total: 1,
                message: 'An error occurred during tag generation',
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Generate comprehensive tag suggestions for a story (legacy method)
     * This is the main method that orchestrates the three-stage process
     */
    async generateComprehensiveTags(storyTitle, storyBrainstorm, limit = 10) {
        try {
            console.log(`Starting comprehensive tag generation for story: ${storyTitle}`);
            
            // Stage 1: Select relevant tags based on story content
            console.log('Stage 1: Selecting relevant tags...');
            const relevantTags = await this.selectRelevantTags(storyTitle, storyBrainstorm, limit);
            console.log(`Selected ${relevantTags.length} relevant tags`);

            // Stage 2: Generate related tags for each selected tag
            console.log('Stage 2: Generating related tags...');
            const relatedTagsMap = await this.generateRelatedTags(relevantTags);
            console.log(`Generated related tags for ${Object.keys(relatedTagsMap).length} tags`);

            // Stage 3: Generate world-building effects for each tag
            console.log('Stage 3: Generating world-building effects...');
            const worldBuildingEffects = await this.generateWorldBuildingEffects(
                relevantTags, 
                storyTitle, 
                storyBrainstorm
            );
            console.log(`Generated world-building effects for ${worldBuildingEffects.length} tags`);

            return {
                relevantTags,
                relatedTagsMap,
                worldBuildingEffects,
                summary: {
                    totalRelevantTags: relevantTags.length,
                    totalRelatedTags: Object.values(relatedTagsMap).flat().length,
                    totalWorldBuildingEffects: worldBuildingEffects.length
                }
            };
        } catch (error) {
            console.error('Error in comprehensive tag generation:', error);
            throw error;
        }
    }

    /**
     * Stage 1: Select relevant tags based on story content
     */
    async selectRelevantTags(storyTitle, storyBrainstorm, limit = 10) {
        try {
            // Get all available tags
            const allTags = await Tag.findAll({
                order: [['title', 'ASC']]
            });

            const prompt = `Based on this story, select ${limit} most relevant anime/manga tags:

Story Title: ${storyTitle}
Story Brainstorm: ${storyBrainstorm}

Available Tags:
${allTags.map(tag => `- ${tag.title}: ${tag.short_description} (Category: ${tag.category}, Keywords: ${tag.keywords})`).join('\n')}

Provide a JSON response with:
1. "selectedTags": Array of ${limit} tag titles that are most relevant to this story
2. "reasoning": Brief explanation for why each tag was selected
3. "relevanceScore": Overall relevance score (1-10) for how well the tags match the story

Consider:
- Genre relevance to the story themes
- Character archetypes and relationships
- Setting and world-building elements
- Tone and atmosphere
- Target audience appropriateness
- Story structure and pacing

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;

            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 1500
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.aiService.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            // Find the actual tag objects for the selected titles
            const selectedTags = result.selectedTags
                .map(title => allTags.find(tag => tag.title === title))
                .filter(tag => tag) // Remove any not found
                .slice(0, limit);

            // Add reasoning to each tag
            const tagsWithReasoning = selectedTags.map((tag, index) => {
                let reason = '';
                
                if (Array.isArray(result.reasoning)) {
                    reason = result.reasoning[index] || result.reasoning[0] || 'AI-selected based on story content';
                } else if (typeof result.reasoning === 'string') {
                    reason = result.reasoning;
                } else {
                    reason = 'AI-selected based on story content';
                }

                return {
                    ...tag.toJSON(),
                    selectionReasoning: reason,
                    relevanceScore: result.relevanceScore || 7
                };
            });

            return tagsWithReasoning;
        } catch (error) {
            console.error('Error selecting relevant tags:', error);
            // Fallback to popular tags
            return this.getFallbackRelevantTags(limit);
        }
    }

    /**
     * Stage 2: Generate related tags for each selected tag
     */
    async generateRelatedTags(relevantTags, relatedTagsPerTag = 3) {
        try {
            const relatedTagsMap = {};

            for (const tag of relevantTags) {
                console.log(`Generating related tags for: ${tag.title}`);
                
                try {
                    const relatedTags = await this.generateRelatedTagsForTag(tag, relatedTagsPerTag);
                    relatedTagsMap[tag.id] = relatedTags;
                } catch (error) {
                    console.error(`Error generating related tags for ${tag.title}:`, error);
                    relatedTagsMap[tag.id] = [];
                }
            }

            return relatedTagsMap;
        } catch (error) {
            console.error('Error generating related tags:', error);
            return {};
        }
    }

    /**
     * Generate related tags for a specific tag
     */
    async generateRelatedTagsForTag(tag, limit = 3) {
        try {
            // Get all available tags except the current one
            const allTags = await Tag.findAll({
                where: {
                    id: { [require('sequelize').Op.ne]: tag.id }
                },
                order: [['title', 'ASC']]
            });

            const prompt = `Based on this anime/manga tag, suggest ${limit} related tags that would complement it well:

Focus Tag:
- ${tag.title}: ${tag.short_description} (Category: ${tag.category}, Keywords: ${tag.keywords})

Available Tags:
${allTags.map(t => `- ${t.title}: ${t.short_description} (Category: ${t.category}, Keywords: ${t.keywords})`).join('\n')}

Provide a JSON response with:
1. "relatedTags": Array of ${limit} tag titles that work well with the focus tag
2. "relationshipTypes": Array of relationship types for each related tag (complementary, synergistic, thematic, genre_related, setting_related)
3. "reasoning": Array of brief explanations for why each tag is related
4. "confidence": Array of confidence scores (0-1) for each relationship

Consider:
- Genre compatibility
- Theme synergies
- Target audience overlaps
- Storytelling potential
- World-building opportunities

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;

            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 1000
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.aiService.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            // Find the actual tag objects for the related titles
            const relatedTags = result.relatedTags
                .map(title => allTags.find(t => t.title === title))
                .filter(t => t) // Remove any not found
                .slice(0, limit);

            // Add relationship information to each tag
            const relatedTagsWithInfo = relatedTags.map((relatedTag, index) => {
                const relationshipType = result.relationshipTypes?.[index] || 'complementary';
                const reasoning = result.reasoning?.[index] || 'AI-determined relationship';
                const confidence = result.confidence?.[index] || 0.8;

                return {
                    ...relatedTag.toJSON(),
                    relationshipType,
                    relationshipReasoning: reasoning,
                    confidence
                };
            });

            return relatedTagsWithInfo;
        } catch (error) {
            console.error(`Error generating related tags for ${tag.title}:`, error);
            return [];
        }
    }

    /**
     * Stage 3: Generate world-building effects for each tag
     */
    async generateWorldBuildingEffects(relevantTags, storyTitle, storyBrainstorm) {
        try {
            const worldBuildingEffects = [];

            for (const tag of relevantTags) {
                console.log(`Generating world-building effects for: ${tag.title}`);
                
                try {
                    const effects = await this.generateWorldBuildingEffectsForTag(
                        tag, 
                        storyTitle, 
                        storyBrainstorm
                    );
                    worldBuildingEffects.push({
                        tagId: tag.id,
                        tagTitle: tag.title,
                        effects
                    });
                } catch (error) {
                    console.error(`Error generating world-building effects for ${tag.title}:`, error);
                    worldBuildingEffects.push({
                        tagId: tag.id,
                        tagTitle: tag.title,
                        effects: []
                    });
                }
            }

            return worldBuildingEffects;
        } catch (error) {
            console.error('Error generating world-building effects:', error);
            return [];
        }
    }

    /**
     * Generate world-building effects for a specific tag
     */
    async generateWorldBuildingEffectsForTag(tag, storyTitle, storyBrainstorm) {
        try {
            const prompt = `Analyze how this anime/manga tag would affect the world-building of this story:

Tag: ${tag.title}
Tag Description: ${tag.short_description}
Tag Category: ${tag.category}
Tag Keywords: ${tag.keywords}

Story Title: ${storyTitle}
Story Brainstorm: ${storyBrainstorm}

Provide a JSON response with world-building effects:

1. "effects": Array of 3-5 world-building effects, each with:
   - "effectType": One of: setting, character, plot, atmosphere, theme, conflict, resolution
   - "title": Short title for this effect
   - "description": Detailed description of how this tag affects world-building
   - "impactLevel": One of: minor, moderate, major, transformative
   - "storyElements": Array of story elements this affects (characters, setting, plot points, etc.)
   - "examples": Array of 2-3 example scenarios or story moments
   - "conflicts": Array of potential conflicts or challenges this introduces
   - "synergies": Array of other tags that would work well with this one

Consider:
- How this tag shapes the story's setting and atmosphere
- Character development and relationships
- Plot opportunities and conflicts
- Thematic depth and meaning
- Story pacing and structure
- Audience engagement and appeal

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;

            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 2000
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.aiService.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            return result.effects || [];
        } catch (error) {
            console.error(`Error generating world-building effects for ${tag.title}:`, error);
            return [];
        }
    }

    /**
     * Save comprehensive tag generation results to database
     */
    async saveComprehensiveResults(storyId, results) {
        try {
            const savedResults = {
                tagSuggestions: [],
                tagRelationships: [],
                worldBuildingEffects: []
            };

            // Save tag suggestions
            for (const tag of results.relevantTags) {
                const suggestion = await TagSuggestion.create({
                    storyId,
                    tagId: tag.id,
                    reasoning: tag.selectionReasoning,
                    confidence: tag.relevanceScore / 10, // Convert to 0-1 scale
                    status: 'pending',
                    suggestionType: 'comprehensive_generation'
                });
                savedResults.tagSuggestions.push(suggestion);
            }

            // Save tag relationships
            for (const [sourceTagId, relatedTags] of Object.entries(results.relatedTagsMap)) {
                for (const relatedTag of relatedTags) {
                    const relationship = await TagRelationship.create({
                        sourceTagId: parseInt(sourceTagId),
                        relatedTagId: relatedTag.id,
                        relationshipType: relatedTag.relationshipType,
                        confidence: relatedTag.confidence,
                        reasoning: relatedTag.relationshipReasoning
                    });
                    savedResults.tagRelationships.push(relationship);
                }
            }

            // Save world-building effects
            for (const tagEffects of results.worldBuildingEffects) {
                for (const effect of tagEffects.effects) {
                    const worldBuildingEffect = await TagWorldBuildingEffect.create({
                        tagId: tagEffects.tagId,
                        effectType: effect.effectType,
                        title: effect.title,
                        description: effect.description,
                        impactLevel: effect.impactLevel,
                        storyElements: JSON.stringify(effect.storyElements || []),
                        examples: JSON.stringify(effect.examples || []),
                        conflicts: JSON.stringify(effect.conflicts || []),
                        synergies: JSON.stringify(effect.synergies || []),
                        confidence: effect.confidence || 0.8
                    });
                    savedResults.worldBuildingEffects.push(worldBuildingEffect);
                }
            }

            return savedResults;
        } catch (error) {
            console.error('Error saving comprehensive results:', error);
            throw error;
        }
    }

    /**
     * Fallback method for selecting relevant tags
     */
    getFallbackRelevantTags(limit = 10) {
        // Return some popular tags as fallback
        return [
            { id: 1, title: 'Fantasy', short_description: 'Fantasy elements and magic', category: 'genre', keywords: 'fantasy,magic,supernatural', selectionReasoning: 'Popular genre tag', relevanceScore: 5 },
            { id: 2, title: 'Adventure', short_description: 'Adventure and exploration', category: 'genre', keywords: 'adventure,exploration,quest', selectionReasoning: 'Common story element', relevanceScore: 5 },
            { id: 3, title: 'Romance', short_description: 'Romantic relationships', category: 'genre', keywords: 'romance,love,relationships', selectionReasoning: 'Popular story element', relevanceScore: 5 }
        ].slice(0, limit);
    }
}

module.exports = ComprehensiveTagGenerationService; 