const { sequelize } = require('./models');
const IntelligentTagService = require('./services/IntelligentTagService');

async function testAICommentary() {
    try {
        console.log('=== Testing AI Commentary System ===');
        
        // Initialize the service
        const intelligentTagService = new IntelligentTagService();
        
        // Test data
        const storyId = 1; // Assuming you have a story with ID 1
        const tagId = 1;   // Assuming you have a tag with ID 1
        
        console.log(`Testing with Story ID: ${storyId}, Tag ID: ${tagId}`);
        
        // Test 1: Get current commentary
        console.log('\n1. Getting current commentary...');
        try {
            const commentary = await intelligentTagService.getCommentary(storyId, tagId);
            console.log('Current commentary:', commentary ? 'Found' : 'Not found');
            if (commentary) {
                console.log('Version:', commentary.version);
                console.log('Commentary:', commentary.commentary.substring(0, 100) + '...');
            }
        } catch (error) {
            console.log('No current commentary found (expected for new relationships)');
        }
        
        // Test 2: Get commentary history
        console.log('\n2. Getting commentary history...');
        try {
            const history = await intelligentTagService.getCommentaryHistory(storyId, tagId);
            console.log('History entries:', history.length);
        } catch (error) {
            console.log('No history found (expected for new relationships)');
        }
        
        // Test 3: Create a test commentary
        console.log('\n3. Creating test commentary...');
        const testCommentary = "This is a test commentary for the Comedy tag. It demonstrates how the AI commentary system works and tracks improvements over time.";
        
        try {
            const newCommentary = await intelligentTagService.commentaryService.createCommentary(
                storyId,
                tagId,
                testCommentary,
                {
                    confidence: 0.8,
                    triggerType: 'manual_update',
                    userFeedback: 'Testing the new AI commentary system'
                }
            );
            console.log('Created commentary ID:', newCommentary.id);
            console.log('Version:', newCommentary.version);
        } catch (error) {
            console.error('Error creating commentary:', error.message);
        }
        
        // Test 4: Update the commentary
        console.log('\n4. Updating commentary...');
        const updatedCommentary = "This is an improved commentary for the Comedy tag. It now provides more specific reasoning about how comedy elements enhance the story's narrative and character development.";
        
        try {
            const updated = await intelligentTagService.updateCommentary(
                storyId,
                tagId,
                updatedCommentary,
                'The previous commentary was too generic, need more specific reasoning'
            );
            console.log('Updated commentary ID:', updated.id);
            console.log('New version:', updated.version);
        } catch (error) {
            console.error('Error updating commentary:', error.message);
        }
        
        // Test 5: Get updated commentary and history
        console.log('\n5. Getting updated commentary and history...');
        try {
            const currentCommentary = await intelligentTagService.getCommentary(storyId, tagId);
            const history = await intelligentTagService.getCommentaryHistory(storyId, tagId);
            
            console.log('Current commentary version:', currentCommentary.version);
            console.log('Total history entries:', history.length);
            
            history.forEach((entry, index) => {
                console.log(`  ${index + 1}. Version ${entry.version} (${entry.triggerType}) - ${entry.commentary.substring(0, 50)}...`);
            });
        } catch (error) {
            console.error('Error getting updated data:', error.message);
        }
        
        // Test 6: Analyze commentary quality
        console.log('\n6. Analyzing commentary quality...');
        try {
            const analysis = await intelligentTagService.analyzeCommentaryQuality(
                "This commentary provides specific insights about how the Comedy tag enhances the story's character development and narrative pacing."
            );
            console.log('Quality analysis:', {
                overall_score: analysis.overall_score,
                is_generic: analysis.is_generic,
                suggestions_count: analysis.suggestions.length
            });
        } catch (error) {
            console.error('Error analyzing commentary:', error.message);
        }
        
        // Test 7: Get commentary statistics
        console.log('\n7. Getting commentary statistics...');
        try {
            const stats = await intelligentTagService.getCommentaryStats(storyId);
            console.log('Commentary stats:', {
                totalCommentaries: stats.totalCommentaries,
                uniqueTags: stats.uniqueTags,
                averageVersions: stats.averageVersions,
                averageConfidence: stats.averageConfidence
            });
        } catch (error) {
            console.error('Error getting stats:', error.message);
        }
        
        console.log('\n=== AI Commentary System Test Complete ===');
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await sequelize.close();
    }
}

// Run the test
testAICommentary(); 