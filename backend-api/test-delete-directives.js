const { TagSuggestion, TagSuggestionDirective, TagWorldBuildingDirectives, Tag, Story } = require('./models');

async function testDeleteDirectives() {
    try {
        console.log('Testing delete directives functionality...\n');

        // Find a tag suggestion that has directives
        const tagSuggestion = await TagSuggestion.findOne({
            where: {
                suggestionStatus: 'accepted'
            },
            include: [
                {
                    model: TagSuggestionDirective,
                    as: 'directives'
                },
                {
                    model: TagWorldBuildingDirectives,
                    as: 'worldBuildingDirectives'
                }
            ]
        });

        if (!tagSuggestion) {
            console.log('No accepted tag suggestions with directives found. Creating test data...');
            
            // Create test data
            const story = await Story.create({
                title: 'Test Story for Delete',
                description: 'Test story description',
                brainstorm: 'Test brainstorm'
            });

            const tag = await Tag.create({
                title: 'Test Tag for Delete',
                description: 'Test tag description',
                category: 'test'
            });

            const newTagSuggestion = await TagSuggestion.create({
                storyId: story.id,
                tagId: tag.id,
                reasoning: 'Test reasoning',
                suggestionStatus: 'accepted',
                relevanceScore: 85
            });

            // Create some test directives
            await TagSuggestionDirective.create({
                tagSuggestionId: newTagSuggestion.id,
                directiveType: 'general',
                directive: 'Test directive content',
                directive_aim: 'Test directive aim'
            });

            // Create world building directives
            await TagWorldBuildingDirectives.create({
                tagSuggestionId: newTagSuggestion.id,
                characterGeneration: 'Test character generation',
                relevantAreas: JSON.stringify(['character_generation'])
            });

            console.log('Test data created successfully!');
            return;
        }

        console.log(`Found tag suggestion ID: ${tagSuggestion.id}`);
        console.log(`Tag: ${tagSuggestion.tag?.title}`);
        console.log(`Story: ${tagSuggestion.story?.title}`);
        console.log(`Directives count: ${tagSuggestion.directives?.length || 0}`);
        console.log(`Has world building directives: ${!!tagSuggestion.worldBuildingDirectives}`);

        // Count directives before deletion
        const directivesBefore = await TagSuggestionDirective.count({
            where: { tagSuggestionId: tagSuggestion.id }
        });

        const worldBuildingDirectivesBefore = await TagWorldBuildingDirectives.count({
            where: { tagSuggestionId: tagSuggestion.id }
        });

        console.log(`\nBefore deletion:`);
        console.log(`- Tag directives: ${directivesBefore}`);
        console.log(`- World building directives: ${worldBuildingDirectivesBefore}`);

        // Delete the directives
        const deletedDirectives = await TagSuggestionDirective.destroy({
            where: { tagSuggestionId: tagSuggestion.id }
        });

        const deletedWorldBuildingDirectives = await TagWorldBuildingDirectives.destroy({
            where: { tagSuggestionId: tagSuggestion.id }
        });

        console.log(`\nDeletion results:`);
        console.log(`- Deleted tag directives: ${deletedDirectives}`);
        console.log(`- Deleted world building directives: ${deletedWorldBuildingDirectives}`);

        // Verify deletion
        const directivesAfter = await TagSuggestionDirective.count({
            where: { tagSuggestionId: tagSuggestion.id }
        });

        const worldBuildingDirectivesAfter = await TagWorldBuildingDirectives.count({
            where: { tagSuggestionId: tagSuggestion.id }
        });

        console.log(`\nAfter deletion:`);
        console.log(`- Tag directives: ${directivesAfter}`);
        console.log(`- World building directives: ${worldBuildingDirectivesAfter}`);

        if (directivesAfter === 0 && worldBuildingDirectivesAfter === 0) {
            console.log('\n✅ Delete test PASSED - All directives were successfully deleted!');
        } else {
            console.log('\n❌ Delete test FAILED - Some directives were not deleted!');
        }

    } catch (error) {
        console.error('Error testing delete directives:', error);
    }
}

// Run the test
testDeleteDirectives().then(() => {
    console.log('\nTest completed.');
    process.exit(0);
}).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
}); 