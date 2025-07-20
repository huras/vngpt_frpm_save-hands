const ComprehensiveTagGenerationService = require('./services/ComprehensiveTagGenerationService');

async function testStreamingComprehensiveTagGeneration() {
    console.log('🧪 Testing Streaming Comprehensive Tag Generation Service...\n');

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

        console.log('🚀 Starting streaming comprehensive tag generation...\n');

        let stage1Completed = false;
        let stage2Completed = false;
        let stage3Completed = false;
        let finalResults = null;

        // Use the iterative generator
        for await (const update of service.generateComprehensiveTagsIterative(
            testStory.title,
            testStory.brainstorm,
            3 // Limit to 3 tags for testing
        )) {
            console.log(`📡 Update - Stage ${update.stage}: ${update.stageName}`);
            console.log(`   Progress: ${update.progress}/${update.total}`);
            console.log(`   Message: ${update.message}`);
            
            if (update.currentTag) {
                console.log(`   Current Tag: ${update.currentTag.title}`);
            }
            
            if (update.data) {
                if (update.stage === 1 && update.data.relevantTags) {
                    console.log(`   ✅ Found ${update.data.relevantTags.length} relevant tags`);
                    stage1Completed = true;
                } else if (update.stage === 2 && update.data.relatedTagsMap) {
                    const totalRelated = Object.values(update.data.relatedTagsMap).flat().length;
                    console.log(`   ✅ Generated ${totalRelated} related tags`);
                    stage2Completed = true;
                } else if (update.stage === 3 && update.data.worldBuildingEffects) {
                    console.log(`   ✅ Generated world-building effects for ${update.data.worldBuildingEffects.length} tags`);
                    stage3Completed = true;
                }
            }
            
            if (update.completed) {
                finalResults = update.data;
                console.log('   🎉 Generation completed!');
            }
            
            if (update.error) {
                console.log(`   ❌ Error: ${update.error}`);
            }
            
            console.log('');
        }

        console.log('✅ Streaming test completed successfully!\n');

        // Display final results summary
        if (finalResults) {
            console.log('📊 Final Results Summary:');
            console.log(`- Relevant Tags: ${finalResults.summary.totalRelevantTags}`);
            console.log(`- Related Tags: ${finalResults.summary.totalRelatedTags}`);
            console.log(`- World-Building Effects: ${finalResults.summary.totalWorldBuildingEffects}\n`);

            // Display relevant tags
            console.log('🏷️  Relevant Tags:');
            finalResults.relevantTags.forEach((tag, index) => {
                console.log(`${index + 1}. ${tag.title} (Score: ${tag.relevanceScore}/10)`);
                console.log(`   Description: ${tag.short_description}`);
                console.log(`   Reasoning: ${tag.selectionReasoning}`);
                console.log('');
            });

            // Display related tags for first tag
            if (finalResults.relevantTags.length > 0) {
                const firstTag = finalResults.relevantTags[0];
                console.log(`🔗 Related Tags for "${firstTag.title}":`);
                const relatedTags = finalResults.relatedTagsMap[firstTag.id] || [];
                relatedTags.forEach((relatedTag, index) => {
                    console.log(`${index + 1}. ${relatedTag.title} (${relatedTag.relationshipType})`);
                    console.log(`   Reasoning: ${relatedTag.relationshipReasoning}`);
                    console.log('');
                });
            }

            // Display world-building effects for first tag
            if (finalResults.worldBuildingEffects.length > 0) {
                const firstTagEffects = finalResults.worldBuildingEffects[0];
                console.log(`🌍 World-Building Effects for "${firstTagEffects.tagTitle}":`);
                firstTagEffects.effects.forEach((effect, index) => {
                    console.log(`${index + 1}. ${effect.title} (${effect.effectType} - ${effect.impactLevel})`);
                    console.log(`   Description: ${effect.description.substring(0, 100)}...`);
                    console.log('');
                });
            }
        }

        console.log('🎉 Streaming test completed successfully!');

    } catch (error) {
        console.error('❌ Streaming test failed:', error);
        console.error('Error details:', error.message);
    }
}

// Run the test
testStreamingComprehensiveTagGeneration(); 