const IntelligentTagService = require('./services/IntelligentTagService');

async function testClearSuggestions() {
    try {
        console.log('=== Testing Clear Pending Suggestions ===');
        
        const intelligentTagService = new IntelligentTagService();
        
        // Test with a story ID (you can change this to a real story ID)
        const storyId = 1;
        
        console.log(`Testing clear pending suggestions for story ${storyId}...`);
        
        // First, let's see what suggestions exist
        console.log('\n1. Checking current suggestions...');
        const currentSuggestions = await intelligentTagService.getStorySuggestions(storyId, 'pending');
        console.log(`Found ${currentSuggestions.length} pending suggestions`);
        
        if (currentSuggestions.length === 0) {
            console.log('No pending suggestions to clear. Test completed.');
            return;
        }
        
        // Show some details about the suggestions
        currentSuggestions.slice(0, 3).forEach((suggestion, index) => {
            console.log(`  ${index + 1}. ${suggestion.tag?.title || 'Unknown tag'} (ID: ${suggestion.id})`);
        });
        
        // Test the clear function
        console.log('\n2. Clearing pending suggestions...');
        const clearResult = await intelligentTagService.clearPendingSuggestions(storyId);
        
        console.log('Clear result:', clearResult);
        
        // Verify the suggestions were cleared
        console.log('\n3. Verifying suggestions were cleared...');
        const remainingSuggestions = await intelligentTagService.getStorySuggestions(storyId, 'pending');
        console.log(`Remaining pending suggestions: ${remainingSuggestions.length}`);
        
        if (remainingSuggestions.length === 0) {
            console.log('✓ Successfully cleared all pending suggestions!');
        } else {
            console.log('✗ Some suggestions were not cleared');
        }
        
        // Check if they were moved to 'expired' status
        console.log('\n4. Checking expired suggestions...');
        const expiredSuggestions = await intelligentTagService.getStorySuggestions(storyId, 'expired');
        console.log(`Expired suggestions: ${expiredSuggestions.length}`);
        
        console.log('\n=== Test Complete ===');
        
    } catch (error) {
        console.error('Test failed:', error);
        console.error('Error stack:', error.stack);
    }
}

// Run the test
testClearSuggestions().then(() => {
    console.log('Test finished');
    process.exit(0);
}).catch(error => {
    console.error('Test error:', error);
    process.exit(1);
}); 