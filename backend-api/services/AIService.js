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

Format as valid JSON only.`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 300
            });

            const content = response.choices[0].message.content;
            return JSON.parse(content);
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

    async generateRecommendations(selectedTags, allTags, limit = 5) {
            try {
                if (!selectedTags || selectedTags.length === 0) {
                    return this.getPopularTags(allTags, limit);
                }

                const selectedTagInfo = selectedTags.map(tag => ({
                    title: tag.title,
                    description: tag.short_description,
                    keywords: tag.keywords,
                    category: tag.category
                }));

                const prompt = `Based on these selected anime/manga tags, recommend ${limit} additional tags that would complement them well:

Selected Tags:
${selectedTagInfo.map(tag => `- ${tag.title}: ${tag.description} (Category: ${tag.category}, Keywords: ${tag.keywords})`).join('\n')}

Available Tags:
${allTags.map(tag => `- ${tag.title}: ${tag.short_description} (Category: ${tag.category})`).join('\n')}

Provide a JSON response with:
1. "recommendations": Array of ${limit} tag titles that would work well with the selected tags
2. "reasoning": Brief explanation for each recommendation
3. "compatibility_score": Overall compatibility score (1-10) for the selected tag combination

Consider:
- Genre compatibility
- Theme synergy
- Target audience overlap
- Category relationships

Format as valid JSON only.`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 500
            });

            const content = response.choices[0].message.content;
            const result = JSON.parse(content);

            // Find the actual tag objects for the recommended titles
            const recommendedTags = result.recommendations
                .map(title => allTags.find(tag => tag.title === title))
                .filter(tag => tag) // Remove any not found
                .slice(0, limit);

            return {
                recommendations: recommendedTags,
                reasoning: result.reasoning || 'AI-powered recommendations based on tag compatibility',
                compatibility_score: result.compatibility_score || 7
            };
        } catch (error) {
            console.error('Error generating AI recommendations:', error);
            return this.getFallbackRecommendations(selectedTags, allTags, limit);
        }
    }

    getPopularTags(allTags, limit = 5) {
        return allTags
            .sort((a, b) => a.title.localeCompare(b.title))
            .slice(0, limit);
    }

    getFallbackRecommendations(selectedTags, allTags, limit = 5) {
        try {
            // Simple fallback: find tags from same category or with similar keywords
            const selectedCategories = selectedTags.map(tag => tag.category).filter(Boolean);
            const selectedKeywords = selectedTags
                .flatMap(tag => tag.keywords ? tag.keywords.split(',').map(k => k.trim()) : [])
                .filter(Boolean);

            const recommendations = allTags
                .filter(tag => 
                    tag.id && 
                    !selectedTags.some(selected => selected.id === tag.id) &&
                    (selectedCategories.includes(tag.category) || 
                     selectedKeywords.some(keyword => 
                         tag.keywords && tag.keywords.toLowerCase().includes(keyword.toLowerCase())
                     ))
                )
                .sort((a, b) => a.title.localeCompare(b.title))
                .slice(0, limit)
                .map(tag => ({ ...tag.toJSON(), isFallback: true })); // Mark as fallback

            return {
                recommendations,
                reasoning: 'Fallback recommendations based on category and keyword matching',
                compatibility_score: 6
            };
        } catch (error) {
            console.error('Error in fallback recommendations:', error);
            return {
                recommendations: this.getPopularTags(allTags, limit).map(tag => ({ ...tag.toJSON(), isFallback: true })),
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