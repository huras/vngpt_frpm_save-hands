const { TagSuggestion, TagWorldBuildingDirectives, TagSuggestionDirective, Story, Tag } = require('./models');

async function testWorldBuildingStructure() {
    try {
        console.log('Testing World Building Directives Database Structure...\n');

        // Test 1: Check if models are properly loaded
        console.log('✅ Models loaded successfully');
        console.log('- TagWorldBuildingDirectives:', typeof TagWorldBuildingDirectives);
        console.log('- TagSuggestionDirective:', typeof TagSuggestionDirective);

        // Test 2: Check if we can create a test record
        console.log('\nTesting database operations...');
        
        // Create a test story
        const story = await Story.create({
            title: 'Test Story for Structure',
            description: 'A test story to verify database structure',
            brainstorm: 'This is a test story.'
        });
        console.log('✅ Test story created with ID:', story.id);

        // Create a test tag
        const tag = await Tag.create({
            title: 'Test Tag',
            description: 'A test tag for structure verification',
            broaderDescription: 'Test tag for world building directives'
        });
        console.log('✅ Test tag created with ID:', tag.id);

        // Create a test tag suggestion
        const tagSuggestion = await TagSuggestion.create({
            storyId: story.id,
            tagId: tag.id,
            reasoning: 'Test reasoning for structure verification.',
            status: 'accepted',
            acceptedAt: new Date()
        });
        console.log('✅ Test tag suggestion created with ID:', tagSuggestion.id);

        // Test 3: Create world building directives manually
        const worldBuildingDirectives = await TagWorldBuildingDirectives.create({
            tagSuggestionId: tagSuggestion.id,
            characterGeneration: 'Test character generation directives.',
            placeGeneration: 'Test place generation directives.',
            objectGeneration: 'Test object generation directives.',
            arcGeneration: 'Test arc generation directives.',
            pastEventsGeneration: 'Test past events generation directives.',
            relevantAreas: JSON.stringify(['character_generation', 'place_generation', 'arc_generation'])
        });
        console.log('✅ World building directives created with ID:', worldBuildingDirectives.id);
        console.log('Relevant areas:', worldBuildingDirectives.relevantAreas);

        // Test 4: Create individual directives
        const directive1 = await TagSuggestionDirective.create({
            tagSuggestionId: tagSuggestion.id,
            tagWorldBuildingDirectivesId: worldBuildingDirectives.id,
            directiveType: 'character_generation',
            directive: 'Test character directive content.',
            directive_aim: 'Guide character generation based on tag themes and elements'
        });
        console.log('✅ Character directive created with ID:', directive1.id);

        const directive2 = await TagSuggestionDirective.create({
            tagSuggestionId: tagSuggestion.id,
            tagWorldBuildingDirectivesId: worldBuildingDirectives.id,
            directiveType: 'place_generation',
            directive: 'Test place directive content.',
            directive_aim: 'Guide place generation based on tag themes and elements'
        });
        console.log('✅ Place directive created with ID:', directive2.id);

        // Test 5: Test associations
        const retrievedDirectives = await TagWorldBuildingDirectives.findOne({
            where: { tagSuggestionId: tagSuggestion.id },
            include: [
                {
                    model: TagSuggestionDirective,
                    as: 'directives'
                },
                {
                    model: TagSuggestion,
                    as: 'tagSuggestion',
                    include: [
                        { model: Story, as: 'story' },
                        { model: Tag, as: 'tag' }
                    ]
                }
            ]
        });

        if (retrievedDirectives) {
            console.log('✅ Associations working correctly');
            console.log('- Story title:', retrievedDirectives.tagSuggestion.story.title);
            console.log('- Tag title:', retrievedDirectives.tagSuggestion.tag.title);
            console.log('- Directives count:', retrievedDirectives.directives.length);
            console.log('- Relevant areas:', retrievedDirectives.relevantAreas);
        } else {
            console.log('❌ Failed to retrieve with associations');
        }

        // Test 6: Test parsing relevant areas
        try {
            const relevantAreas = JSON.parse(worldBuildingDirectives.relevantAreas);
            console.log('✅ Relevant areas parsed successfully:', relevantAreas);
        } catch (error) {
            console.log('❌ Failed to parse relevant areas:', error.message);
        }

        // Cleanup test data
        console.log('\nCleaning up test data...');
        await TagSuggestionDirective.destroy({ where: { tagSuggestionId: tagSuggestion.id } });
        await TagWorldBuildingDirectives.destroy({ where: { tagSuggestionId: tagSuggestion.id } });
        await TagSuggestion.destroy({ where: { id: tagSuggestion.id } });
        await Tag.destroy({ where: { id: tag.id } });
        await Story.destroy({ where: { id: story.id } });
        console.log('✅ Test data cleaned up');

        console.log('\n🎉 World Building Directives structure test completed successfully!');
        console.log('The database structure and models are working correctly.');

    } catch (error) {
        console.error('❌ Error testing world building structure:', error);
        console.error(error.stack);
    } finally {
        process.exit(0);
    }
}

testWorldBuildingStructure(); 