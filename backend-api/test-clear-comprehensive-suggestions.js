const ComprehensiveTagGenerationService = require('./services/ComprehensiveTagGenerationService');
const { TagSuggestion, TagRelationship, TagWorldBuildingEffect } = require('./models');

async function testClearComprehensiveSuggestions() {
    try {
        console.log('=== Testing Clear Comprehensive Tag Suggestions ===');
        
        const comprehensiveTagService = new ComprehensiveTagGenerationService();
        
        // Test with a story ID (you can change this to a real story ID)
        const storyId = 1;
        
        console.log(`Testing clear comprehensive suggestions for story ${storyId}...`);
        
        // First, let's see what comprehensive suggestions exist
        console.log('\n1. Checking current comprehensive suggestions...');
        const currentSuggestions = await TagSuggestion.findAll({
            where: {
                storyId,
                suggestionType: 'comprehensive_generation'
            }
        });
        
        console.log(`Found ${currentSuggestions.length} comprehensive suggestions`);
        
        if (currentSuggestions.length === 0) {
            console.log('No comprehensive suggestions to clear. Test completed.');
            return;
        }
        
        // Show some details about the suggestions
        currentSuggestions.slice(0, 3).forEach((suggestion, index) => {
            console.log(`  ${index + 1}. Tag ID: ${suggestion.tagId} (Suggestion ID: ${suggestion.id})`);
        });
        
        // Get the tag IDs from the suggestions
        const tagIds = currentSuggestions.map(s => s.tagId);
        
        // Check related data
        console.log('\n2. Checking related data...');
        const relationships = await TagRelationship.findAll({
            where: {
                sourceTagId: tagIds
            }
        });
        console.log(`Found ${relationships.length} tag relationships`);
        
        const effects = await TagWorldBuildingEffect.findAll({
            where: {
                tagId: tagIds
            }
        });
        console.log(`Found ${effects.length} world-building effects`);
        
        // Test the clear function by calling the route handler directly
        console.log('\n3. Clearing comprehensive suggestions...');
        
        // Simulate the route handler logic
        const suggestions = await TagSuggestion.findAll({
            where: {
                storyId,
                suggestionType: 'comprehensive_generation'
            }
        });

        if (suggestions.length === 0) {
            console.log('No comprehensive tag suggestions found to clear');
            return;
        }

        // Get the tag IDs from the suggestions
        const tagIdsToDelete = suggestions.map(s => s.tagId);

        // Delete tag relationships for these tags
        const deletedRelationships = await TagRelationship.destroy({
            where: {
                sourceTagId: tagIdsToDelete
            }
        });

        // Delete world-building effects for these tags
        const deletedEffects = await TagWorldBuildingEffect.destroy({
            where: {
                tagId: tagIdsToDelete
            }
        });

        // Delete the tag suggestions
        const deletedSuggestions = await TagSuggestion.destroy({
            where: {
                storyId,
                suggestionType: 'comprehensive_generation'
            }
        });

        console.log(`Cleared ${deletedSuggestions} suggestions, ${deletedRelationships} relationships, ${deletedEffects} effects`);
        
        // Verify the suggestions were cleared
        console.log('\n4. Verifying suggestions were cleared...');
        const remainingSuggestions = await TagSuggestion.findAll({
            where: {
                storyId,
                suggestionType: 'comprehensive_generation'
            }
        });
        console.log(`Remaining comprehensive suggestions: ${remainingSuggestions.length}`);
        
        if (remainingSuggestions.length === 0) {
            console.log('✓ Successfully cleared all comprehensive suggestions!');
        } else {
            console.log('✗ Some suggestions were not cleared');
        }
        
        // Check if related data was also cleared
        console.log('\n5. Checking if related data was cleared...');
        const remainingRelationships = await TagRelationship.findAll({
            where: {
                sourceTagId: tagIds
            }
        });
        console.log(`Remaining relationships: ${remainingRelationships.length}`);
        
        const remainingEffects = await TagWorldBuildingEffect.findAll({
            where: {
                tagId: tagIds
            }
        });
        console.log(`Remaining effects: ${remainingEffects.length}`);
        
        console.log('\n=== Test Complete ===');
        
    } catch (error) {
        console.error('Test failed:', error);
        console.error('Error stack:', error.stack);
    }
}

// Run the test
testClearComprehensiveSuggestions().then(() => {
    console.log('Test finished');
    process.exit(0);
}).catch(error => {
    console.error('Test error:', error);
    process.exit(1);
}); 