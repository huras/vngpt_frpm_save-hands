const express = require('express');
const router = express.Router();
const StoryExpansionService = require('../services/StoryExpansionService');
const { 
    Story,
    Tag,
    TagSuggestion,
    StoryTagReasoning,
    ArcSuggestion, 
    CharacterSuggestion, 
    PlaceSuggestion, 
    CharacterOrganizationSuggestion, 
    NotableObjectSuggestion 
} = require('../models');

const storyExpansionService = new StoryExpansionService();

// POST /api/story-expansion/generate/:storyId - Generate story expansion suggestions
router.post('/generate/:storyId', async (req, res) => {
    try {
        const { storyId } = req.params;

        const result = await storyExpansionService.generateStoryExpansion(storyId);

        res.json({
            success: true,
            data: result,
            message: 'Story expansion suggestions generated successfully'
        });
    } catch (error) {
        console.error('Error generating story expansion:', error);
        res.status(500).json({
            error: error.message || 'An error occurred while generating story expansion suggestions.'
        });
    }
});

// POST /api/story-expansion/characters/generate/:storyId - Generate a single character suggestion
router.post('/characters/generate/:storyId', async (req, res) => {
    try {
        const { storyId } = req.params;

        // Get story with all related data
        const story = await Story.findByPk(storyId, {
            include: [
                { 
                    model: TagSuggestion, 
                    as: 'tagSuggestions',
                    include: [{ model: Tag, as: 'tag' }]
                },
                { 
                    model: StoryTagReasoning, 
                    as: 'tagReasonings',
                    include: [{ model: Tag, as: 'tag' }]
                },
                { model: CharacterSuggestion, as: 'characterSuggestions' }
            ]
        });

        if (!story) {
            return res.status(404).json({
                error: 'Story not found.'
            });
        }

        // Collect all directives for accepted tag suggestions
        const directives = await storyExpansionService.collectDirectives(storyId);
        
        if (directives.length === 0) {
            return res.status(400).json({
                error: 'No directives found. Please accept some tag suggestions first to generate character suggestions.'
            });
        }

        // Use the existing method to generate a single character
        const characterSuggestions = await storyExpansionService.generateCharacterSuggestions(story, directives, 1);
        
        if (characterSuggestions.length === 0) {
            return res.status(500).json({
                error: 'Failed to generate character suggestion.'
            });
        }

        res.json({
            success: true,
            data: characterSuggestions[0],
            message: 'Character suggestion generated successfully'
        });
    } catch (error) {
        console.error('Error generating character suggestion:', error);
        res.status(500).json({
            error: error.message || 'An error occurred while generating character suggestion.'
        });
    }
});

// GET /api/story-expansion/:storyId - Get all story expansion suggestions for a story
router.get('/:storyId', async (req, res) => {
    try {
        const { storyId } = req.params;

        const result = await storyExpansionService.getStoryExpansion(storyId);

        res.json({
            success: true,
            data: result,
            message: 'Story expansion suggestions retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting story expansion:', error);
        res.status(500).json({
            error: 'An error occurred while retrieving story expansion suggestions.'
        });
    }
});

// POST /api/story-expansion/arcs/:arcId/accept - Accept an arc suggestion
router.post('/arcs/:arcId/accept', async (req, res) => {
    try {
        const { arcId } = req.params;
        const { userRating, ratingComment } = req.body;

        const arcSuggestion = await ArcSuggestion.findByPk(arcId);
        if (!arcSuggestion) {
            return res.status(404).json({
                error: 'Arc suggestion not found.'
            });
        }

        await arcSuggestion.update({
            isAccepted: true,
            acceptedAt: new Date(),
            userRating: userRating || null,
            ratingComment: ratingComment || null,
            ratedAt: userRating ? new Date() : null
        });

        res.json({
            success: true,
            data: arcSuggestion,
            message: 'Arc suggestion accepted successfully'
        });
    } catch (error) {
        console.error('Error accepting arc suggestion:', error);
        res.status(500).json({
            error: 'An error occurred while accepting the arc suggestion.'
        });
    }
});

// POST /api/story-expansion/characters/:characterId/accept - Accept a character suggestion
router.post('/characters/:characterId/accept', async (req, res) => {
    try {
        const { characterId } = req.params;
        const { userRating, ratingComment } = req.body;

        const characterSuggestion = await CharacterSuggestion.findByPk(characterId);
        if (!characterSuggestion) {
            return res.status(404).json({
                error: 'Character suggestion not found.'
            });
        }

        await characterSuggestion.update({
            isAccepted: true,
            acceptedAt: new Date(),
            userRating: userRating || null,
            ratingComment: ratingComment || null,
            ratedAt: userRating ? new Date() : null
        });

        res.json({
            success: true,
            data: characterSuggestion,
            message: 'Character suggestion accepted successfully'
        });
    } catch (error) {
        console.error('Error accepting character suggestion:', error);
        res.status(500).json({
            error: 'An error occurred while accepting the character suggestion.'
        });
    }
});

// POST /api/story-expansion/places/:placeId/accept - Accept a place suggestion
router.post('/places/:placeId/accept', async (req, res) => {
    try {
        const { placeId } = req.params;
        const { userRating, ratingComment } = req.body;

        const placeSuggestion = await PlaceSuggestion.findByPk(placeId);
        if (!placeSuggestion) {
            return res.status(404).json({
                error: 'Place suggestion not found.'
            });
        }

        await placeSuggestion.update({
            isAccepted: true,
            acceptedAt: new Date(),
            userRating: userRating || null,
            ratingComment: ratingComment || null,
            ratedAt: userRating ? new Date() : null
        });

        res.json({
            success: true,
            data: placeSuggestion,
            message: 'Place suggestion accepted successfully'
        });
    } catch (error) {
        console.error('Error accepting place suggestion:', error);
        res.status(500).json({
            error: 'An error occurred while accepting the place suggestion.'
        });
    }
});

// POST /api/story-expansion/organizations/:organizationId/accept - Accept an organization suggestion
router.post('/organizations/:organizationId/accept', async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { userRating, ratingComment } = req.body;

        const organizationSuggestion = await CharacterOrganizationSuggestion.findByPk(organizationId);
        if (!organizationSuggestion) {
            return res.status(404).json({
                error: 'Organization suggestion not found.'
            });
        }

        await organizationSuggestion.update({
            isAccepted: true,
            acceptedAt: new Date(),
            userRating: userRating || null,
            ratingComment: ratingComment || null,
            ratedAt: userRating ? new Date() : null
        });

        res.json({
            success: true,
            data: organizationSuggestion,
            message: 'Organization suggestion accepted successfully'
        });
    } catch (error) {
        console.error('Error accepting organization suggestion:', error);
        res.status(500).json({
            error: 'An error occurred while accepting the organization suggestion.'
        });
    }
});

// POST /api/story-expansion/objects/:objectId/accept - Accept an object suggestion
router.post('/objects/:objectId/accept', async (req, res) => {
    try {
        const { objectId } = req.params;
        const { userRating, ratingComment } = req.body;

        const objectSuggestion = await NotableObjectSuggestion.findByPk(objectId);
        if (!objectSuggestion) {
            return res.status(404).json({
                error: 'Object suggestion not found.'
            });
        }

        await objectSuggestion.update({
            isAccepted: true,
            acceptedAt: new Date(),
            userRating: userRating || null,
            ratingComment: ratingComment || null,
            ratedAt: userRating ? new Date() : null
        });

        res.json({
            success: true,
            data: objectSuggestion,
            message: 'Object suggestion accepted successfully'
        });
    } catch (error) {
        console.error('Error accepting object suggestion:', error);
        res.status(500).json({
            error: 'An error occurred while accepting the object suggestion.'
        });
    }
});

// DELETE /api/story-expansion/arcs/:arcId - Delete an arc suggestion
router.delete('/arcs/:arcId', async (req, res) => {
    try {
        const { arcId } = req.params;

        const arcSuggestion = await ArcSuggestion.findByPk(arcId);
        if (!arcSuggestion) {
            return res.status(404).json({
                error: 'Arc suggestion not found.'
            });
        }

        await arcSuggestion.update({ isActive: false });

        res.json({
            success: true,
            message: 'Arc suggestion deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting arc suggestion:', error);
        res.status(500).json({
            error: 'An error occurred while deleting the arc suggestion.'
        });
    }
});

// DELETE /api/story-expansion/characters/:characterId - Delete a character suggestion
router.delete('/characters/:characterId', async (req, res) => {
    try {
        const { characterId } = req.params;

        const characterSuggestion = await CharacterSuggestion.findByPk(characterId);
        if (!characterSuggestion) {
            return res.status(404).json({
                error: 'Character suggestion not found.'
            });
        }

        await characterSuggestion.update({ isActive: false });

        res.json({
            success: true,
            message: 'Character suggestion deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting character suggestion:', error);
        res.status(500).json({
            error: 'An error occurred while deleting the character suggestion.'
        });
    }
});

// DELETE /api/story-expansion/places/:placeId - Delete a place suggestion
router.delete('/places/:placeId', async (req, res) => {
    try {
        const { placeId } = req.params;

        const placeSuggestion = await PlaceSuggestion.findByPk(placeId);
        if (!placeSuggestion) {
            return res.status(404).json({
                error: 'Place suggestion not found.'
            });
        }

        await placeSuggestion.update({ isActive: false });

        res.json({
            success: true,
            message: 'Place suggestion deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting place suggestion:', error);
        res.status(500).json({
            error: 'An error occurred while deleting the place suggestion.'
        });
    }
});

// DELETE /api/story-expansion/organizations/:organizationId - Delete an organization suggestion
router.delete('/organizations/:organizationId', async (req, res) => {
    try {
        const { organizationId } = req.params;

        const organizationSuggestion = await CharacterOrganizationSuggestion.findByPk(organizationId);
        if (!organizationSuggestion) {
            return res.status(404).json({
                error: 'Organization suggestion not found.'
            });
        }

        await organizationSuggestion.update({ isActive: false });

        res.json({
            success: true,
            message: 'Organization suggestion deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting organization suggestion:', error);
        res.status(500).json({
            error: 'An error occurred while deleting the organization suggestion.'
        });
    }
});

// DELETE /api/story-expansion/objects/:objectId - Delete an object suggestion
router.delete('/objects/:objectId', async (req, res) => {
    try {
        const { objectId } = req.params;

        const objectSuggestion = await NotableObjectSuggestion.findByPk(objectId);
        if (!objectSuggestion) {
            return res.status(404).json({
                error: 'Object suggestion not found.'
            });
        }

        await objectSuggestion.update({ isActive: false });

        res.json({
            success: true,
            message: 'Object suggestion deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting object suggestion:', error);
        res.status(500).json({
            error: 'An error occurred while deleting the object suggestion.'
        });
    }
});

module.exports = router; 