const ComprehensiveTagGenerationService = require('./services/ComprehensiveTagGenerationService');

async function testComprehensiveTagGeneration() {
    console.log('🧪 Testing Comprehensive Tag Generation Service...\n');

    const service = new ComprehensiveTagGenerationService();

    const testStory = {
        title: "The Last Dragon Rider",
        brainstorm: `A young orphan discovers they are the last descendant of an ancient dragon rider bloodline. 
        Set in a world where dragons were hunted to near extinction by a tyrannical empire, the protagonist 
        must learn to master their hidden powers while evading capture. The story explores themes of destiny, 
        friendship, and the balance between power and responsibility. The protagonist befriends a wounded 
        dragon hatchling and together they must find other surviving dragons to rebuild their ancient order.`
    };

    try {
        console.log('📖 Test Story:');
        console.log(`Title: ${testStory.title}`);
        console.log(`Brainstorm: ${testStory.brainstorm.substring(0, 100)}...\n`);

        console.log('🚀 Starting comprehensive tag generation...\n');

        const results = await service.generateComprehensiveTags(
            testStory.title,
            testStory.brainstorm,
            5 // Limit to 5 tags for testing
        );

        console.log('✅ Generation completed successfully!\n');

        // Display results
        console.log('📊 Results Summary:');
        console.log(`- Relevant Tags: ${results.summary.totalRelevantTags}`);
        console.log(`- Related Tags: ${results.summary.totalRelatedTags}`);
        console.log(`- World-Building Effects: ${results.summary.totalWorldBuildingEffects}\n`);

        // Display relevant tags
        console.log('🏷️  Relevant Tags:');
        results.relevantTags.forEach((tag, index) => {
            console.log(`${index + 1}. ${tag.title} (Score: ${tag.relevanceScore}/10)`);
            console.log(`   Description: ${tag.short_description}`);
            console.log(`   Reasoning: ${tag.selectionReasoning}`);
            console.log('');
        });

        // Display related tags for first tag
        if (results.relevantTags.length > 0) {
            const firstTag = results.relevantTags[0];
            console.log(`🔗 Related Tags for "${firstTag.title}":`);
            const relatedTags = results.relatedTagsMap[firstTag.id] || [];
            relatedTags.forEach((relatedTag, index) => {
                console.log(`${index + 1}. ${relatedTag.title} (${relatedTag.relationshipType})`);
                console.log(`   Reasoning: ${relatedTag.relationshipReasoning}`);
                console.log('');
            });
        }

        // Display world-building effects for first tag
        if (results.worldBuildingEffects.length > 0) {
            const firstTagEffects = results.worldBuildingEffects[0];
            console.log(`🌍 World-Building Effects for "${firstTagEffects.tagTitle}":`);
            firstTagEffects.effects.forEach((effect, index) => {
                console.log(`${index + 1}. ${effect.title} (${effect.effectType} - ${effect.impactLevel})`);
                console.log(`   Description: ${effect.description.substring(0, 100)}...`);
                console.log('');
            });
        }

        console.log('🎉 Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Error details:', error.message);
    }
}

// Run the test
testComprehensiveTagGeneration(); 