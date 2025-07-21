const StoryExpansionService = require('./services/StoryExpansionService');
const { Story, TagSuggestion, TagSuggestionDirective, Tag } = require('./models');

async function testStoryExpansion() {
    try {
        console.log('=== Testing Story Expansion Service ===\n');

        // Initialize the service
        const storyExpansionService = new StoryExpansionService();

        // Find a story with accepted tag suggestions
        const story = await Story.findOne({
            include: [
                {
                    model: TagSuggestion,
                    as: 'tagSuggestions',
                    where: { status: 'accepted' },
                    include: [
                        { model: Tag, as: 'tag' },
                        { model: TagSuggestionDirective, as: 'directives' }
                    ]
                }
            ]
        });

        if (!story) {
            console.log('No story found with accepted tag suggestions. Please accept some tag suggestions first.');
            return;
        }

        console.log(`Found story: "${story.title}" (ID: ${story.id})`);
        console.log(`Has ${story.tagSuggestions.length} accepted tag suggestions`);
        
        // Count directives
        let directiveCount = 0;
        for (const suggestion of story.tagSuggestions) {
            directiveCount += suggestion.directives.length;
        }
        console.log(`Has ${directiveCount} directives total\n`);

        if (directiveCount === 0) {
            console.log('No directives found. Please generate some directives for accepted tag suggestions first.');
            return;
        }

        // Test generating story expansion
        console.log('Generating story expansion...');
        const startTime = Date.now();
        
        const result = await storyExpansionService.generateStoryExpansion(story.id);
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        console.log(`\n✅ Story expansion generated successfully in ${duration.toFixed(2)}s`);
        console.log(`\nResults:`);
        console.log(`- Story: ${result.storyTitle}`);
        console.log(`- Directives used: ${result.directivesCount}`);
        console.log(`- Arc suggestions: ${result.arcSuggestions.length}`);
        console.log(`- Character suggestions: ${result.characterSuggestions.length}`);
        console.log(`- Place suggestions: ${result.placeSuggestions.length}`);
        console.log(`- Organization suggestions: ${result.organizationSuggestions.length}`);
        console.log(`- Object suggestions: ${result.objectSuggestions.length}`);

        // Show some sample suggestions
        if (result.arcSuggestions.length > 0) {
            console.log(`\n📖 Sample Arc Suggestion:`);
            const arc = result.arcSuggestions[0];
            console.log(`  Name: ${arc.name}`);
            console.log(`  Type: ${arc.arcType}`);
            console.log(`  Description: ${arc.high_level_description}`);
        }

        if (result.characterSuggestions.length > 0) {
            console.log(`\n👤 Sample Character Suggestion:`);
            const character = result.characterSuggestions[0];
            console.log(`  Name: ${character.name}`);
            console.log(`  Type: ${character.characterType}`);
            console.log(`  Description: ${character.high_level_description}`);
        }

        if (result.placeSuggestions.length > 0) {
            console.log(`\n🏛️ Sample Place Suggestion:`);
            const place = result.placeSuggestions[0];
            console.log(`  Name: ${place.name}`);
            console.log(`  Type: ${place.placeType}`);
            console.log(`  Description: ${place.high_level_description}`);
        }

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testStoryExpansion()
        .then(() => {
            console.log('\nTest script finished.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Test script failed:', error);
            process.exit(1);
        });
}

module.exports = { testStoryExpansion }; 