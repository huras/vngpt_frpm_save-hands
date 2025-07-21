const ComprehensiveTagGenerationService = require('./services/ComprehensiveTagGenerationService');

async function testStructuredTagGeneration() {
    console.log('Testing structured tag generation...\n');
    
    const service = new ComprehensiveTagGenerationService();
    
    const testStory = {
        title: "The Last Dragon Rider",
        brainstorm: "A young orphan discovers they are the last descendant of an ancient dragon-riding family. Set in a world where dragons were hunted to near extinction, they must learn to trust a wounded dragon and together restore the ancient bond between humans and dragons. The story explores themes of trust, redemption, and the balance between nature and civilization."
    };
    
    try {
        console.log('Testing selectRelevantTags with structured objects...');
        const relevantTags = await service.selectRelevantTags(
            testStory.title, 
            testStory.brainstorm, 
            5 // Limit to 5 tags for testing
        );
        
        console.log(`\n✅ Successfully generated ${relevantTags.length} relevant tags:`);
        relevantTags.forEach((tag, index) => {
            console.log(`\n${index + 1}. ${tag.title} (ID: ${tag.id})`);
            console.log(`   Category: ${tag.category}`);
            console.log(`   Reasoning: ${tag.selectionReasoning}`);
            console.log(`   Relevance Score: ${tag.relevanceScore}`);
        });
        
        // Test related tags generation
        if (relevantTags.length > 0) {
            console.log('\n\nTesting generateRelatedTagsForTag with structured objects...');
            const relatedTags = await service.generateRelatedTagsForTag(
                relevantTags[0], 
                3 // Limit to 3 related tags
            );
            
            console.log(`\n✅ Successfully generated ${relatedTags.length} related tags for "${relevantTags[0].title}":`);
            relatedTags.forEach((tag, index) => {
                console.log(`\n${index + 1}. ${tag.title} (ID: ${tag.id})`);
                console.log(`   Relationship Type: ${tag.relationshipType}`);
                console.log(`   Reasoning: ${tag.relationshipReasoning}`);
                console.log(`   Confidence: ${tag.confidence}`);
            });
        }
        
        console.log('\n\n🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testStructuredTagGeneration(); 