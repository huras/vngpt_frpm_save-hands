const fetch = require('node-fetch');

async function testStreamingSuggestions() {
    try {
        console.log('=== Testing Streaming Suggestions Fix ===');
        
        const storyId = 1; // Use story ID 1 for testing
        const limit = 3; // Test with 3 suggestions
        
        console.log(`Testing streaming suggestions for story ${storyId} with limit ${limit}`);
        
        const response = await fetch(`http://localhost:3056/api/intelligent-tags/suggestions/${storyId}/generate-streaming`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ limit })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Streaming response received, processing...');
        
        const reader = response.body;
        const decoder = new TextDecoder();
        
        let suggestionCount = 0;
        let connected = false;
        
        for await (const chunk of reader) {
            const text = decoder.decode(chunk);
            const lines = text.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        switch (data.type) {
                            case 'connected':
                                console.log('✅ Streaming connection established');
                                connected = true;
                                break;
                            case 'suggestion':
                                suggestionCount++;
                                console.log(`\n📝 Suggestion ${suggestionCount}:`);
                                console.log(`   Tag: ${data.data.tag.title}`);
                                console.log(`   Confidence: ${data.data.confidence}`);
                                console.log(`   Suggestion #: ${data.data.suggestionNumber}/${data.data.totalSuggestions}`);
                                console.log(`   Reasoning: ${data.data.reasoning.substring(0, 100)}...`);
                                break;
                            case 'complete':
                                console.log(`\n✅ Streaming completed successfully!`);
                                console.log(`   Total suggestions generated: ${data.data.suggestions?.length || 0}`);
                                return;
                            case 'error':
                                console.error(`❌ Streaming error: ${data.error}`);
                                return;
                            default:
                                console.log(`Unknown event type: ${data.type}`);
                        }
                    } catch (error) {
                        console.error('Error parsing streaming data:', error);
                        console.error('Raw line:', line);
                    }
                }
            }
        }
        
        if (!connected) {
            console.error('❌ No connection message received');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testStreamingSuggestions(); 