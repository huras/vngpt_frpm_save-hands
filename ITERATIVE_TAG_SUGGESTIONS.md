# Iterative Tag Suggestions Feature

## Overview

The Iterative Tag Suggestions feature provides intelligent, context-aware tag recommendations for stories. Instead of generating all suggestions at once, it generates them one by one, with each subsequent suggestion building upon the context of previously generated suggestions.

## Key Features

### 1. **Iterative Generation**
- Generates suggestions one at a time
- Each suggestion considers previous suggestions for context
- Avoids duplicate or redundant suggestions
- Builds creative momentum across suggestions

### 2. **Real-time Streaming**
- Frontend receives suggestions as they're generated
- Immediate visual feedback with progress tracking
- No need to wait for all suggestions to complete
- Better user experience with live updates

### 3. **Context-Aware AI**
- AI considers previously suggested tags and their reasoning
- Builds upon creative themes established by earlier suggestions
- Avoids suggesting similar concepts or overlapping directions
- Each suggestion offers a distinct new story direction

### 4. **Smart Duplicate Prevention**
- Tracks suggested tags across the entire session
- Prevents suggesting tags already selected by the user
- Avoids suggesting tags that were previously rejected
- Learns from user feedback to improve future suggestions

## Technical Implementation

### Backend Architecture

#### 1. **AI Service (`AIService.js`)**
```javascript
async *generateIntelligentSuggestionsIterative(story, availableTags, limit = 10)
```
- Generator function that yields suggestions one at a time
- Maintains context of previously suggested tags
- Includes reasoning and creative themes in prompt
- Handles AI service errors gracefully

#### 2. **Streaming Route (`intelligent-tags.js`)**
```javascript
POST /intelligent-tags/suggestions/:storyId/generate-streaming
```
- Sets up Server-Sent Events (SSE) headers
- Streams each suggestion as it's generated
- Sends progress updates and completion status
- Handles connection errors and timeouts

#### 3. **Service Layer (`IntelligentTagService.js`)**
```javascript
async generateSuggestionsStreaming(storyId, limit, onSuggestionCallback)
```
- Orchestrates the iterative generation process
- Manages database operations for each suggestion
- Provides callback mechanism for streaming
- Handles error recovery and fallbacks

### Frontend Architecture

#### 1. **API Service (`intelligentTagApi.js`)**
```javascript
generateSuggestionsStreaming(storyId, limit, onSuggestion, onComplete, onError)
```
- Uses Fetch API with streaming support
- Parses Server-Sent Events data
- Provides callback functions for different events
- Handles connection errors and retries

#### 2. **UI Component (`StreamingTagSuggestions.jsx`)**
```javascript
const StreamingTagSuggestions = ({ storyId })
```
- Manages streaming state and progress
- Displays suggestions as they arrive
- Provides accept/reject functionality
- Shows real-time progress indicators

## Data Flow

### 1. **Initialization**
```
User clicks "Generate Suggestions" 
→ Frontend calls generateSuggestionsStreaming()
→ Backend validates story and available tags
→ AI service connection test
→ Streaming connection established
```

### 2. **Iterative Generation**
```
For each suggestion (1 to limit):
  → AI generates suggestion with context of previous suggestions
  → Backend saves suggestion to database
  → Suggestion streamed to frontend
  → Frontend displays suggestion immediately
  → Context updated for next iteration
```

### 3. **Completion**
```
All suggestions generated
→ Completion message sent to frontend
→ Frontend refreshes suggestions list
→ User can accept/reject suggestions
```

## Context Building Strategy

### 1. **Previous Suggestions Context**
The AI prompt includes:
- List of previously suggested tags
- Reasoning for each previous suggestion
- Creative themes established
- Story directions explored

### 2. **Creative Strategy**
For each new suggestion, the AI considers:
- How to build upon previous creative momentum
- Ways to complement or contrast with previous themes
- New storytelling possibilities not yet explored
- Avoiding redundancy while maintaining coherence

### 3. **Learning from Feedback**
The system incorporates:
- Previously rejected suggestions and reasons
- User preferences and style indicators
- Common rejection patterns
- Successful suggestion characteristics

## Error Handling

### 1. **AI Service Failures**
- Connection test before starting
- Graceful fallback to simple suggestions
- Error messages sent to frontend
- Retry mechanisms for transient failures

### 2. **Streaming Interruptions**
- Connection timeout handling
- Partial suggestion recovery
- Progress preservation
- User notification of issues

### 3. **Database Errors**
- Transaction rollback on failures
- Duplicate suggestion prevention
- Data consistency checks
- Error logging and monitoring

## Performance Considerations

### 1. **Rate Limiting**
- 500ms delay between AI requests
- Prevents API rate limit issues
- Maintains responsive user experience
- Configurable timing parameters

### 2. **Memory Management**
- Streaming reduces memory usage
- Suggestions processed incrementally
- Context built progressively
- Garbage collection friendly

### 3. **Scalability**
- Stateless streaming architecture
- Horizontal scaling support
- Connection pooling
- Load balancing ready

## Usage Examples

### Basic Usage
```javascript
// Generate 5 iterative suggestions
intelligentTagApi.generateSuggestionsStreaming(
  storyId,
  5,
  (suggestion) => {
    console.log('New suggestion:', suggestion.tag.title);
    // Add to UI immediately
  },
  (result) => {
    console.log('All suggestions complete');
    // Refresh UI
  },
  (error) => {
    console.error('Streaming error:', error);
    // Show error message
  }
);
```

### Advanced Usage with Progress Tracking
```javascript
const [progress, setProgress] = useState({ current: 0, total: 0 });
const [suggestions, setSuggestions] = useState([]);

intelligentTagApi.generateSuggestionsStreaming(
  storyId,
  limit,
  (suggestion) => {
    setSuggestions(prev => [...prev, suggestion]);
    setProgress({
      current: suggestion.suggestionNumber,
      total: suggestion.totalSuggestions
    });
  },
  (result) => {
    setProgress({ current: 0, total: 0 });
    // Handle completion
  }
);
```

## Configuration

### Environment Variables
```bash
# AI Service Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo

# Streaming Configuration
STREAMING_TIMEOUT=30000
STREAMING_RETRY_ATTEMPTS=3
```

### Backend Configuration
```javascript
// Default settings in IntelligentTagService
const DEFAULT_LIMIT = 10;
const AI_REQUEST_DELAY = 500; // ms
const MAX_RETRIES = 3;
```

## Testing

### Manual Testing
```bash
# Test streaming endpoint
curl -X POST http://localhost:3056/api/intelligent-tags/suggestions/1/generate-streaming \
  -H "Content-Type: application/json" \
  -d '{"limit": 3}'
```

### Automated Testing
```bash
# Run the test script
cd backend-api
node test-streaming-fix.js
```

## Troubleshooting

### Common Issues

1. **Port Mismatch**
   - Ensure frontend points to correct backend port (3056)
   - Check API configuration in `src/services/api.js`

2. **Streaming Connection Issues**
   - Verify CORS settings
   - Check network connectivity
   - Review server logs for errors

3. **AI Service Failures**
   - Validate OpenAI API key
   - Check API rate limits
   - Review AI service logs

4. **Duplicate Suggestions**
   - Verify database constraints
   - Check suggestion tracking logic
   - Review context building

### Debug Mode
Enable detailed logging by setting:
```javascript
console.log('AI Service Debug:', true);
console.log('Streaming Debug:', true);
```

## Future Enhancements

### 1. **Advanced Context**
- Semantic similarity analysis
- Genre-specific suggestion patterns
- User preference learning
- Collaborative filtering

### 2. **Performance Optimizations**
- Caching of common suggestions
- Batch processing for multiple stories
- Predictive suggestion loading
- Background suggestion generation

### 3. **User Experience**
- Suggestion preview before generation
- Customizable suggestion parameters
- Suggestion history and favorites
- Export/import suggestion sets

## API Reference

### Endpoints

#### `POST /api/intelligent-tags/suggestions/:storyId/generate-streaming`
Generates iterative tag suggestions with streaming.

**Parameters:**
- `storyId` (number): ID of the story
- `limit` (number, optional): Number of suggestions to generate (default: 10)

**Response:**
Server-Sent Events stream with the following event types:
- `connected`: Connection established
- `suggestion`: Individual suggestion data
- `complete`: Generation completed
- `error`: Error occurred

**Example Response:**
```
data: {"type": "connected", "message": "Streaming suggestions started"}

data: {"type": "suggestion", "data": {"tagId": 123, "tag": {...}, "reasoning": "...", "confidence": 0.8, "suggestionNumber": 1, "totalSuggestions": 5}}

data: {"type": "complete", "data": {"suggestions": [...], "message": "Streaming suggestions completed successfully"}}
```

### Error Codes

- `400`: Invalid story ID or parameters
- `404`: Story not found
- `500`: AI service error or database error
- `503`: AI service unavailable

## Contributing

When contributing to this feature:

1. **Follow the iterative pattern** - always consider context
2. **Test streaming thoroughly** - ensure real-time updates work
3. **Handle errors gracefully** - provide meaningful error messages
4. **Document changes** - update this documentation
5. **Maintain performance** - avoid blocking operations

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs for detailed error information
3. Test with the provided test scripts
4. Consult the API reference for endpoint details 