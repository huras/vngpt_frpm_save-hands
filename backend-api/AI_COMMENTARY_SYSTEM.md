# AI Commentary System

## Overview

The AI Commentary System is designed to track and improve AI reasoning for story-tag relationships over time. Instead of having a single, static reasoning field, this system maintains a history of AI commentaries that can be improved based on user feedback and story context changes.

## Problem Solved

**Before**: AI reasoning was generic and static:
- "Basic suggestion for Comedy - this tag might fit your story based on general compatibility."
- No way to improve reasoning over time
- No tracking of how reasoning evolved

**After**: AI reasoning is specific and improves over time:
- Tracks multiple versions of AI commentary
- Allows user feedback to improve reasoning
- Provides quality analysis and suggestions
- Shows commentary history and evolution

## Architecture

### Models

#### AICommentary
- **id**: Primary key
- **storyId**: Reference to Story
- **tagId**: Reference to Tag
- **commentary**: The AI reasoning text
- **version**: Version number (increments with each update)
- **isCurrent**: Boolean indicating if this is the active commentary
- **confidence**: AI confidence score (0-1)
- **contextTags**: JSON array of tag IDs present when commentary was created
- **storyContext**: JSON object with story context (title, brainstorm, etc.)
- **triggerType**: What triggered this commentary ('initial_suggestion', 'reevaluation', 'user_feedback', 'story_update', 'manual_update')
- **previousCommentaryId**: Reference to the previous commentary this replaces
- **userFeedback**: User feedback that led to this update

#### StoryTagReasoning (Updated)
- **currentCommentaryId**: Reference to the current AI commentary
- **reasoning**: Now contains the current commentary text (synced with AICommentary)

### Services

#### AICommentaryService
- **createCommentary()**: Create new commentary version
- **getCurrentCommentary()**: Get active commentary for story-tag pair
- **getCommentaryHistory()**: Get all commentary versions
- **updateCommentary()**: Create improved commentary based on feedback
- **generateImprovedCommentary()**: Use AI to improve existing commentary
- **analyzeCommentaryQuality()**: Analyze commentary quality and suggest improvements
- **getCommentaryStats()**: Get statistics about commentaries

#### IntelligentTagService (Updated)
- Integrates AICommentaryService
- Creates commentaries when accepting suggestions
- Creates commentaries when adding tags manually
- Provides methods to manage commentaries

## API Endpoints

### Commentary Management
- `GET /intelligent-tags/commentaries/:storyId/:tagId` - Get current commentary
- `GET /intelligent-tags/commentaries/:storyId/:tagId/history` - Get commentary history
- `PUT /intelligent-tags/commentaries/:storyId/:tagId` - Update commentary
- `GET /intelligent-tags/commentaries/:storyId` - Get all commentaries for a story

### Analysis
- `POST /intelligent-tags/commentaries/analyze` - Analyze commentary quality
- `GET /intelligent-tags/commentaries/:storyId/stats` - Get commentary statistics

## Usage Examples

### Creating Initial Commentary
```javascript
// When accepting an AI suggestion
const commentary = await commentaryService.createCommentary(
    storyId,
    tagId,
    "This Comedy tag enhances the story's character development...",
    {
        confidence: 0.8,
        triggerType: 'initial_suggestion',
        contextTags: [1, 2, 3]
    }
);
```

### Updating Commentary with User Feedback
```javascript
// When user provides feedback
const updatedCommentary = await commentaryService.updateCommentary(
    storyId,
    tagId,
    "The Comedy tag specifically enhances character development through witty dialogue...",
    "Previous commentary was too generic, need more specific examples"
);
```

### Analyzing Commentary Quality
```javascript
const analysis = await commentaryService.analyzeCommentaryQuality(
    "This commentary provides specific insights about character development..."
);

// Returns:
// {
//   scores: { specificity: 8, insightfulness: 7, avoidance_of_generic: 9, concreteness: 8 },
//   overall_score: 8,
//   suggestions: ["Add more specific examples", "Mention story themes"],
//   is_generic: false
// }
```

## Frontend Integration

### AICommentaryViewer Component
- Displays current commentary with version info
- Shows commentary history
- Allows editing and updating commentaries
- Provides quality analysis
- Shows user feedback

### Usage in Story View
```jsx
<AICommentaryViewer
    storyId={story.id}
    tagId={tag.id}
    tag={tag}
    onCommentaryUpdate={(updatedCommentary) => {
        // Handle commentary update
    }}
/>
```

## Quality Improvement Process

1. **Initial Suggestion**: AI generates basic commentary
2. **User Feedback**: User provides feedback on generic reasoning
3. **AI Improvement**: System uses AI to generate improved commentary
4. **Quality Analysis**: System analyzes new commentary quality
5. **Iteration**: Process continues as story evolves

## Benefits

1. **Better Reasoning**: AI commentaries become more specific and insightful over time
2. **User Feedback Integration**: User feedback directly improves AI reasoning
3. **Quality Tracking**: System tracks and analyzes commentary quality
4. **History Preservation**: Full history of how reasoning evolved
5. **Context Awareness**: Commentaries include story context for better relevance

## Migration

The system includes migrations to:
1. Create the `AICommentaries` table
2. Add `currentCommentaryId` to `StoryTagReasonings` table
3. Preserve existing reasoning data

## Testing

Run the test script to verify the system:
```bash
node test-ai-commentary.js
```

This will test all major functionality including creation, updating, history tracking, and quality analysis. 