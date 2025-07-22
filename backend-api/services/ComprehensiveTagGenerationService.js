const { Story, Tag, TagSuggestion, TagRelationship, TagWorldBuildingEffect } = require('../models');
const AIService = require('./AIService');

class ComprehensiveTagGenerationService {
    constructor() {
        this.aiService = new AIService();
    }

    /**
     * Generate comprehensive tag suggestions for a story with iterative streaming
     * This is the main method that orchestrates the single-stage process with real-time updates
     * Note: Related tag and world-building effect generation are now handled separately per tag via user request
     */
    async *generateComprehensiveTagsIterative(storyTitle, storyBrainstorm, limit = false, storyId = null) {
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

            const relevantTags = await this.selectRelevantTags(storyTitle, storyBrainstorm, limit, storyId);
            console.log(`Selected ${relevantTags.length} relevant tags`);

            yield {
                stage: 1,
                stageName: 'Selecting Relevant Tags',
                progress: 1,
                total: 2,
                message: `Found ${relevantTags.length} relevant tags for your story. Generating detailed reasoning for high-scoring tags...`,
                data: { relevantTags }
            };

            // Generate reasoning for high-scoring tags (75%+ relevance)
            console.log('Generating reasoning for high-scoring tags...');
            yield {
                stage: 1,
                stageName: 'Generating Tag Reasoning',
                progress: 1,
                total: 2,
                message: 'Generating detailed reasoning for highly relevant tags...',
                data: null
            };

            const relevantTagsWithReasoning = await this.generateReasoningForHighScoringTags(relevantTags, storyTitle, storyBrainstorm);
            console.log(`Generated reasoning for ${relevantTagsWithReasoning.filter(tag => Number.parseInt(tag.relevanceScore) >= 75).length} high-scoring tags`);

            yield {
                stage: 1,
                stageName: 'Generating Tag Reasoning',
                progress: 2,
                total: 2,
                message: `Generated detailed reasoning for ${relevantTagsWithReasoning.filter(tag => tag.relevanceScore >= 75).length} high-scoring tags. Related tags and world-building effects can be generated individually per tag.`,
                data: { relevantTags: relevantTagsWithReasoning }
            };

            // Final result
            const finalResult = {
                relevantTags: relevantTagsWithReasoning,
                relatedTagsMap: {}, // Empty since related tags are generated separately
                worldBuildingEffects: [], // Empty since world-building effects are generated separately
                summary: {
                    totalRelevantTags: relevantTagsWithReasoning.length,
                    totalRelatedTags: 0, // Will be populated when users request related tags
                    totalWorldBuildingEffects: 0 // Will be populated when users request world-building effects
                }
            };

            // Automatically save results to database if storyId is provided
            if (storyId) {
                try {
                    console.log(`Auto-saving comprehensive results for story: ${storyId}`);
                    const savedResults = await this.saveComprehensiveResults(storyId, finalResult);
                    console.log('Comprehensive results auto-saved successfully');
                    
                    // Update the tags with their suggestionId values
                    const updatedRelevantTags = relevantTagsWithReasoning.map((tag, index) => ({
                        ...tag,
                        suggestionId: savedResults.tagSuggestions[index]?.id,
                        suggestionStatus: 'pending'
                    }));
                    
                    finalResult.relevantTags = updatedRelevantTags;
                } catch (error) {
                    console.error('Error auto-saving comprehensive results:', error);
                    // Don't fail the generation if saving fails
                }
            }

            yield {
                stage: 1,
                stageName: 'Generating Tag Reasoning',
                progress: 2,
                total: 2,
                message: 'Comprehensive tag analysis completed and saved! Related tags and world-building effects can be generated individually per tag.',
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
     * This is the main method that orchestrates the single-stage process
     * Note: Related tag and world-building effect generation are now handled separately per tag via user request
     */
    async generateComprehensiveTags(storyTitle, storyBrainstorm, limit = false) {
        try {
            console.log(`Starting comprehensive tag generation for story: ${storyTitle}`);
            
            // Stage 1: Select relevant tags based on story content
            console.log('Stage 1: Selecting relevant tags...');
            const relevantTags = await this.selectRelevantTags(storyTitle, storyBrainstorm, limit, null);
            console.log(`Selected ${relevantTags.length} relevant tags`);

            return {
                relevantTags,
                relatedTagsMap: {}, // Empty since related tags are generated separately
                worldBuildingEffects: [], // Empty since world-building effects are generated separately
                summary: {
                    totalRelevantTags: relevantTags.length,
                    totalRelatedTags: 0, // Will be populated when users request related tags
                    totalWorldBuildingEffects: 0 // Will be populated when users request world-building effects
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
    async selectRelevantTags(storyTitle, storyBrainstorm, limit = false, storyId = null) {
        try {
            // Get all available tags
            let allTags = await Tag.findAll({
                order: [['title', 'ASC']]
            });

            // If storyId is provided, filter out tags that have already been suggested to this story
            if (storyId) {
                const existingSuggestions = await TagSuggestion.findAll({
                    where: { 
                        storyId,
                        status: ['pending', 'accepted']
                    }
                });

                const existingTagIds = new Set(existingSuggestions.map(suggestion => suggestion.tagId));
                allTags = allTags.filter(tag => !existingTagIds.has(tag.id));
                
                console.log(`Filtered out ${existingSuggestions.length} already suggested tags. ${allTags.length} tags remaining.`);
            }

            // Process tags in batches of 20
            const batchSize = 20;
            const allScoredTags = [];
            
            for (let i = 0; i < allTags.length; i += batchSize) {
                const batch = allTags.slice(i, i + batchSize);
                console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allTags.length / batchSize)} (${batch.length} tags)`);
                
                const batchScoredTags = await this.processTagBatch(batch, storyTitle, storyBrainstorm);
                allScoredTags.push(...batchScoredTags);
                
                // Small delay between batches to avoid rate limiting
                if (i + batchSize < allTags.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Sort by relevance score (highest first)
            allScoredTags.sort((a, b) => b.relevanceScore - a.relevanceScore);

            // Apply limit if specified
            const finalTags = allScoredTags;

            return finalTags;
        } catch (error) {
            console.error('Error selecting relevant tags:', error);
            // Fallback to popular tags
            return this.getFallbackRelevantTags(limit);
        }
    }

    /**
     * Process a batch of tags for relevance scoring
     */
    async processTagBatch(tagBatch, storyTitle, storyBrainstorm) {
        try {
            const prompt = `Based on this story, analyze and score these anime/manga tags for relevance:

Story Title: ${storyTitle}
Story Brainstorm: ${storyBrainstorm}

Available Tags:
${tagBatch.map(tag => `- ID: ${tag.id}, Title: ${tag.title}, Description: ${tag.short_description}`).join('\n')}

Provide a JSON response for ALL of these tags:
1. "tagScores": Array of objects, each with:
   - "tagId": The exact ID number from the available tags list
   - "tagName": The exact title from the available tags list
   - "relevanceScore": Relevance score (0-100) for how well this tag matches the story

Consider:
- Genre relevance to the story themes
- Character archetypes and relationships
- Setting and world-building elements
- Tone and atmosphere
- Target audience appropriateness
- Story structure and pacing
- Thematic depth and meaning
- Emotional impact and mood
- Cultural and social elements

CRITICAL: 
- Use EXACT tagId and tagName values from the available tags list
- Score ALL tags in this batch (0-100 scale)
- Higher scores (75+) indicate strong relevance
- Lower scores (0-25) indicate poor relevance

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;

            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 4000
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.aiService.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            // Process the tag scores and find the actual tag objects
            const scoredTags = [];
            
            for (const tagScore of result.tagScores || []) {
                // Find the actual tag object by ID
                const tag = tagBatch.find(t => t.id === tagScore.tagId);
                
                if (tag) {
                    // Validate that tagName matches
                    if (tag.title !== tagScore.tagName) {
                        console.warn(`Tag ID ${tagScore.tagId} name mismatch: expected "${tag.title}", got "${tagScore.tagName}"`);
                    }
                    
                    scoredTags.push({
                        ...tag.toJSON(),
                        relevanceScore: tagScore.relevanceScore || 0
                    });
                } else {
                    console.warn(`Tag with ID ${tagScore.tagId} not found in current batch`);
                }
            }

            return scoredTags;
        } catch (error) {
            console.error('Error processing tag batch:', error);
            // Return basic scoring for this batch if AI processing fails
            return tagBatch.map(tag => ({
                ...tag.toJSON(),
                relevanceScore: 5 // Default low score
            }));
        }
    }

    /**
     * Generate reasoning for tags with high relevance scores (75%+)
     */
    async generateReasoningForHighScoringTags(tags, storyTitle, storyBrainstorm) {
        try {
            // Filter tags with relevance score >= 75
            const highScoringTags = tags.filter(tag => tag.relevanceScore >= 75);
            
            if (highScoringTags.length === 0) {
                console.log('No tags with relevance score >= 75 found');
                return tags;
            }

            console.log(`Generating reasoning for ${highScoringTags.length} high-scoring tags`);

            const prompt = `Generate detailed reasoning for why these tags are highly relevant to this story:

Story Title: ${storyTitle}
Story Brainstorm: ${storyBrainstorm}

High-Scoring Tags:
${highScoringTags.map(tag => `- ID: ${tag.id}, Title: ${tag.title}, Description: ${tag.short_description} (Category: ${tag.category}, Keywords: ${tag.keywords}), Score: ${tag.relevanceScore}`).join('\n')}

Provide a JSON response with:
1. "tagReasonings": Array of objects, each with:
   - "tagId": The exact ID number
   - "tagName": The exact title
   - "reasoning": Array of 2-3 detailed explanations for why this tag is highly relevant
   - "specificConnections": Array of specific story elements this tag connects to
   - "thematicRelevance": How this tag enhances the story's themes
   - "characterImpact": How this tag affects character development
   - "plotContribution": How this tag contributes to plot development

Consider:
- Direct connections to story elements
- Thematic resonance
- Character development opportunities
- Plot enhancement potential
- World-building contributions
- Emotional and atmospheric impact
- Genre conventions and expectations
- Target audience appeal

CRITICAL: Use EXACT tagId and tagName values. Provide specific, detailed reasoning.

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;

            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 3000
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.aiService.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            // Update tags with reasoning
            const updatedTags = tags.map(tag => {
                const reasoningData = result.tagReasonings?.find(r => r.tagId === tag.id);
                
                if (reasoningData && tag.relevanceScore >= 75) {
                    // Process reasoning array
                    let reasoning = 'AI-selected based on story content';
                    if (Array.isArray(reasoningData.reasoning) && reasoningData.reasoning.length > 0) {
                        reasoning = reasoningData.reasoning.join('; ');
                    } else if (typeof reasoningData.reasoning === 'string') {
                        reasoning = reasoningData.reasoning;
                    }

                    return {
                        ...tag,
                        selectionReasoning: reasoning,
                        specificConnections: reasoningData.specificConnections || [],
                        thematicRelevance: reasoningData.thematicRelevance || '',
                        characterImpact: reasoningData.characterImpact || '',
                        plotContribution: reasoningData.plotContribution || ''
                    };
                } else {
                    // For low-scoring tags, provide basic reasoning
                    return {
                        ...tag,
                        selectionReasoning: `Relevance score: ${tag.relevanceScore}% - ${tag.relevanceScore >= 50 ? 'Moderately relevant' : 'Low relevance'}`
                    };
                }
            });

            return updatedTags;
        } catch (error) {
            console.error('Error generating reasoning for high-scoring tags:', error);
            // Return tags with basic reasoning if generation fails
            return tags.map(tag => ({
                ...tag,
                selectionReasoning: `Relevance score: ${tag.relevanceScore}% - ${tag.relevanceScore >= 75 ? 'High relevance' : tag.relevanceScore >= 50 ? 'Moderate relevance' : 'Low relevance'}`
            }));
        }
    }

    /**
     * Stage 2: Generate related tags for each selected tag
     */
    async generateRelatedTags(relevantTags, relatedTagsPerTag = 3, storyId = null) {
        try {
            const relatedTagsMap = {};

            for (const tag of relevantTags) {
                console.log(`Generating related tags for: ${tag.title}`);
                
                try {
                    const relatedTags = await this.generateRelatedTagsForTag(tag, relatedTagsPerTag, storyId);
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
    async generateRelatedTagsForTag(tag, limit = 3, storyId = null) {
        try {
            // Get all available tags except the current one
            let allTags = await Tag.findAll({
                where: {
                    id: { [require('sequelize').Op.ne]: tag.id }
                },
                order: [['title', 'ASC']]
            });

            // If storyId is provided, filter out tags that have already been suggested to this story
            if (storyId) {
                const existingSuggestions = await TagSuggestion.findAll({
                    where: { 
                        storyId,
                        status: ['pending', 'accepted']
                    }
                });

                const existingTagIds = new Set(existingSuggestions.map(suggestion => suggestion.tagId));
                allTags = allTags.filter(tag => !existingTagIds.has(tag.id));
                
                console.log(`Filtered out ${existingSuggestions.length} already suggested tags from related tags. ${allTags.length} tags remaining.`);
            }

            const prompt = `Based on this anime/manga tag, suggest ${limit} related tags that would complement it well:

Focus Tag:
- ID: ${tag.id}, Title: ${tag.title}, Description: ${tag.short_description} (Category: ${tag.category}, Keywords: ${tag.keywords})

Available Tags:
${allTags.map(t => `- ID: ${t.id}, Title: ${t.title}, Description: ${t.short_description} (Category: ${t.category}, Keywords: ${t.keywords})`).join('\n')}

Provide a JSON response with:
1. "relatedTags": Array of ${limit} objects, each with:
   - "tagId": The exact ID number from the available tags list
   - "tagName": The exact title from the available tags list
   - "relationshipType": One of: complementary, synergistic, thematic, genre_related, setting_related
   - "reasoning": Array of 2-3 detailed explanations for why this tag is related
   - "confidence": Confidence score (0-1) for this relationship
2. "overallSynergy": Overall synergy score (1-10) for how well the related tags work together

Consider:
- Genre compatibility
- Theme synergies
- Target audience overlaps
- Storytelling potential
- World-building opportunities

CRITICAL: Use EXACT tagId and tagName values from the available tags list. Do not create new names or IDs.

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

            // Process the structured tag objects
            const relatedTagsWithInfo = [];
            
            for (const relatedTagData of result.relatedTags || []) {
                // Find the actual tag object by ID
                const relatedTag = allTags.find(t => t.id === relatedTagData.tagId);
                
                if (relatedTag) {
                    // Validate that tagName matches
                    if (relatedTag.title !== relatedTagData.tagName) {
                        console.warn(`Related tag ID ${relatedTagData.tagId} name mismatch: expected "${relatedTag.title}", got "${relatedTagData.tagName}"`);
                    }
                    
                    // Process reasoning array
                    let reasoning = 'AI-determined relationship';
                    if (Array.isArray(relatedTagData.reasoning) && relatedTagData.reasoning.length > 0) {
                        reasoning = relatedTagData.reasoning.join('; ');
                    } else if (typeof relatedTagData.reasoning === 'string') {
                        reasoning = relatedTagData.reasoning;
                    }

                    const relationshipType = relatedTagData.relationshipType || 'complementary';
                    const confidence = relatedTagData.confidence || 0.8;

                    relatedTagsWithInfo.push({
                        ...relatedTag.toJSON(),
                        relationshipType,
                        relationshipReasoning: reasoning,
                        confidence
                    });
                } else {
                    console.warn(`Related tag with ID ${relatedTagData.tagId} not found in available tags`);
                }
            }

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

Provide a comprehensive JSON response with world-building effects:

1. "effects": Array of 4-6 world-building effects, each with:
   - "effectType": One of: setting, character, plot, atmosphere, theme, conflict, resolution, pacing, audience_engagement, cultural_impact
   - "title": Short title for this effect
   - "description": Detailed description of how this tag affects world-building
   - "impactLevel": One of: minor, moderate, major, transformative
   - "storyElements": Array of story elements this affects (characters, setting, plot points, etc.)
   - "examples": Array of 2-3 example scenarios or story moments
   - "conflicts": Array of potential conflicts or challenges this introduces
   - "synergies": Array of other tags that would work well with this one
   - "developmentOpportunities": Array of character/plot development opportunities
   - "audienceAppeal": How this affects different audience segments

Consider these comprehensive aspects:
- How this tag shapes the story's setting and atmosphere
- Character development, relationships, and growth opportunities
- Plot structure, pacing, and narrative flow
- Thematic depth, symbolism, and meaning
- Conflict generation and resolution possibilities
- World-building consistency and believability
- Audience engagement and emotional impact
- Cultural and social implications
- Story pacing and structure
- Character motivation and goals
- Setting details and environmental factors
- Tone and mood establishment
- Genre expectations and conventions
- Target audience preferences and expectations

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;

            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 2500
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

            console.log(`Saved ${savedResults.tagSuggestions.length} tag suggestions to database`);
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