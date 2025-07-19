const AIService = require('./AIService');

class IntelligentTagSuggestionService {
    constructor() {
        this.aiService = new AIService();
    }

    /**
     * Generate intelligent suggestions iteratively, one at a time
     * This method returns a generator that yields suggestions as they're generated
     */
    async *generateIntelligentSuggestionsIterative(storyId, limit = 10) {
        // Test AI service connection first
        try {
            console.log('Testing AI service connection...');
            const testResponse = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: "Respond with 'OK' if you can read this." }],
                temperature: 0.1,
                max_tokens: 10
            });
            console.log('AI service connection test successful');
        } catch (connectionError) {
            console.error('AI service connection test failed:', connectionError);
            throw new Error(`AI service is not available: ${connectionError.message}`);
        }
        
        try {
            console.log('=== IntelligentTagSuggestionService: generateIntelligentSuggestionsIterative called ===');
            console.log(`Story ID: ${storyId}`);
            console.log(`Limit: ${limit}`);
            
            // Track already suggested tags to avoid duplicates within this session
            const suggestedTagIds = new Set();
            const suggestedTagNames = new Set();
            const suggestedTagsWithReasoning = []; // Track suggestions with their reasoning for context
            
            for (let i = 0; i < limit; i++) {
                try {
                    console.log(`Generating suggestion ${i + 1}/${limit}...`);
                    
                    // REFRESH DATA: Get fresh story data, available tags, and rejection learning data
                    const { story, availableTags, rejectionLearning } = await this.getFreshData(storyId, suggestedTagIds, suggestedTagNames);
                    
                    if (availableTags.length === 0) {
                        console.log('No more available tags to suggest');
                        break;
                    }
                    
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
                    
                    // Build context of already suggested tags with their reasoning
                    let alreadySuggestedContext = '';
                    if (suggestedTagsWithReasoning.length > 0) {
                        alreadySuggestedContext = `\nPREVIOUS SUGGESTIONS (avoid these and build upon their themes):
${suggestedTagsWithReasoning.map((suggestion, index) => 
    `${index + 1}. ${suggestion.tag.title}: "${suggestion.reasoning.substring(0, 150)}..."
`).join('\n')}

LEARNING FROM PREVIOUS SUGGESTIONS:
- Consider how your new suggestion complements or contrasts with these themes
- Avoid suggesting similar concepts or overlapping story directions
- Build upon the creative momentum established by previous suggestions
- Each suggestion should offer a distinct new direction for the story`;
                    }
                    
                    // STEP 1: Get tag ID suggestion
                    const tagSelectionPrompt = this.buildTagSelectionPrompt(
                        storyContext, 
                        rejectionLearning, 
                        alreadySuggestedContext, 
                        availableTags, 
                        i, 
                        limit
                    );

                    console.log(`Calling OpenAI API for tag selection ${i + 1}...`);
                    const tagSelectionResponse = await this.aiService.openai.chat.completions.create({
                        model: "gpt-3.5-turbo",
                        messages: [{ role: "system", content: tagSelectionPrompt }],
                        temperature: 0.7,
                        max_tokens: 500
                    });

                    const tagSelectionContent = tagSelectionResponse.choices[0].message.content;
                    console.log(`Raw AI response for tag selection ${i + 1}:`, tagSelectionContent);
                    
                    const cleanedTagSelectionContent = this.aiService.cleanAIResponse(tagSelectionContent);
                    console.log(`Cleaned AI response for tag selection ${i + 1}:`, cleanedTagSelectionContent);
                    
                    let tagSelectionResult;
                    try {
                        tagSelectionResult = JSON.parse(cleanedTagSelectionContent);
                        console.log(`Parsed tag selection result for suggestion ${i + 1}:`, JSON.stringify(tagSelectionResult, null, 2));
                    } catch (parseError) {
                        console.error(`JSON parsing error for tag selection ${i + 1}:`, parseError);
                        console.error('Failed to parse content:', cleanedTagSelectionContent);
                        // Try to extract JSON from the content
                        const jsonMatch = cleanedTagSelectionContent.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            try {
                                tagSelectionResult = JSON.parse(jsonMatch[0]);
                                console.log('Successfully extracted JSON from content');
                            } catch (extractError) {
                                console.error('Failed to extract JSON:', extractError);
                                throw new Error(`Invalid JSON response from AI: ${cleanedTagSelectionContent}`);
                            }
                        } else {
                            throw new Error(`No valid JSON found in AI response: ${cleanedTagSelectionContent}`);
                        }
                    }

                    // Find the actual tag object
                    let tag = null;
                    if (typeof tagSelectionResult.tagId === 'number') {
                        tag = availableTags.find(t => t.id === tagSelectionResult.tagId);
                    } else if (typeof tagSelectionResult.tagId === 'string') {
                        tag = availableTags.find(t => t.title.toLowerCase() === tagSelectionResult.tagId.toLowerCase());
                    }

                    if (!tag) {
                        console.log(`Tag with ID/title "${tagSelectionResult.tagId}" not found in remaining tags, trying fallback...`);
                        // Fallback: pick a random remaining tag
                        const randomIndex = Math.floor(Math.random() * availableTags.length);
                        tag = availableTags[randomIndex];
                        console.log(`Using fallback tag: ${tag.title}`);
                    }

                    // Add to suggested sets for this session
                    suggestedTagIds.add(tag.id);
                    suggestedTagNames.add(tag.title);

                    // STEP 2: Generate reasoning for the selected tag
                    const reasoningPrompt = this.buildReasoningPrompt(
                        storyContext, 
                        rejectionLearning, 
                        suggestedTagsWithReasoning, 
                        tag, 
                        i, 
                        limit
                    );

                    console.log(`Calling OpenAI API for reasoning generation ${i + 1}...`);
                    const reasoningResponse = await this.aiService.openai.chat.completions.create({
                        model: "gpt-3.5-turbo",
                        messages: [{ role: "system", content: reasoningPrompt }],
                        temperature: 0.8,
                        max_tokens: 1000
                    });

                    const reasoningContent = reasoningResponse.choices[0].message.content;
                    console.log(`Raw AI response for reasoning ${i + 1}:`, reasoningContent);
                    
                    const cleanedReasoningContent = this.aiService.cleanAIResponse(reasoningContent);
                    console.log(`Cleaned AI response for reasoning ${i + 1}:`, cleanedReasoningContent);
                    
                    let reasoningResult;
                    try {
                        reasoningResult = JSON.parse(cleanedReasoningContent);
                        console.log(`Parsed reasoning result for suggestion ${i + 1}:`, JSON.stringify(reasoningResult, null, 2));
                    } catch (parseError) {
                        console.error(`JSON parsing error for reasoning ${i + 1}:`, parseError);
                        console.error('Failed to parse content:', cleanedReasoningContent);
                        // Try to extract JSON from the content
                        const jsonMatch = cleanedReasoningContent.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            try {
                                reasoningResult = JSON.parse(jsonMatch[0]);
                                console.log('Successfully extracted JSON from content');
                            } catch (extractError) {
                                console.error('Failed to extract JSON:', extractError);
                                throw new Error(`Invalid JSON response from AI: ${cleanedReasoningContent}`);
                            }
                        } else {
                            throw new Error(`No valid JSON found in AI response: ${cleanedReasoningContent}`);
                        }
                    }

                    // Ensure we have proper reasoning from AI
                    let reasoning = reasoningResult.reasoning;
                    if (!reasoning || reasoning.trim() === '') {
                        console.error(`ERROR: No reasoning provided by AI for suggestion ${i + 1}`);
                        console.error('AI response result:', JSON.stringify(reasoningResult, null, 2));
                        throw new Error(`AI failed to provide reasoning for suggestion ${i + 1}`);
                    }
                    
                    // Check for fallback reasoning patterns
                    if (reasoning.includes('Basic suggestion for') || 
                        reasoning.includes('this tag might fit your story based on general compatibility')) {
                        console.error(`ERROR: AI returned fallback reasoning instead of proper AI reasoning for suggestion ${i + 1}`);
                        console.error('AI response result:', JSON.stringify(reasoningResult, null, 2));
                        throw new Error(`AI returned fallback reasoning for suggestion ${i + 1} - this indicates a problem with the AI service`);
                    }

                    const suggestion = {
                        tagId: tag.id,
                        tag: tag,
                        reasoning: `${tagSelectionResult.reasoning}\n\n${reasoning}`,
                        confidence: reasoningResult.confidence || tagSelectionResult.confidence || 0.8,
                        suggestionNumber: i + 1,
                        totalSuggestions: limit
                    };

                    // Add to tracking for iterative context
                    suggestedTagsWithReasoning.push(suggestion);

                    console.log(`Final suggestion reasoning: ${suggestion.reasoning.substring(0, 100)}...`);
                    console.log(`Generated suggestion ${i + 1}: ${tag.title}`);
                    yield suggestion;

                    // Small delay between requests to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 500));

                } catch (error) {
                    console.error(`Error generating suggestion ${i + 1}:`, error);
                    console.error('Full error details:', error);
                    
                    // Don't continue with fallback - throw the error to prevent fallback suggestions
                    throw new Error(`AI suggestion generation failed for suggestion ${i + 1}: ${error.message}`);
                }
            }
        } catch (error) {
            console.error('Error in generateIntelligentSuggestionsIterative:', error);
            console.error('Error stack:', error.stack);
        }
    }

    /**
     * Get fresh data for each iteration - story, available tags, and rejection learning
     */
    async getFreshData(storyId, suggestedTagIds, suggestedTagNames) {
        const { Story, Tag, StoryTagReasoning, TagSuggestion } = require('../models');
        
        // Get fresh story data with current tags and reasonings
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

        // Get all available tags
        const allTags = await Tag.findAll({
            order: [['title', 'ASC']]
        });

        // Get existing suggestions to avoid duplicates
        const existingSuggestions = await TagSuggestion.findAll({
            where: { 
                storyId,
                status: ['pending', 'accepted']
            }
        });

        // Create set of tags that are already associated with the story or have pending/accepted suggestions
        const existingTagIds = new Set([
            ...story.tags.map(tag => tag.id),
            ...existingSuggestions.map(suggestion => suggestion.tagId),
            ...suggestedTagIds, // Include tags suggested in this session
            ...Array.from(suggestedTagNames).map(name => {
                const tag = allTags.find(t => t.title.toLowerCase() === name.toLowerCase());
                return tag ? tag.id : null;
            }).filter(id => id !== null)
        ]);

        // Filter out already suggested or selected tags
        const availableTags = allTags.filter(tag => !existingTagIds.has(tag.id));

        // Get fresh rejection learning data
        const rejectionLearning = await this.getRejectionLearningData(storyId);

        console.log(`Fresh data - Story: ${story.title}, Available tags: ${availableTags.length}, Rejections: ${rejectionLearning.rejections.length}`);

        return { story, availableTags, rejectionLearning };
    }

    /**
     * Build the tag selection prompt for the AI
     */
    buildTagSelectionPrompt(storyContext, rejectionLearning, alreadySuggestedContext, remainingTags, suggestionIndex, limit) {
        return `You are a creative writing consultant helping an author develop their story. Your role is to select the most promising story element from the available options.

STORY BACKGROUND:
"${storyContext.title}"
${storyContext.brainstorm ? `Brainstorm: ${storyContext.brainstorm}` : 'No brainstorm provided yet'}

CURRENT STORY DIRECTION:
${storyContext.currentTags.length > 0 ? storyContext.currentTags.map(tag => `• ${tag.title}: ${tag.description} (${tag.category})`).join('\n') : 'Story is just beginning - no tags selected yet'}

${storyContext.tagReasonings.length > 0 ? `AUTHOR'S CREATIVE CHOICES:
${storyContext.tagReasonings.map(reasoning => `• ${reasoning.tagTitle}: "${reasoning.reasoning}"${reasoning.userExplanation ? ` (Author's note: ${reasoning.userExplanation})` : ''}`).join('\n')}` : ''}

${rejectionLearning.rejections.length > 0 ? `WHAT DIDN'T WORK:
${rejectionLearning.rejections.map(rejection => `• ${rejection.tagTitle}: ${rejection.rejectionReason || 'Author felt it didn\'t fit'}`).join('\n')}

` : ''}${rejectionLearning.ratedReasonings.length > 0 ? `RATING INSIGHTS:
${rejectionLearning.ratedReasonings.map(reasoning => `• ${reasoning.tagTitle}: ${reasoning.rating}/5 stars${reasoning.comment ? ` - "${reasoning.comment}"` : ''}`).join('\n')}

` : ''}LEARNING FROM FEEDBACK:
- Author seems to avoid: ${rejectionLearning.avoidCategories.join(', ') || 'No clear patterns yet'}
- Common concerns: ${rejectionLearning.commonReasons.join(', ') || 'None identified'}
- Author's style preferences: ${rejectionLearning.userPreferences.join(', ') || 'Still discovering'}
${rejectionLearning.ratingInsights.length > 0 ? `- Rating insights: ${rejectionLearning.ratingInsights.join('; ')}` : ''}

${alreadySuggestedContext}

AVAILABLE INSPIRATION CATALOG (choose ONE from these):
${remainingTags.map(tag => `• ID ${tag.id}: ${tag.title} - ${tag.short_description || 'No description'} (${tag.category || 'Uncategorized'})`).join('\n')}

YOUR MISSION:
Select ONE tag that has the most potential to inspire the author and open up exciting new story directions. This is suggestion ${suggestionIndex + 1} of ${limit}.

${alreadySuggestedContext ? `CREATIVE STRATEGY:
- Build upon the creative momentum from previous suggestions
- Offer a fresh perspective that complements but doesn't duplicate previous themes
- Consider how this suggestion could create interesting contrasts or synergies
- Each suggestion should open up new storytelling possibilities` : 'CREATIVE STRATEGY:\n- Start with a strong foundation that will inspire future suggestions\n- Consider multiple story directions this could enable\n- Focus on elements that have rich storytelling potential'}

Provide a JSON response with EXACTLY this structure:
{
  "reasoning": Brief reasoning for picking the selected tag,
  "tagId": [NUMERIC_ID_FROM_CATALOG],
  "tagName": "[TAG_NAME_FROM_CATALOG]",
  "confidence": [0.0_TO_1.0]
}

Consider:
- The most obvious tags first, tags that could beused to classify the current story
- Which tag has the most storytelling potential
- How it could complement or contrast with existing story elements
- Which tag would be most inspiring for the author
- IMPORTANT: Choose a tag that hasn't been suggested before
${rejectionLearning.rejections.length > 0 ? `- Respect their previous feedback while offering fresh perspectives
- Focus on directions they seem to enjoy based on their choices` : ''}

Format as valid JSON only. Return pure JSON without markdown formatting.`;
    }

    /**
     * Build the reasoning prompt for the AI
     */
    buildReasoningPrompt(storyContext, rejectionLearning, suggestedTagsWithReasoning, tag, suggestionIndex, limit) {
        const alreadySuggestedContext = suggestedTagsWithReasoning.length > 0 ? 
            `PREVIOUS SUGGESTIONS (build upon these themes):
${suggestedTagsWithReasoning.map((suggestion, index) => 
    `${index + 1}. ${suggestion.tag.title}: "${suggestion.reasoning.substring(0, 150)}..."
`).join('\n')}

LEARNING FROM PREVIOUS SUGGESTIONS:
- Consider how your new suggestion complements or contrasts with these themes
- Build upon the creative momentum established by previous suggestions
- Each suggestion should offer a distinct new direction for the story` : '';

        return `You are a creative writing consultant helping an author develop their story. Your role is to create a compelling pitch for how a specific story element could enhance their narrative.

STORY BACKGROUND:
"${storyContext.title}"
${storyContext.brainstorm ? `Brainstorm: ${storyContext.brainstorm}` : 'No brainstorm provided yet'}

CURRENT STORY DIRECTION:
${storyContext.currentTags.length > 0 ? storyContext.currentTags.map(tag => `• ${tag.title}: ${tag.description} (${tag.category})`).join('\n') : 'Story is just beginning - no tags selected yet'}

${storyContext.tagReasonings.length > 0 ? `AUTHOR'S CREATIVE CHOICES:
${storyContext.tagReasonings.map(reasoning => `• ${reasoning.tagTitle}: "${reasoning.reasoning}"${reasoning.userExplanation ? ` (Author's note: ${reasoning.userExplanation})` : ''}`).join('\n')}` : ''}

${rejectionLearning.rejections.length > 0 ? `WHAT DIDN'T WORK:
${rejectionLearning.rejections.map(rejection => `• ${rejection.tagTitle}: ${rejection.rejectionReason || 'Author felt it didn\'t fit'}`).join('\n')}

` : ''}${rejectionLearning.ratedReasonings.length > 0 ? `RATING INSIGHTS:
${rejectionLearning.ratedReasonings.map(reasoning => `• ${reasoning.tagTitle}: ${reasoning.rating}/5 stars${reasoning.comment ? ` - "${reasoning.comment}"` : ''}`).join('\n')}

` : ''}LEARNING FROM FEEDBACK:
- Author seems to avoid: ${rejectionLearning.avoidCategories.join(', ') || 'No clear patterns yet'}
- Common concerns: ${rejectionLearning.commonReasons.join(', ') || 'None identified'}
- Author's style preferences: ${rejectionLearning.userPreferences.join(', ') || 'Still discovering'}
${rejectionLearning.ratingInsights.length > 0 ? `- Rating insights: ${rejectionLearning.ratingInsights.join('; ')}` : ''}

${alreadySuggestedContext ? alreadySuggestedContext + '\n' : ''}

SELECTED STORY ELEMENT TO PITCH:
• ${tag.title}: ${tag.short_description || 'No description'} (Category: ${tag.category || 'Uncategorized'}, Keywords: ${tag.keywords || 'None'})

YOUR MISSION:
Create a compelling story pitch that shows how this element could transform or enhance their story. This is suggestion ${suggestionIndex + 1} of ${limit}, so make it inspiring!

Provide a JSON response with EXACTLY this structure:
{
  "reasoning": "[COMPELLING_STORY_PITCH_HERE]",
  "confidence": [0.0_TO_1.0]
}

The "reasoning" field should be a compelling story pitch that shows how this element could transform or enhance their story. Be specific, creative, and inspiring. Think about:
- Ideas for the story using this tag and maybe mixing with other existing tags
- To be able to guide the story on exciting plot developments or character arcs it could enable
- To be able to guide the story creating interesting conflicts or opportunities
- Maybe an unique storytelling possibilities it opens up
${suggestedTagsWithReasoning.length > 0 ? `- How this builds upon or contrasts with previous suggestions` : ''}

APPROACH:
- Connect this new idea to what they've already established for sure
- Suggest specific ways this could enhance their story
- Consider how it could create interesting character dynamics or plot twists
- Think about the emotional impact and storytelling potential
${rejectionLearning.rejections.length > 0 ? `- Respect their previous feedback while offering fresh perspectives
- Focus on directions they seem to enjoy based on their choices` : ''}

Format as valid JSON only. Return pure JSON without markdown formatting.`;
    }

    /**
     * Get rejection learning data for a story to improve future suggestions
     */
    async getRejectionLearningData(storyId) {
        try {
            const { TagSuggestion, Tag, StoryTagReasoning } = require('../models');

            // Get rejected suggestions for this story
            const rejections = await TagSuggestion.findAll({
                where: { 
                    storyId,
                    status: 'rejected'
                },
                include: [
                    { model: Tag, as: 'tag' }
                ],
                order: [['rejectedAt', 'DESC']]
            });

            // Get accepted suggestions for comparison
            const acceptances = await TagSuggestion.findAll({
                where: { 
                    storyId,
                    status: 'accepted'
                },
                include: [
                    { model: Tag, as: 'tag' }
                ],
                order: [['acceptedAt', 'DESC']]
            });

            // Get all StoryTagReasoning records with ratings for this story
            const ratedReasonings = await StoryTagReasoning.findAll({
                where: { 
                    storyId,
                    userRating: { [require('sequelize').Op.not]: null }
                },
                include: [
                    { model: Tag, as: 'tag' }
                ],
                order: [['ratedAt', 'DESC']]
            });

            // Analyze patterns
            const rejectedCategories = {};
            const acceptedCategories = {};
            const rejectionReasons = {};
            const userPreferences = [];
            const ratingInsights = [];

            // Analyze rejections
            rejections.forEach(rejection => {
                if (rejection.tag.category) {
                    rejectedCategories[rejection.tag.category] = 
                        (rejectedCategories[rejection.tag.category] || 0) + 1;
                }
                
                if (rejection.rejectionReason) {
                    const reason = rejection.rejectionReason.toLowerCase();
                    rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1;
                }
            });

            // Analyze acceptances
            acceptances.forEach(acceptance => {
                if (acceptance.tag.category) {
                    acceptedCategories[acceptance.tag.category] = 
                        (acceptedCategories[acceptance.tag.category] || 0) + 1;
                }
            });

            // Analyze ratings from StoryTagReasoning
            const highRatedCategories = {};
            const lowRatedCategories = {};
            const ratingComments = [];

            ratedReasonings.forEach(reasoning => {
                if (reasoning.tag.category) {
                    if (reasoning.userRating >= 4) {
                        highRatedCategories[reasoning.tag.category] = 
                            (highRatedCategories[reasoning.tag.category] || 0) + 1;
                    } else if (reasoning.userRating <= 2) {
                        lowRatedCategories[reasoning.tag.category] = 
                            (lowRatedCategories[reasoning.tag.category] || 0) + 1;
                    }
                }

                if (reasoning.ratingComment) {
                    ratingComments.push({
                        tag: reasoning.tag.title,
                        rating: reasoning.userRating,
                        comment: reasoning.ratingComment
                    });
                }
            });

            // Determine categories to avoid (rejected more than accepted OR low rated)
            const avoidCategories = Object.keys(rejectedCategories).filter(category => {
                const rejectedCount = rejectedCategories[category] || 0;
                const acceptedCount = acceptedCategories[category] || 0;
                const lowRatedCount = lowRatedCategories[category] || 0;
                return rejectedCount > acceptedCount || lowRatedCount > 0;
            });

            // Extract common rejection reasons
            const commonReasons = Object.keys(rejectionReasons)
                .sort((a, b) => rejectionReasons[b] - rejectionReasons[a])
                .slice(0, 5);

            // Determine user preferences based on acceptances and high ratings
            const preferredCategories = Object.keys(acceptedCategories)
                .sort((a, b) => acceptedCategories[b] - acceptedCategories[a])
                .slice(0, 3);

            userPreferences.push(...preferredCategories.map(cat => `Prefers ${cat} category`));

            // Add rating-based preferences
            const topRatedCategories = Object.keys(highRatedCategories)
                .sort((a, b) => highRatedCategories[b] - highRatedCategories[a])
                .slice(0, 3);

            userPreferences.push(...topRatedCategories.map(cat => `Highly rated ${cat} category`));

            // Create rating insights for AI prompts
            if (ratingComments.length > 0) {
                const positiveComments = ratingComments.filter(r => r.rating >= 4);
                const negativeComments = ratingComments.filter(r => r.rating <= 2);

                if (positiveComments.length > 0) {
                    ratingInsights.push(`Likes: ${positiveComments.map(r => `${r.tag} (${r.comment.substring(0, 50)}...)`).join(', ')}`);
                }

                if (negativeComments.length > 0) {
                    ratingInsights.push(`Dislikes: ${negativeComments.map(r => `${r.tag} (${r.comment.substring(0, 50)}...)`).join(', ')}`);
                }
            }

            return {
                rejections: rejections.map(r => ({
                    tagTitle: r.tag.title,
                    tagCategory: r.tag.category,
                    rejectionReason: r.rejectionReason
                })),
                avoidCategories,
                commonReasons,
                userPreferences,
                ratingInsights,
                ratedReasonings: ratedReasonings.map(r => ({
                    tagTitle: r.tag.title,
                    tagCategory: r.tag.category,
                    rating: r.userRating,
                    comment: r.ratingComment,
                    reasoning: r.reasoning
                }))
            };

        } catch (error) {
            console.error('Error getting rejection learning data:', error);
            return {
                rejections: [],
                avoidCategories: [],
                commonReasons: [],
                userPreferences: [],
                ratingInsights: [],
                ratedReasonings: []
            };
        }
    }
}

module.exports = IntelligentTagSuggestionService; 