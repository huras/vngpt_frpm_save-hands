const AIService = require('./services/AIService');

async function testAIResponse() {
    try {
        console.log('=== Testing AI Response ===');
        
        // Create a simple test story
        const testStory = {
            id: 1,
            title: "Test Story",
            brainstorm: "A fantasy adventure story about a hero's journey",
            tags: [
                { id: 1, title: "Fantasy", short_description: "Fantasy elements", category: "Genre", keywords: "magic, fantasy" }
            ],
            tagReasonings: []
        };

        // Create test available tags
        const availableTags = [
            { id: 2, title: "Adventure", short_description: "Adventure elements", category: "Genre", keywords: "adventure, journey" },
            { id: 3, title: "Action", short_description: "Action elements", category: "Genre", keywords: "action, combat" }
        ];

        const IntelligentTagSuggestionService = require('./services/IntelligentTagSuggestionService');
        const suggestionService = new IntelligentTagSuggestionService();
        
        // Test the iterative method
        console.log('Testing iterative AI method...');
        const aiGenerator = suggestionService.generateIntelligentSuggestionsIterative(testStory, availableTags, 1);
        
        for await (const suggestion of aiGenerator) {
            console.log('\n=== AI Response ===');
            console.log('Tag:', suggestion.tag.title);
            console.log('Reasoning:', suggestion.reasoning);
            console.log('Confidence:', suggestion.confidence);
            break; // Just get the first one
        }

    } catch (error) {
        console.error('Test failed:', error);
        console.error('Error stack:', error.stack);
    }
}

// Run the test
testAIResponse().then(() => {
    console.log('Test finished');
    process.exit(0);
}).catch(error => {
    console.error('Test error:', error);
    process.exit(1);
}); 