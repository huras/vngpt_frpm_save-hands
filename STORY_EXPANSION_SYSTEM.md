# Story Expansion System

## Overview

The Story Expansion System is an advanced AI-powered feature that generates comprehensive story elements based on accepted tag directives. It transforms abstract tag suggestions into concrete story building blocks including arcs, characters, places, organizations, and objects.

## Key Features

### 🎯 Directive-Driven Generation
- Collects all directives from accepted tag suggestions
- Analyzes directive patterns and themes
- Generates story elements that build upon established directions

### 📚 Five Types of Story Elements

#### 1. **ArcSuggestion** - Story Arcs
- **Types**: character_arc, plot_arc, relationship_arc, world_arc, theme_arc
- **Complexity**: simple, moderate, complex, epic
- **Duration**: short, medium, long, series_spanning
- **Features**: Key events, character involvement, confidence scoring

#### 2. **CharacterSuggestion** - Characters
- **Types**: protagonist, antagonist, supporting, mentor, love_interest, comic_relief, foil, deuteragonist
- **Features**: Archetype, personality traits, background, motivations, relationships
- **Integration**: Links to story arcs and other characters

#### 3. **PlaceSuggestion** - Locations
- **Types**: city, town, village, castle, school, hospital, shop, restaurant, park, forest, mountain, beach, island, space_station, underground, fantasy_realm, historical_period, future_setting
- **Features**: Atmosphere, significance, key features, inhabitants, story events
- **Impact**: Creates world-building opportunities

#### 4. **CharacterOrganizationSuggestion** - Organizations
- **Types**: government, military, school, corporation, guild, gang, family, religious, secret_society, academy, hospital, research_institute, mercenary_group, resistance_movement, royal_court, council
- **Features**: Alignment, structure, purpose, leadership, membership, resources, conflicts
- **Role**: Creates social dynamics and conflict opportunities

#### 5. **NotableObjectSuggestion** - Objects
- **Types**: weapon, artifact, tool, vehicle, clothing, jewelry, book, document, technology, magical_item, symbol, trophy, heirloom, currency, medicine, food, furniture, decoration
- **Features**: Rarity, significance, properties, history, current owner, story events
- **Impact**: Drives plot and character development

## Database Schema

### New Models

#### ArcSuggestion
```sql
- id: Primary key
- storyId: Reference to Story
- name: Arc name/title
- high_level_description: Brief description
- arcType: ENUM (character_arc, plot_arc, relationship_arc, world_arc, theme_arc)
- complexity: ENUM (simple, moderate, complex, epic)
- estimatedDuration: ENUM (short, medium, long, series_spanning)
- keyEvents: JSON array of key events
- characterInvolvement: JSON array of character IDs
- relatedTags: JSON array of influencing tag IDs
- sourceDirectives: JSON array of contributing directive IDs
- confidence: AI confidence score (0-1)
- userRating: User rating (1-5 stars)
- isAccepted: Whether user accepted this suggestion
- isActive: Whether suggestion is currently active
```

#### CharacterSuggestion
```sql
- id: Primary key
- storyId: Reference to Story
- name: Character name
- high_level_description: Brief description
- characterType: ENUM (protagonist, antagonist, supporting, etc.)
- archetype: Character archetype
- personalityTraits: JSON array of traits
- background: Character history
- motivations: JSON array of motivations
- relationships: JSON array of relationships
- relatedTags: JSON array of influencing tag IDs
- sourceDirectives: JSON array of contributing directive IDs
- confidence: AI confidence score (0-1)
- userRating: User rating (1-5 stars)
- isAccepted: Whether user accepted this suggestion
- isActive: Whether suggestion is currently active
```

#### PlaceSuggestion
```sql
- id: Primary key
- storyId: Reference to Story
- name: Place name
- high_level_description: Brief description
- placeType: ENUM (city, town, village, castle, etc.)
- atmosphere: Place mood/atmosphere
- significance: ENUM (major, minor, background, pivotal)
- description: Detailed description
- keyFeatures: JSON array of features
- inhabitants: JSON array of inhabitant types
- storyEvents: JSON array of potential events
- relatedTags: JSON array of influencing tag IDs
- sourceDirectives: JSON array of contributing directive IDs
- confidence: AI confidence score (0-1)
- userRating: User rating (1-5 stars)
- isAccepted: Whether user accepted this suggestion
- isActive: Whether suggestion is currently active
```

#### CharacterOrganizationSuggestion
```sql
- id: Primary key
- storyId: Reference to Story
- name: Organization name
- high_level_description: Brief description
- organizationType: ENUM (government, military, school, etc.)
- alignment: ENUM (good, neutral, evil, chaotic, lawful, complex)
- structure: Organizational structure
- purpose: Primary purpose and goals
- leadership: Leadership description
- membership: JSON array of member types
- resources: JSON array of resources
- conflicts: JSON array of potential conflicts
- storyRole: ENUM (ally, antagonist, neutral, pivotal, background)
- relatedTags: JSON array of influencing tag IDs
- sourceDirectives: JSON array of contributing directive IDs
- confidence: AI confidence score (0-1)
- userRating: User rating (1-5 stars)
- isAccepted: Whether user accepted this suggestion
- isActive: Whether suggestion is currently active
```

#### NotableObjectSuggestion
```sql
- id: Primary key
- storyId: Reference to Story
- name: Object name
- high_level_description: Brief description
- objectType: ENUM (weapon, artifact, tool, etc.)
- rarity: ENUM (common, uncommon, rare, legendary, unique)
- significance: ENUM (plot_critical, character_important, world_building, atmospheric, background)
- description: Detailed description
- properties: JSON array of properties
- history: Object history and origin
- currentOwner: Current possessor
- storyEvents: JSON array of related events
- relatedTags: JSON array of influencing tag IDs
- sourceDirectives: JSON array of contributing directive IDs
- confidence: AI confidence score (0-1)
- userRating: User rating (1-5 stars)
- isAccepted: Whether user accepted this suggestion
- isActive: Whether suggestion is currently active
```

## API Endpoints

### Story Expansion Generation

#### POST `/api/story-expansion/generate/:storyId`
Generate story expansion suggestions for a story.

**Response:**
```json
{
  "success": true,
  "data": {
    "storyId": 1,
    "storyTitle": "The Last Dragon Rider",
    "directivesCount": 5,
    "arcSuggestions": [...],
    "characterSuggestions": [...],
    "placeSuggestions": [...],
    "organizationSuggestions": [...],
    "objectSuggestions": [...],
    "generatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Story expansion suggestions generated successfully"
}
```

#### GET `/api/story-expansion/:storyId`
Get all story expansion suggestions for a story.

### Suggestion Management

#### Accept Suggestions
- `POST /api/story-expansion/arcs/:arcId/accept`
- `POST /api/story-expansion/characters/:characterId/accept`
- `POST /api/story-expansion/places/:placeId/accept`
- `POST /api/story-expansion/organizations/:organizationId/accept`
- `POST /api/story-expansion/objects/:objectId/accept`

**Request Body:**
```json
{
  "userRating": 5,
  "ratingComment": "Perfect for my story!"
}
```

#### Delete Suggestions
- `DELETE /api/story-expansion/arcs/:arcId`
- `DELETE /api/story-expansion/characters/:characterId`
- `DELETE /api/story-expansion/places/:placeId`
- `DELETE /api/story-expansion/organizations/:organizationId`
- `DELETE /api/story-expansion/objects/:objectId`

## Frontend Components

### StoryExpansionViewer
A comprehensive React component that provides:

- **Generation Interface**: Button to generate story expansion suggestions
- **Tabbed Navigation**: Separate tabs for each suggestion type
- **Suggestion Cards**: Detailed cards showing suggestion information
- **Accept/Delete Actions**: User can accept or delete suggestions
- **Statistics Dashboard**: Shows counts of directives, suggestions, and accepted items
- **Responsive Design**: Works on desktop and mobile devices

### Features
- Real-time generation with loading states
- Error handling and user feedback
- Rating system for accepted suggestions
- Visual indicators for accepted suggestions
- Type-specific badges and metadata
- Grid layout for suggestion cards

## Usage Workflow

### Prerequisites
1. Story must exist in the database
2. Tag suggestions must be generated and accepted
3. TagSuggestionDirectives must be generated for accepted suggestions

### Generation Process
1. User navigates to story view/edit page
2. User clicks "Generate Story Expansion" button
3. System collects all directives from accepted tag suggestions
4. AI analyzes directives and generates story elements
5. Results are displayed in tabbed interface
6. User can accept, rate, or delete suggestions

### Integration Points
- **TagSuggestionDirective System**: Uses existing directives as input
- **Story Management**: Integrates with existing story CRUD operations
- **Rating System**: Compatible with existing rating components
- **AI Service**: Uses existing AIService for generation

## Technical Implementation

### Services

#### StoryExpansionService
- **Main orchestrator** for story expansion generation
- Handles directive collection and analysis
- Manages AI interactions for each suggestion type
- Provides database operations for suggestions

#### Key Methods
- `generateStoryExpansion(storyId)`: Main generation method
- `collectDirectives(storyId)`: Gathers all relevant directives
- `generateArcSuggestions(story, directives)`: Generates arc suggestions
- `generateCharacterSuggestions(story, directives)`: Generates character suggestions
- `generatePlaceSuggestions(story, directives)`: Generates place suggestions
- `generateOrganizationSuggestions(story, directives)`: Generates organization suggestions
- `generateObjectSuggestions(story, directives)`: Generates object suggestions

### AI Prompts
Each suggestion type has specialized AI prompts that:
- Analyze story context and accepted directives
- Generate appropriate suggestions based on type
- Include confidence scoring and metadata
- Ensure suggestions are coherent and useful

### Database Operations
- **Migrations**: 5 new migration files for suggestion tables
- **Models**: 5 new Sequelize models with associations
- **Indexes**: Optimized indexes for performance
- **Relationships**: Proper foreign key relationships to stories

## Testing

### Test Script
Run `node test-story-expansion.js` to test the system:

```bash
cd backend-api
node test-story-expansion.js
```

### Test Coverage
- Directive collection from accepted tag suggestions
- AI generation for all suggestion types
- Database storage and retrieval
- Error handling and edge cases

## Future Enhancements

### Planned Features
1. **Suggestion Relationships**: Link suggestions to each other
2. **Bulk Operations**: Accept/delete multiple suggestions at once
3. **Export Functionality**: Export suggestions to various formats
4. **Advanced Filtering**: Filter suggestions by type, confidence, etc.
5. **Suggestion History**: Track changes and versions of suggestions
6. **Collaborative Features**: Share suggestions between users

### AI Improvements
1. **Context Awareness**: Better understanding of story progression
2. **Consistency Checking**: Ensure suggestions don't conflict
3. **Personalization**: Learn from user preferences and past choices
4. **Multi-language Support**: Generate suggestions in different languages

## Troubleshooting

### Common Issues

#### "No directives found" Error
- Ensure tag suggestions have been accepted
- Check that TagSuggestionDirectives have been generated
- Verify story has accepted tag suggestions

#### Generation Fails
- Check AI service configuration
- Verify database connections
- Review error logs for specific issues

#### Suggestions Don't Appear
- Check database migrations have been run
- Verify model associations are correct
- Ensure API endpoints are properly configured

### Debug Mode
Enable debug logging in the StoryExpansionService for detailed information about the generation process.

## Conclusion

The Story Expansion System provides a powerful way to transform abstract tag directives into concrete story elements. By leveraging AI analysis of accepted directives, it generates coherent and useful suggestions that help authors develop their stories in meaningful directions.

The system is designed to be extensible, allowing for future enhancements while maintaining compatibility with existing tag and directive systems. 