const express = require('express');
const IntelligentTagService = require('../services/IntelligentTagService');

const router = express.Router();
const intelligentTagService = new IntelligentTagService();

// GET /intelligent-tags/suggestions/:storyId - Get suggestions for a story
router.get('/suggestions/:storyId', async (req, res) => {
    try {
        const { storyId } = req.params;
        const { status = 'pending' } = req.query;

        const suggestions = await intelligentTagService.getStorySuggestions(storyId, status);
        res.json({ success: true, data: suggestions });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ error: 'An error occurred while fetching suggestions.' });
    }
});

// POST /intelligent-tags/suggestions/:storyId/generate - Generate new suggestions
router.post('/suggestions/:storyId/generate', async (req, res) => {
    try {
        const { storyId } = req.params;
        const { limit = 10 } = req.body;

        const result = await intelligentTagService.generateSuggestions(storyId, limit);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error generating suggestions:', error);
        res.status(500).json({ error: 'An error occurred while generating suggestions.' });
    }
});

// POST /intelligent-tags/suggestions/:suggestionId/accept - Accept a suggestion
router.post('/suggestions/:suggestionId/accept', async (req, res) => {
    try {
        const { suggestionId } = req.params;
        const { userExplanation } = req.body;

        const result = await intelligentTagService.acceptSuggestion(suggestionId, userExplanation);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error accepting suggestion:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Suggestion not found.' });
        } else if (error.message.includes('not pending')) {
            res.status(400).json({ error: 'Suggestion is not pending.' });
        } else {
            res.status(500).json({ error: 'An error occurred while accepting the suggestion.' });
        }
    }
});

// POST /intelligent-tags/suggestions/:suggestionId/reject - Reject a suggestion
router.post('/suggestions/:suggestionId/reject', async (req, res) => {
    try {
        const { suggestionId } = req.params;
        const { reason } = req.body;

        const result = await intelligentTagService.rejectSuggestion(suggestionId, reason);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error rejecting suggestion:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Suggestion not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while rejecting the suggestion.' });
        }
    }
});

// POST /intelligent-tags/stories/:storyId/tags - Add tag manually with reasoning
router.post('/stories/:storyId/tags', async (req, res) => {
    try {
        const { storyId } = req.params;
        const { tagId, reasoning, userExplanation } = req.body;

        if (!tagId || !reasoning) {
            return res.status(400).json({ error: 'tagId and reasoning are required.' });
        }

        const result = await intelligentTagService.addTagManually(storyId, tagId, reasoning, userExplanation);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error adding tag manually:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Story or tag not found.' });
        } else if (error.message.includes('already associated')) {
            res.status(400).json({ error: 'Tag is already associated with this story.' });
        } else {
            res.status(500).json({ error: 'An error occurred while adding the tag.' });
        }
    }
});

// GET /intelligent-tags/stories/:storyId/reasonings - Get reasoning for story tags
router.get('/stories/:storyId/reasonings', async (req, res) => {
    try {
        const { storyId } = req.params;

        const reasonings = await intelligentTagService.getStoryReasonings(storyId);
        res.json({ success: true, data: reasonings });
    } catch (error) {
        console.error('Error fetching reasonings:', error);
        res.status(500).json({ error: 'An error occurred while fetching reasonings.' });
    }
});

// GET /intelligent-tags/search - Search tags manually
router.get('/search', async (req, res) => {
    try {
        const { query, limit = 20 } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({ error: 'Search query is required.' });
        }

        const tags = await intelligentTagService.searchTags(query.trim(), parseInt(limit));
        res.json({ success: true, data: tags });
    } catch (error) {
        console.error('Error searching tags:', error);
        res.status(500).json({ error: 'An error occurred while searching tags.' });
    }
});

// POST /intelligent-tags/suggestions/:storyId/reevaluate - Re-evaluate existing suggestions
router.post('/suggestions/:storyId/reevaluate', async (req, res) => {
    try {
        const { storyId } = req.params;

        const result = await intelligentTagService.reevaluateSuggestions(storyId);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error re-evaluating suggestions:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Story not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while re-evaluating suggestions.' });
        }
    }
});

module.exports = router; 