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

    async generateRecommendations(selectedTags, allTags, limit = 8, storyBrainstorm = null, forceNew = false, focusedMode = false, focusTag = null) {
            try {
                if (!selectedTags || selectedTags.length === 0) {
                    return this.getPopularTags(allTags, limit);
                }

                // If limit is 1, we want a single recommendation
                const isSingleRecommendation = limit === 1;

                const selectedTagInfo = selectedTags.map(tag => ({
                    title: tag.title,
                    description: tag.short_description,
                    keywords: tag.keywords,
                    category: tag.category
                }));

                let prompt = '';

                if (focusedMode && focusTag) {
                    // Focused mode: recommend based on a specific tag
                    prompt = `Based on this specific anime/manga tag, recommend ${limit} additional tag${limit === 1 ? '' : 's'} that would complement it well:

Focus Tag:
- ${focusTag.title}: ${focusTag.short_description} (Category: ${focusTag.category}, Keywords: ${focusTag.keywords})`;
                } else {
                    // Normal mode: recommend based on all selected tags
                    prompt = `Based on these selected anime/manga tags, recommend ${limit} additional tag${limit === 1 ? '' : 's'} that would complement them well:

Selected Tags:
${selectedTagInfo.map(tag => `- ${tag.title}: ${tag.description} (Category: ${tag.category}, Keywords: ${tag.keywords})`).join('\n')}`;
                }

                // Add story brainstorm context if available
                if (storyBrainstorm && storyBrainstorm.trim()) {
                    prompt += `\n\nStory Brainstorm/Content:
${storyBrainstorm.trim()}

Please consider the story content above when making recommendations.`;
                }

                prompt += `\n\nAvailable Tags:
${allTags.map(tag => `- ${tag.title}: ${tag.short_description} (Keywords: ${tag.keywords})`).join('\n')}

Provide a JSON response with:
1. "recommendations": Array of ${limit} tag title${limit === 1 ? '' : 's'} that would work well ${focusedMode ? 'with the focus tag' : 'with the selected tags'}${storyBrainstorm ? ' and story content' : ''}
2. "reasoning": ${isSingleRecommendation ? 'Brief explanation for this recommendation' : 'Brief explanation for each recommendation'}
3. "compatibility_score": Overall compatibility score (1-10) for the ${focusedMode ? 'focus tag' : 'selected tag combination'}

Consider:
- Genre compatibility
- Theme synergies
- Target audience overlaps
- ${storyBrainstorm ? 'Story content and themes' : ''}
- Don't suggest tags that are already selected
${focusedMode ? '- Focus on deep compatibility with the specific tag' : ''}
${isSingleRecommendation ? '- Provide a unique recommendation that hasn\'t been suggested before' : ''}

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
                .map(title => allTags.find(tag => tag.title === title))
                .filter(tag => tag) // Remove any not found
                .slice(0, limit);

            // Add reasoning to each individual recommendation
            const recommendationsWithReasoning = recommendedTags.map((tag, index) => {
                let reason = '';
                
                // Handle different reasoning formats from AI response
                if (Array.isArray(result.reasoning)) {
                    // If reasoning is an array, use the corresponding index
                    reason = result.reasoning[index] || result.reasoning[0] || 'AI-powered recommendation';
                } else if (typeof result.reasoning === 'string') {
                    // If reasoning is a single string, use it for all
                    reason = result.reasoning;
                } else {
                    // Fallback
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
            console.error('Raw AI response:', response?.choices?.[0]?.message?.content);
            return this.getFallbackRecommendations(selectedTags, allTags, limit, storyBrainstorm);
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
}

module.exports = AIService;