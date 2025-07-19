const AIService = require('./services/AIService');
const { Story, Tag } = require('./models');

async function testStreamingSuggestions() {
    try {
        console.log('=== Testing Streaming Suggestions ===');
        
        // Get a test story
        const story = await Story.findByPk(1, {
            include: [
                { model: Tag, as: 'tags' }
            ]
        });

        if (!story) {
            console.error('No story found with ID 1');
            return;
        }

        console.log(`Testing with story: ${story.title}`);
        console.log(`Story has ${story.tags?.length || 0} tags`);

        // Get available tags
        const allTags = await Tag.findAll({
            order: [['title', 'ASC']]
        });

        console.log(`Total tags available: ${allTags.length}`);

        // Filter out already selected tags
        const existingTagIds = new Set(story.tags.map(tag => tag.id));
        const availableTags = allTags.filter(tag => !existingTagIds.has(tag.id));

        console.log(`Available tags after filtering: ${availableTags.length}`);

        if (availableTags.length === 0) {
            console.error('No available tags for testing');
            return;
        }

        // Test the iterative AI service
        const IntelligentTagSuggestionService = require('./services/IntelligentTagSuggestionService');
        const suggestionService = new IntelligentTagSuggestionService();
        console.log('\n=== Testing Iterative AI Service ===');
        
        let suggestionCount = 0;
        const aiGenerator = suggestionService.generateIntelligentSuggestionsIterative(story, availableTags, 3);
        
        for await (const suggestion of aiGenerator) {
            suggestionCount++;
            console.log(`\n--- Suggestion ${suggestionCount} ---`);
            console.log(`Tag: ${suggestion.tag.title}`);
            console.log(`Confidence: ${suggestion.confidence}`);
            console.log(`Reasoning: ${suggestion.reasoning}`);
            console.log(`Suggestion Number: ${suggestion.suggestionNumber}/${suggestion.totalSuggestions}`);
        }

        console.log(`\n=== Test Complete ===`);
        console.log(`Generated ${suggestionCount} suggestions`);

    } catch (error) {
        console.error('Test failed:', error);
        console.error('Error stack:', error.stack);
    }
}

// Run the test
testStreamingSuggestions().then(() => {
    console.log('Test finished');
    process.exit(0);
}).catch(error => {
    console.error('Test error:', error);
    process.exit(1);
}); 