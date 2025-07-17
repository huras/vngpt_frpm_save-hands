const { Story, Tag, TagSuggestion, StoryTagReasoning } = require('./models');
const IntelligentTagService = require('./services/IntelligentTagService');

async function testIntelligentTags() {
    try {
        console.log('=== Testing Intelligent Tag System ===');
        
        // Test 1: Check if models are loaded
        console.log('1. Checking models...');
        console.log('Story model:', typeof Story);
        console.log('Tag model:', typeof Tag);
        console.log('TagSuggestion model:', typeof TagSuggestion);
        console.log('StoryTagReasoning model:', typeof StoryTagReasoning);
        
        // Test 2: Check if we can find stories
        console.log('\n2. Checking stories...');
        const stories = await Story.findAll({ limit: 5 });
        console.log(`Found ${stories.length} stories`);
        
        if (stories.length === 0) {
            console.log('No stories found. Creating a test story...');
            const testStory = await Story.create({
                title: 'Test Story for Intelligent Tags',
                brainstorm: 'This is a test story to check if the intelligent tag system works.'
            });
            console.log('Created test story with ID:', testStory.id);
        }
        
        // Test 3: Check if we can find tags
        console.log('\n3. Checking tags...');
        const tags = await Tag.findAll({ limit: 10 });
        console.log(`Found ${tags.length} tags`);
        
        if (tags.length === 0) {
            console.log('No tags found. The system needs tags to work.');
            return;
        }
        
        // Test 4: Test the intelligent tag service
        console.log('\n4. Testing IntelligentTagService...');
        const intelligentTagService = new IntelligentTagService();
        
        const storyId = stories[0] ? stories[0].id : 1;
        console.log(`Testing with story ID: ${storyId}`);
        
        const result = await intelligentTagService.generateSuggestions(storyId, 5);
        console.log('Result:', JSON.stringify(result, null, 2));
        
        console.log('\n=== Test Complete ===');
        
    } catch (error) {
        console.error('Test failed:', error);
        console.error('Error stack:', error.stack);
    }
}

// Run the test
testIntelligentTags().then(() => {
    console.log('Test finished');
    process.exit(0);
}).catch(error => {
    console.error('Test error:', error);
    process.exit(1);
}); 