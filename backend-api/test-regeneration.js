const { Story, Tag, TagSuggestion } = require('./models');

async function testRegeneration() {
    try {
        console.log('=== Testing Tag Suggestion Regeneration ===');
        
        // Get a story and tag for testing
        const story = await Story.findOne();
        const tag = await Tag.findOne();
        
        if (!story || !tag) {
            console.log('Need at least one story and one tag for testing');
            return;
        }
        
        console.log(`Using story: ${story.title} (ID: ${story.id})`);
        console.log(`Using tag: ${tag.title} (ID: ${tag.id})`);
        
        // Check if there's already a suggestion for this story-tag combination
        const existingSuggestion = await TagSuggestion.findOne({
            where: {
                storyId: story.id,
                tagId: tag.id,
                status: 'pending'
            }
        });
        
        if (existingSuggestion) {
            console.log('Found existing pending suggestion, testing regeneration...');
            
            // Test regeneration by updating the existing suggestion
            try {
                await existingSuggestion.update({
                    reasoning: 'Updated reasoning for testing',
                    confidence: 0.9,
                    regenerationReason: 'Test regeneration'
                });
                console.log('✅ Successfully updated existing suggestion');
            } catch (error) {
                console.error('❌ Error updating suggestion:', error.message);
            }
        } else {
            console.log('No existing suggestion found, creating a test suggestion...');
            
            // Create a test suggestion
            try {
                const testSuggestion = await TagSuggestion.create({
                    storyId: story.id,
                    tagId: tag.id,
                    reasoning: 'Test reasoning',
                    confidence: 0.8,
                    status: 'pending',
                    suggestionType: 'ai_generated',
                    contextTags: JSON.stringify([]),
                    versionNumber: 1
                });
                console.log('✅ Successfully created test suggestion with ID:', testSuggestion.id);
                
                // Test updating it
                await testSuggestion.update({
                    reasoning: 'Updated test reasoning',
                    confidence: 0.9
                });
                console.log('✅ Successfully updated test suggestion');
                
            } catch (error) {
                console.error('❌ Error creating/updating suggestion:', error.message);
                console.error('Error details:', error);
            }
        }
        
        // Test creating multiple suggestions for the same story-tag combination
        console.log('\nTesting multiple suggestions for same story-tag combination...');
        
        try {
            // Create a second suggestion with different status
            const secondSuggestion = await TagSuggestion.create({
                storyId: story.id,
                tagId: tag.id,
                reasoning: 'Second suggestion reasoning',
                confidence: 0.7,
                status: 'expired', // Different status to avoid unique constraint
                suggestionType: 'ai_generated',
                contextTags: JSON.stringify([]),
                versionNumber: 2
            });
            console.log('✅ Successfully created second suggestion with status "expired"');
            
            // Try to create another pending suggestion (should fail due to unique constraint)
            try {
                const thirdSuggestion = await TagSuggestion.create({
                    storyId: story.id,
                    tagId: tag.id,
                    reasoning: 'Third suggestion reasoning',
                    confidence: 0.6,
                    status: 'pending', // This should fail due to unique constraint
                    suggestionType: 'ai_generated',
                    contextTags: JSON.stringify([]),
                    versionNumber: 3
                });
                console.log('❌ Unexpectedly created third pending suggestion');
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    console.log('✅ Correctly prevented duplicate pending suggestion');
                } else {
                    console.error('❌ Unexpected error:', error.message);
                }
            }
            
        } catch (error) {
            console.error('❌ Error in multiple suggestion test:', error.message);
        }
        
        console.log('\n=== Test Complete ===');
        
    } catch (error) {
        console.error('Test failed:', error);
        console.error('Error stack:', error.stack);
    }
}

// Run the test
testRegeneration().then(() => {
    console.log('Test finished');
    process.exit(0);
}).catch(error => {
    console.error('Test error:', error);
    process.exit(1);
}); 