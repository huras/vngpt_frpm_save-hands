const { TagSuggestion, TagWorldBuildingDirectives, TagSuggestionDirective, Story, Tag } = require('./models');
const TagWorldBuildingDirectivesService = require('./services/TagWorldBuildingDirectivesService');

async function testWorldBuildingDirectives() {
    try {
        console.log('Testing World Building Directives System...\n');

        // Find an accepted tag suggestion to test with
        const tagSuggestion = await TagSuggestion.findOne({
            where: { status: 'accepted' },
            include: [
                { model: Story, as: 'story' },
                { model: Tag, as: 'tag' }
            ]
        });

        if (!tagSuggestion) {
            console.log('No accepted tag suggestions found. Creating a test one...');
            
            // Create a test story and tag if needed
            const story = await Story.create({
                title: 'Test Story for World Building',
                description: 'A test story to verify world building directives',
                brainstorm: 'This is a test story with fantasy elements and adventure themes.'
            });

            const tag = await Tag.create({
                title: 'Fantasy',
                description: 'Stories with magical elements and fantastical worlds',
                broaderDescription: 'Encompasses all forms of fantasy fiction including high fantasy, urban fantasy, and magical realism.'
            });

            // Create a tag suggestion
            const newTagSuggestion = await TagSuggestion.create({
                storyId: story.id,
                tagId: tag.id,
                reasoning: 'This story contains magical elements and fantastical themes that align with the fantasy genre.',
                status: 'accepted',
                acceptedAt: new Date()
            });

            console.log(`Created test tag suggestion with ID: ${newTagSuggestion.id}`);
            
            // Test world building directives generation
            console.log('\nGenerating world building directives...');
            const worldBuildingDirectives = await TagWorldBuildingDirectivesService.generateWorldBuildingDirectives(newTagSuggestion);
            
            console.log('✅ World Building Directives generated successfully!');
            console.log('Directives ID:', worldBuildingDirectives.id);
            console.log('Character Generation:', worldBuildingDirectives.characterGeneration ? '✅' : '❌');
            console.log('Place Generation:', worldBuildingDirectives.placeGeneration ? '✅' : '❌');
            console.log('Object Generation:', worldBuildingDirectives.objectGeneration ? '✅' : '❌');
            console.log('Arc Generation:', worldBuildingDirectives.arcGeneration ? '✅' : '❌');
            console.log('Past Events Generation:', worldBuildingDirectives.pastEventsGeneration ? '✅' : '❌');

            // Check if individual directives were created
            const directives = await TagSuggestionDirective.findAll({
                where: { tagWorldBuildingDirectivesId: worldBuildingDirectives.id }
            });

            console.log(`\nCreated ${directives.length} individual directives:`);
            directives.forEach(directive => {
                console.log(`- ${directive.directiveType}: ${directive.directive.substring(0, 100)}...`);
            });

            // Test retrieving world building directives
            console.log('\nTesting retrieval...');
            const retrievedDirectives = await TagWorldBuildingDirectivesService.getWorldBuildingDirectives(newTagSuggestion.id);
            
            if (retrievedDirectives) {
                console.log('✅ World building directives retrieved successfully!');
                console.log('Retrieved directives count:', retrievedDirectives.directives ? retrievedDirectives.directives.length : 0);
            } else {
                console.log('❌ Failed to retrieve world building directives');
            }

            // Test getting directives by type
            console.log('\nTesting directives by type...');
            const characterDirectives = await TagWorldBuildingDirectivesService.getDirectivesByType(newTagSuggestion.id, 'character_generation');
            console.log(`Character generation directives: ${characterDirectives.length}`);

        } else {
            console.log(`Found existing accepted tag suggestion: ${tagSuggestion.id}`);
            console.log(`Story: ${tagSuggestion.story.title}`);
            console.log(`Tag: ${tagSuggestion.tag.title}`);

            // Check if world building directives already exist
            const existingDirectives = await TagWorldBuildingDirectives.findOne({
                where: { tagSuggestionId: tagSuggestion.id }
            });

            if (existingDirectives) {
                console.log('\n✅ World building directives already exist for this suggestion');
                console.log('Directives ID:', existingDirectives.id);
                
                const directives = await TagSuggestionDirective.findAll({
                    where: { tagWorldBuildingDirectivesId: existingDirectives.id }
                });
                
                console.log(`Found ${directives.length} directives:`);
                directives.forEach(directive => {
                    console.log(`- ${directive.directiveType}: ${directive.directive.substring(0, 100)}...`);
                });
            } else {
                console.log('\nGenerating world building directives for existing suggestion...');
                const worldBuildingDirectives = await TagWorldBuildingDirectivesService.generateWorldBuildingDirectives(tagSuggestion);
                console.log('✅ World Building Directives generated successfully!');
                console.log('Directives ID:', worldBuildingDirectives.id);
            }
        }

        console.log('\n🎉 World Building Directives test completed successfully!');

    } catch (error) {
        console.error('❌ Error testing world building directives:', error);
        console.error(error.stack);
    } finally {
        process.exit(0);
    }
}

testWorldBuildingDirectives(); 