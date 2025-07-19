const AIService = require('./services/AIService');

async function checkAISetup() {
    try {
        console.log('=== AI Service Setup Check ===');
        
        // Check environment variables
        console.log('Environment variables:');
        console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
        
        if (!process.env.OPENAI_API_KEY) {
            console.error('ERROR: OPENAI_API_KEY is not set!');
            console.error('Please set the OPENAI_API_KEY environment variable.');
            return;
        }
        
        // Test AI service initialization
        console.log('\nTesting AI service initialization...');
        const aiService = new AIService();
        console.log('✓ AI service initialized successfully');
        
        // Test basic API call
        console.log('\nTesting basic API call...');
        const testResponse = await aiService.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Say 'Hello World'" }],
            temperature: 0.1,
            max_tokens: 10
        });
        
        console.log('✓ API call successful');
        console.log('Response:', testResponse.choices[0].message.content);
        
        // Test the iterative method with a simple case
        console.log('\nTesting iterative suggestion generation...');
        const testStory = {
            id: 1,
            title: "Test Story",
            brainstorm: "A simple test story",
            tags: [],
            tagReasonings: []
        };
        
        const testTags = [
            { id: 1, title: "Fantasy", short_description: "Fantasy genre", category: "Genre", keywords: "fantasy" }
        ];
        
        const IntelligentTagSuggestionService = require('./services/IntelligentTagSuggestionService');
        const suggestionService = new IntelligentTagSuggestionService();
        const aiGenerator = suggestionService.generateIntelligentSuggestionsIterative(testStory, testTags, 1);
        
        for await (const suggestion of aiGenerator) {
            console.log('✓ Iterative generation successful');
            console.log('Generated suggestion:');
            console.log('- Tag:', suggestion.tag.title);
            console.log('- Reasoning:', suggestion.reasoning.substring(0, 100) + '...');
            console.log('- Confidence:', suggestion.confidence);
            break;
        }
        
        console.log('\n=== All tests passed! ===');
        console.log('The AI service is properly configured and working.');
        
    } catch (error) {
        console.error('\n=== Test failed! ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        
        if (error.message.includes('OPENAI_API_KEY')) {
            console.error('\nSolution: Set the OPENAI_API_KEY environment variable');
        } else if (error.message.includes('API key')) {
            console.error('\nSolution: Check if your OpenAI API key is valid');
        } else if (error.message.includes('rate limit')) {
            console.error('\nSolution: You may have hit the OpenAI rate limit');
        } else {
            console.error('\nSolution: Check the error details above');
        }
    }
}

// Run the check
checkAISetup().then(() => {
    console.log('\nCheck completed');
    process.exit(0);
}).catch(error => {
    console.error('Check error:', error);
    process.exit(1);
}); 