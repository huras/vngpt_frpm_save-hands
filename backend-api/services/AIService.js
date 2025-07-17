const OpenAI = require('openai');

class AIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async generateEmbedding(text) {
        try {
            const response = await this.openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: text,
                encoding_format: "float"
            });
            return response.data[0].embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            return null;
        }
    }

    cleanAIResponse(content) {
        try {
            // Remove markdown code blocks
            let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

            // Remove any leading/trailing whitespace
            cleaned = cleaned.trim();

            // If it still doesn't look like JSON, try to extract JSON from the content
            if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
                // Try to find JSON object in the content
                const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    cleaned = jsonMatch[0];
                }
            }

            return cleaned;
        } catch (error) {
            console.error('Error cleaning AI response:', error);
            return content; // Return original if cleaning fails
        }
    }

    async generateTagInsights(tagTitle, tagDescription, tagKeywords, tagCategory) {
        try {
            const prompt = `Analyze this anime/manga tag and provide insights:

Tag: ${tagTitle}
Description: ${tagDescription}
Keywords: ${tagKeywords}
Category: ${tagCategory}

Provide a JSON response with:
1. "insights": 2-3 sentences about what this tag represents and its appeal
2. "target_audience": Who typically enjoys this type of content
3. "common_themes": 3-5 themes commonly associated with this tag
4. "recommendation_strength": A score from 1-10 indicating how strong this tag is for recommendations

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 300
            });

            const content = response.choices[0].message.content;

            // Clean the content to extract pure JSON
            const cleanedContent = this.cleanAIResponse(content);
            return JSON.parse(cleanedContent);
        } catch (error) {
            console.error('Error generating tag insights:', error);
            return {
                insights: `This tag represents ${tagTitle.toLowerCase()} content with various themes and appeal.`,
                target_audience: 'General audience',
                common_themes: ['theme1', 'theme2', 'theme3'],
                recommendation_strength: 5
            };
        }
    }

    async generateRecommendations(selectedTags, allTags, limit = 8, storyBrainstorm = null, forceNew = false, focusedMode = false, focusTag = null, selectedTagIds = []) {
            try {
                // If no tags selected but brainstorm is available, generate content-based recommendations
                if ((!selectedTags || selectedTags.length === 0) && storyBrainstorm && storyBrainstorm.trim()) {
                    return this.generateContentBasedRecommendations(allTags, limit, storyBrainstorm, forceNew, selectedTagIds);
                }

                // If no tags selected and no brainstorm, return popular tags
                if (!selectedTags || selectedTags.length === 0) {
                    return this.getPopularTags(allTags, limit);
                }

                // Simple filtering: exclude already selected tags
                const availableTags = allTags.filter(tag => 
                    !selectedTagIds.includes(tag.id)
                );

                // If no available tags, return fallback
                if (availableTags.length === 0) {
                    return this.getFallbackRecommendations(selectedTags, allTags, limit, storyBrainstorm);
                }

                const selectedTagInfo = selectedTags.map(tag => ({
                    title: tag.title,
                    description: tag.short_description,
                    keywords: tag.keywords,
                    category: tag.category
                }));

                let prompt = '';

                if (focusedMode && focusTag) {
                    prompt = `Based on this specific anime/manga tag, recommend ${limit} additional tag${limit === 1 ? '' : 's'} that would complement it well:

Focus Tag:
- ${focusTag.title}: ${focusTag.short_description} (Category: ${focusTag.category}, Keywords: ${focusTag.keywords})`;
                } else {
                    prompt = `Based on these selected anime/manga tags, recommend ${limit} additional tag${limit === 1 ? '' : 's'} that would complement them well:

Selected Tags:
${selectedTagInfo.map(tag => `- ${tag.title}: ${tag.description} (Category: ${tag.category}, Keywords: ${tag.keywords})`).join('\n')}`;
                }

                if (storyBrainstorm && storyBrainstorm.trim()) {
                    prompt += `\n\nStory Brainstorm/Content:
${storyBrainstorm.trim()}

Please consider the story content above when making recommendations.`;
                }

                prompt += `\n\nAvailable Tags:
${availableTags.map(tag => `- ${tag.title}: ${tag.short_description} (Keywords: ${tag.keywords})`).join('\n')}

Provide a JSON response with:
1. "recommendations": Array of ${limit} tag title${limit === 1 ? '' : 's'} that would work well ${focusedMode ? 'with the focus tag' : 'with the selected tags'}${storyBrainstorm ? ' and story content' : ''}
2. "reasoning": Brief explanation for the recommendation${limit === 1 ? '' : 's'}
3. "compatibility_score": Overall compatibility score (1-10)

Consider:
- Genre compatibility
- Theme synergies
- Target audience overlaps
- ${storyBrainstorm ? 'Story content and themes' : ''}
- Only suggest tags from the available tags list above

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;

            const temperature = forceNew ? 1.0 : 0.8;
            
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
                temperature: temperature,
                max_tokens: 1200
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            // Find the actual tag objects for the recommended titles
            const recommendedTags = result.recommendations
                .map(title => availableTags.find(tag => tag.title === title))
                .filter(tag => tag) // Remove any not found
                .slice(0, limit);

            // Add reasoning to each individual recommendation
            const recommendationsWithReasoning = recommendedTags.map((tag, index) => {
                let reason = '';
                
                if (Array.isArray(result.reasoning)) {
                    reason = result.reasoning[index] || result.reasoning[0] || 'AI-powered recommendation';
                } else if (typeof result.reasoning === 'string') {
                    reason = result.reasoning;
                } else {
                    reason = 'AI-powered recommendation based on tag compatibility';
                }

                return {
                    ...tag.toJSON(),
                    reason: reason
                };
            });

            return {
                recommendations: recommendationsWithReasoning,
                reasoning: result.reasoning || 'AI-powered recommendations based on tag compatibility',
                compatibility_score: result.compatibility_score || 7
            };
        } catch (error) {
            console.error('Error generating AI recommendations:', error);
            return this.getFallbackRecommendations(selectedTags, allTags, limit, storyBrainstorm);
        }
    }

    async generateContentBasedRecommendations(allTags, limit = 8, storyBrainstorm, forceNew = false, selectedTagIds = []) {
        try {
            const isSingleRecommendation = limit === 1;
            
            // Filter out already selected tags
            const availableTags = allTags.filter(tag => 
                !selectedTagIds.includes(tag.id)
            );
            
            const prompt = `Based on this story content/brainstorm, recommend ${limit} anime/manga tag${limit === 1 ? '' : 's'} that would be most relevant and suitable:

Story Content:
${storyBrainstorm.trim()}

Available Tags (excluding already selected ones):
${availableTags.map(tag => `- ${tag.title}: ${tag.short_description} (Keywords: ${tag.keywords})`).join('\n')}

Provide a JSON response with:
1. "recommendations": Array of ${limit} tag title${limit === 1 ? '' : 's'} that best match the story content
2. "reasoning": ${isSingleRecommendation ? 'Brief explanation for this recommendation' : 'Brief explanation for each recommendation'}
3. "compatibility_score": Overall relevance score (1-10) for how well the tags match the story content

Consider:
- Genre relevance to the story themes
- Tone and atmosphere matching
- Character archetypes and relationships
- Setting and world-building elements
- Target audience appropriateness
- Story structure and pacing
- IMPORTANT: Only suggest tags from the available tags list above
- Provide a unique recommendation that hasn't been suggested before
- Avoid suggesting the same tags repeatedly

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;

            // Adjust temperature based on forceNew parameter
            const temperature = forceNew ? 1.0 : 0.8;
            
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
                temperature: temperature,
                max_tokens: 1200
            });

            const content = response.choices[0].message.content;
            
            // Clean the content to extract pure JSON
            const cleanedContent = this.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            // Find the actual tag objects for the recommended titles
            const recommendedTags = result.recommendations
                .map(title => availableTags.find(tag => tag.title === title))
                .filter(tag => tag) // Remove any not found
                .slice(0, limit);

            // Add reasoning to each individual recommendation
            const recommendationsWithReasoning = recommendedTags.map((tag, index) => {
                let reason = '';
                
                // Handle different reasoning formats from AI response
                if (Array.isArray(result.reasoning)) {
                    // If reasoning is an array, use the corresponding index
                    reason = result.reasoning[index] || result.reasoning[0] || 'AI-powered recommendation based on story content';
                } else if (typeof result.reasoning === 'string') {
                    // If reasoning is a single string, use it for all
                    reason = result.reasoning;
                } else {
                    // Fallback
                    reason = 'AI-powered recommendation based on story content';
                }

                return {
                    ...tag.toJSON(),
                    reason: reason
                };
            });

            return {
                recommendations: recommendationsWithReasoning,
                reasoning: result.reasoning || 'AI-powered recommendations based on story content',
                compatibility_score: result.compatibility_score || 7
            };
        } catch (error) {
            console.error('Error generating content-based recommendations:', error);
            return this.getContentBasedFallbackRecommendations(allTags, limit, storyBrainstorm, selectedTagIds);
        }
    }

    getContentBasedFallbackRecommendations(allTags, limit = 5, storyBrainstorm, selectedTagIds = []) {
        try {
            // Filter out already selected tags
            const availableTags = allTags.filter(tag => 
                !selectedTagIds.includes(tag.id)
            );
            
            // Extract keywords from story brainstorm
            const brainstormText = storyBrainstorm.toLowerCase();
            const brainstormKeywords = availableTags
                .filter(tag => tag.keywords)
                .filter(tag => {
                    const tagKeywords = tag.keywords.toLowerCase().split(',').map(k => k.trim());
                    return tagKeywords.some(keyword => brainstormText.includes(keyword));
                })
                .map(tag => tag.keywords.split(',').map(k => k.trim()))
                .flat();

            const recommendations = availableTags
                .filter(tag => 
                    tag.id && 
                    (brainstormKeywords.some(keyword => 
                        tag.keywords && tag.keywords.toLowerCase().includes(keyword.toLowerCase())
                    ))
                )
                .sort((a, b) => a.title.localeCompare(b.title))
                .slice(0, limit)
                .map(tag => ({ 
                    ...tag.toJSON(), 
                    isFallback: true,
                    reason: 'Fallback recommendation based on keyword matching with story content'
                }));

            // For single recommendations, try to avoid duplicates by shuffling
            if (limit === 1 && recommendations.length > 1) {
                const shuffled = recommendations.sort(() => Math.random() - 0.5);
                const singleRecommendation = shuffled.slice(0, 1).map(tag => ({
                    ...tag,
                    reason: 'Fallback recommendation based on keyword matching with story content'
                }));
                return {
                    recommendations: singleRecommendation,
                    reasoning: 'Fallback recommendation based on keyword matching with story content',
                    compatibility_score: 6
                };
            }

            return {
                recommendations: recommendations,
                reasoning: 'Fallback recommendations based on keyword matching with story content',
                compatibility_score: 6
            };
        } catch (error) {
            console.error('Error in content-based fallback recommendations:', error);
            return {
                recommendations: [],
                reasoning: 'Unable to generate fallback recommendations',
                compatibility_score: 0
            };
        }
    }

    getPopularTags(allTags, limit = 5) {
        return allTags
            .sort((a, b) => a.title.localeCompare(b.title))
            .slice(0, limit);
    }

    getFallbackRecommendations(selectedTags, allTags, limit = 5, storyBrainstorm = null) {
        try {
            // Simple fallback: find tags from same category or with similar keywords
            const selectedCategories = selectedTags.map(tag => tag.category).filter(Boolean);
            const selectedKeywords = selectedTags
                .flatMap(tag => tag.keywords ? tag.keywords.split(',').map(k => k.trim()) : [])
                .filter(Boolean);

            // Extract keywords from story brainstorm if available
            let brainstormKeywords = [];
            if (storyBrainstorm && storyBrainstorm.trim()) {
                // Simple keyword extraction from brainstorm
                const brainstormText = storyBrainstorm.toLowerCase();
                brainstormKeywords = allTags
                    .filter(tag => tag.keywords)
                    .filter(tag => {
                        const tagKeywords = tag.keywords.toLowerCase().split(',').map(k => k.trim());
                        return tagKeywords.some(keyword => brainstormText.includes(keyword));
                    })
                    .map(tag => tag.keywords.split(',').map(k => k.trim()))
                    .flat();
            }

            const recommendations = allTags
                .filter(tag => 
                    tag.id && 
                    !selectedTags.some(selected => selected.id === tag.id) &&
                    (selectedCategories.includes(tag.category) || 
                     selectedKeywords.some(keyword => 
                         tag.keywords && tag.keywords.toLowerCase().includes(keyword.toLowerCase())
                     ) ||
                     brainstormKeywords.some(keyword => 
                         tag.keywords && tag.keywords.toLowerCase().includes(keyword.toLowerCase())
                     ))
                )
                .sort((a, b) => a.title.localeCompare(b.title))
                .slice(0, limit)
                .map(tag => ({ 
                    ...tag.toJSON(), 
                    isFallback: true,
                    reason: storyBrainstorm ? 
                        'Fallback recommendation based on category, keyword matching, and story content' : 
                        'Fallback recommendation based on category and keyword matching'
                })); // Mark as fallback

            // For single recommendations, try to avoid duplicates by shuffling
            if (limit === 1 && recommendations.length > 1) {
                const shuffled = recommendations.sort(() => Math.random() - 0.5);
                const singleRecommendation = shuffled.slice(0, 1).map(tag => ({
                    ...tag,
                    reason: storyBrainstorm ? 
                        'Fallback recommendation based on category, keyword matching, and story content' : 
                        'Fallback recommendation based on category and keyword matching'
                }));
                return {
                    recommendations: singleRecommendation,
                    reasoning: storyBrainstorm ? 
                        'Fallback recommendation based on category, keyword matching, and story content' : 
                        'Fallback recommendation based on category and keyword matching',
                    compatibility_score: 6
                };
            }

            return {
                recommendations,
                reasoning: storyBrainstorm ? 
                    'Fallback recommendations based on category, keyword matching, and story content' : 
                    'Fallback recommendations based on category and keyword matching',
                compatibility_score: 6
            };
        } catch (error) {
            console.error('Error in fallback recommendations:', error);
            return {
                recommendations: this.getPopularTags(allTags, limit).map(tag => ({ 
                    ...tag.toJSON(), 
                    isFallback: true,
                    reason: 'Popular tag as fallback recommendation'
                })),
                reasoning: 'Popular tags as fallback',
                compatibility_score: 5
            };
        }
    }

    async updateTagAI(tag) {
        try {
            // Generate embedding for the tag
            const embeddingText = `${tag.title} ${tag.short_description} ${tag.keywords}`;
            const embedding = await this.generateEmbedding(embeddingText);
            
            if (embedding) {
                tag.ai_embedding = JSON.stringify(embedding);
            }

            // Generate insights
            const insights = await this.generateTagInsights(
                tag.title, 
                tag.short_description, 
                tag.keywords, 
                tag.category
            );

            await tag.save();
            return tag;
        } catch (error) {
            console.error('Error updating tag AI data:', error);
            return tag;
        }
    }

    calculateSimilarity(tag1, tag2) {
        try {
            if (!tag1.ai_embedding || !tag2.ai_embedding) {
                return 0;
            }

            const embedding1 = JSON.parse(tag1.ai_embedding);
            const embedding2 = JSON.parse(tag2.ai_embedding);

            if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
                return 0;
            }

            // Calculate cosine similarity
            const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
            const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
            const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));

            return dotProduct / (magnitude1 * magnitude2);
        } catch (error) {
            console.error('Error calculating similarity:', error);
            return 0;
        }
    }

    async generateTagSuggestions(selectedTags, allTags, action, changedTag = null, storyBrainstorm = null) {
        try {
            const selectedTagInfo = selectedTags.map(tag => ({
                title: tag.title,
                description: tag.short_description,
                keywords: tag.keywords,
                category: tag.category
            }));

            let prompt = '';

            switch (action) {
                case 'add':
                    prompt = `A user just added the tag "${changedTag.title}" to their selection. Based on this addition and the current selection, provide intelligent suggestions:

Current Selection:
${selectedTagInfo.map(tag => `- ${tag.title}: ${tag.description} (Category: ${tag.category}, Keywords: ${tag.keywords})`).join('\n')}

Recently Added:
- ${changedTag.title}: ${changedTag.description || 'No description'} (Category: ${changedTag.category}, Keywords: ${changedTag.keywords})

Please provide:
1. 2-3 tags to ADD that would complement this new addition
2. 1-2 tags to REMOVE that might conflict or be redundant

Consider:
- Genre compatibility and synergies
- Theme coherence
- Target audience alignment
- Potential conflicts or redundancies
- Story content relevance (if provided)`;
                    break;

                case 'remove':
                    prompt = `A user just removed the tag "${changedTag.title}" from their selection. Based on this removal and the current selection, provide intelligent suggestions:

Current Selection:
${selectedTagInfo.map(tag => `- ${tag.title}: ${tag.description} (Category: ${tag.category}, Keywords: ${tag.keywords})`).join('\n')}

Recently Removed:
- ${changedTag.title}: ${changedTag.description || 'No description'} (Category: ${changedTag.category}, Keywords: ${changedTag.keywords})

Please provide:
1. 2-3 tags to ADD that would fill the gap left by this removal
2. 1-2 tags to REMOVE that might now be less relevant

Consider:
- What the removed tag was contributing
- How to maintain balance in the selection
- What might now be missing or redundant
- Story content relevance (if provided)`;
                    break;

                case 'initial':
                case 'refresh':
                    prompt = `Analyze the current tag selection and provide intelligent suggestions for improvement:

Current Selection:
${selectedTagInfo.length > 0 ? selectedTagInfo.map(tag => `- ${tag.title}: ${tag.description} (Category: ${tag.category}, Keywords: ${tag.keywords})`).join('\n') : 'No tags selected'}

Please provide:
1. 2-3 tags to ADD that would improve the selection
2. 1-2 tags to REMOVE that might be problematic or redundant

Consider:
- Overall coherence and balance
- Genre diversity and compatibility
- Theme consistency
- Target audience appropriateness
- Story content relevance (if provided)`;
                    break;
            }

            // Add story brainstorm context if available
            if (storyBrainstorm && storyBrainstorm.trim()) {
                prompt += `\n\nStory Content:
${storyBrainstorm.trim()}

Please consider the story content above when making suggestions.`;
            }

            prompt += `\n\nAvailable Tags:
${allTags.map(tag => `- ${tag.title}: ${tag.short_description} (Keywords: ${tag.keywords})`).join('\n')}

Provide a JSON response with:
1. "add": Array of 2-3 tag titles to add, with reasoning for each
2. "remove": Array of 1-2 tag titles to remove, with reasoning for each
3. "overall_assessment": Brief assessment of the current selection

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
                temperature: 0.7,
                max_tokens: 1500
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            // Process add suggestions
            const addSuggestions = result.add.map(suggestion => {
                const tag = allTags.find(t => t.title === suggestion.title);
                return {
                    ...tag.toJSON(),
                    reason: suggestion.reason || 'AI suggestion based on selection analysis',
                    confidence: suggestion.confidence || 0.8
                };
            }).filter(suggestion => suggestion.id); // Only include existing tags

            // Process remove suggestions
            const removeSuggestions = result.remove.map(suggestion => {
                const tag = allTags.find(t => t.title === suggestion.title);
                return {
                    ...tag.toJSON(),
                    reason: suggestion.reason || 'AI suggestion based on selection analysis',
                    confidence: suggestion.confidence || 0.8
                };
            }).filter(suggestion => suggestion.id); // Only include existing tags

            return {
                add: addSuggestions,
                remove: removeSuggestions,
                overall_assessment: result.overall_assessment || 'AI assessment of current selection'
            };

        } catch (error) {
            console.error('Error generating tag suggestions:', error);
            return this.getFallbackTagSuggestions(selectedTags, allTags, action, changedTag, storyBrainstorm);
        }
    }

    getFallbackTagSuggestions(selectedTags, allTags, action, changedTag, storyBrainstorm) {
        try {
            const suggestions = {
                add: [],
                remove: [],
                overall_assessment: 'Fallback suggestions based on basic analysis'
            };

            // Simple fallback logic
            if (action === 'add' && changedTag) {
                // Find tags from same category or with similar keywords
                const similarTags = allTags
                    .filter(tag => 
                        tag.id && 
                        !selectedTags.some(selected => selected.id === tag.id) &&
                        (tag.category === changedTag.category || 
                         (tag.keywords && changedTag.keywords && 
                          tag.keywords.toLowerCase().includes(changedTag.keywords.toLowerCase())))
                    )
                    .slice(0, 2)
                    .map(tag => ({
                        ...tag.toJSON(),
                        reason: `Similar to ${changedTag.title}`,
                        confidence: 0.6
                    }));
                suggestions.add = similarTags;
            } else if (action === 'remove' && changedTag) {
                // Find potentially conflicting tags
                const conflictingTags = selectedTags
                    .filter(tag => 
                        tag.category !== changedTag.category &&
                        tag.id !== changedTag.id
                    )
                    .slice(0, 1)
                    .map(tag => ({
                        ...tag.toJSON(),
                        reason: `Different category from ${changedTag.title}`,
                        confidence: 0.5
                    }));
                suggestions.remove = conflictingTags;
            } else {
                // General suggestions
                const popularTags = this.getPopularTags(allTags, 2)
                    .filter(tag => !selectedTags.some(selected => selected.id === tag.id))
                    .map(tag => ({
                        ...tag.toJSON(),
                        reason: 'Popular tag suggestion',
                        confidence: 0.5
                    }));
                suggestions.add = popularTags;
            }

            return suggestions;
        } catch (error) {
            console.error('Error in fallback tag suggestions:', error);
            return {
                add: [],
                remove: [],
                overall_assessment: 'Unable to generate suggestions'
            };
        }
    }

    async generateIntelligentSuggestions(story, availableTags, limit = 10) {
        try {
            console.log('=== AI Service: generateIntelligentSuggestions called ===');
            console.log(`Story: ${story.title}`);
            console.log(`Available tags: ${availableTags.length}`);
            console.log(`Limit: ${limit}`);
            
            // Simplify the story context to avoid complex associations
            const storyContext = {
                title: story.title,
                brainstorm: story.brainstorm,
                currentTags: story.tags ? story.tags.map(tag => ({
                    title: tag.title,
                    description: tag.short_description || '',
                    category: tag.category || '',
                    keywords: tag.keywords || ''
                })) : [],
                tagReasonings: story.tagReasonings ? story.tagReasonings.map(reasoning => ({
                    tagTitle: reasoning.tag ? reasoning.tag.title : 'Unknown',
                    reasoning: reasoning.reasoning || '',
                    source: reasoning.source || '',
                    userExplanation: reasoning.userExplanation || ''
                })) : []
            };

            console.log(`Story context - current tags: ${storyContext.currentTags.length}`);
            console.log(`Story context - tag reasonings: ${storyContext.tagReasonings.length}`);

            // If no available tags, return empty
            if (availableTags.length === 0) {
                console.log('No available tags provided');
                return [];
            }

            const prompt = `Based on this story and its current tag selections, generate ${limit} intelligent tag suggestions.

Story Context:
- Title: ${storyContext.title}
- Brainstorm: ${storyContext.brainstorm || 'No brainstorm provided'}

Current Tags:
${storyContext.currentTags.map(tag => `- ${tag.title}: ${tag.description} (Category: ${tag.category}, Keywords: ${tag.keywords})`).join('\n')}

Previous Tag Choices and Reasoning:
${storyContext.tagReasonings.map(reasoning => `- ${reasoning.tagTitle}: ${reasoning.reasoning} (Source: ${reasoning.source})${reasoning.userExplanation ? ` - User: ${reasoning.userExplanation}` : ''}`).join('\n')}

Available Tags:
${availableTags.map(tag => `- ${tag.title}: ${tag.short_description || ''} (Category: ${tag.category || ''}, Keywords: ${tag.keywords || ''})`).join('\n')}

Generate a JSON response with:
1. "suggestions": Array of ${limit} objects with:
   - "tagId": The ID of the suggested tag
   - "reasoning": Detailed explanation of why this tag fits the story based on current context
   - "confidence": Confidence score (0-1) for this suggestion
   - "relevance": How relevant this tag is to the story direction

Consider:
- The story's current direction based on existing tags
- User's previous choices and reasoning
- How new tags would complement existing ones
- The story's themes, genre, and content
- User's expressed preferences through their choices

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;

            console.log('Calling OpenAI API...');
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
                temperature: 0.7,
                max_tokens: 2000
            });

            console.log('OpenAI API response received');
            const content = response.choices[0].message.content;
            console.log('Raw AI response:', content.substring(0, 200) + '...');
            
            const cleanedContent = this.cleanAIResponse(content);
            console.log('Cleaned content:', cleanedContent.substring(0, 200) + '...');
            
            const result = JSON.parse(cleanedContent);
            console.log('Parsed result:', JSON.stringify(result, null, 2));

            // Map suggestions to actual tag objects
            const suggestions = result.suggestions
                .map(suggestion => {
                    const tag = availableTags.find(t => t.id === suggestion.tagId);
                    if (!tag) {
                        console.log(`Tag with ID ${suggestion.tagId} not found in available tags`);
                        return null;
                    }
                    
                    return {
                        tagId: suggestion.tagId,
                        tag: tag,
                        reasoning: suggestion.reasoning,
                        confidence: suggestion.confidence || 0.8,
                        relevance: suggestion.relevance || 'high'
                    };
                })
                .filter(suggestion => suggestion !== null)
                .slice(0, limit);

            console.log(`Final suggestions count: ${suggestions.length}`);
            return suggestions;
        } catch (error) {
            console.error('Error generating intelligent suggestions:', error);
            console.error('Error stack:', error.stack);
            // Fallback to simple suggestions
            console.log('Falling back to simple suggestions...');
            return this.getFallbackIntelligentSuggestions(story, availableTags, limit);
        }
    }

    async reevaluateSuggestion(story, tag, originalReasoning) {
        try {
            const storyContext = {
                title: story.title,
                brainstorm: story.brainstorm,
                currentTags: story.tags.map(tag => ({
                    title: tag.title,
                    description: tag.short_description,
                    category: tag.category,
                    keywords: tag.keywords
                })),
                tagReasonings: story.tagReasonings.map(reasoning => ({
                    tagTitle: reasoning.tag.title,
                    reasoning: reasoning.reasoning,
                    source: reasoning.source,
                    userExplanation: reasoning.userExplanation
                }))
            };

            const prompt = `Re-evaluate this tag suggestion based on the updated story context.

Story Context:
- Title: ${storyContext.title}
- Brainstorm: ${storyContext.brainstorm || 'No brainstorm provided'}

Current Tags:
${storyContext.currentTags.map(tag => `- ${tag.title}: ${tag.description} (Category: ${tag.category}, Keywords: ${tag.keywords})`).join('\n')}

Previous Tag Choices and Reasoning:
${storyContext.tagReasonings.map(reasoning => `- ${reasoning.tagTitle}: ${reasoning.reasoning} (Source: ${reasoning.source})${reasoning.userExplanation ? ` - User: ${reasoning.userExplanation}` : ''}`).join('\n')}

Tag to Re-evaluate:
- ${tag.title}: ${tag.short_description} (Category: ${tag.category}, Keywords: ${tag.keywords})

Original Reasoning: ${originalReasoning}

Provide a JSON response with:
1. "reasoning": Updated reasoning for why this tag still fits (or doesn't fit) the story
2. "confidence": Updated confidence score (0-1)
3. "stillRelevant": Boolean indicating if the tag is still relevant

Consider:
- How the story has evolved with new tags
- Whether the original reasoning still holds
- If the tag still complements the current direction
- User's evolving preferences

Format as valid JSON only. Do not use markdown formatting, code blocks, or backticks. Return pure JSON.`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
                temperature: 0.7,
                max_tokens: 1000
            });

            const content = response.choices[0].message.content;
            const cleanedContent = this.cleanAIResponse(content);
            const result = JSON.parse(cleanedContent);

            return {
                reasoning: result.reasoning,
                confidence: result.confidence || 0.8,
                stillRelevant: result.stillRelevant !== false
            };
        } catch (error) {
            console.error('Error re-evaluating suggestion:', error);
            return {
                reasoning: originalReasoning,
                confidence: 0.5,
                stillRelevant: true
            };
        }
    }

    getFallbackIntelligentSuggestions(story, availableTags, limit = 10) {
        try {
            console.log('=== Fallback Intelligent Suggestions ===');
            console.log(`Story tags: ${story.tags ? story.tags.length : 0}`);
            console.log(`Available tags: ${availableTags.length}`);
            
            // Simple fallback based on category matching
            const currentCategories = story.tags ? story.tags.map(tag => tag.category).filter(Boolean) : [];
            const currentKeywords = story.tags ? story.tags
                .flatMap(tag => tag.keywords ? tag.keywords.split(',').map(k => k.trim()) : [])
                .filter(Boolean) : [];

            console.log(`Current categories: ${currentCategories.join(', ')}`);
            console.log(`Current keywords: ${currentKeywords.join(', ')}`);

            const suggestions = availableTags
                .filter(tag => 
                    tag.id && 
                    (currentCategories.includes(tag.category) || 
                     currentKeywords.some(keyword => 
                         tag.keywords && tag.keywords.toLowerCase().includes(keyword.toLowerCase())
                     ))
                )
                .sort((a, b) => a.title.localeCompare(b.title))
                .slice(0, limit)
                .map(tag => ({
                    tagId: tag.id,
                    tag: tag,
                    reasoning: `Fallback suggestion based on category/keyword matching with existing tags`,
                    confidence: 0.6,
                    relevance: 'medium'
                }));

            console.log(`Fallback suggestions generated: ${suggestions.length}`);
            return suggestions;
        } catch (error) {
            console.error('Error in fallback intelligent suggestions:', error);
            return [];
        }
    }
}

module.exports = AIService;