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

// GET /intelligent-tags/statistics - Get rejection statistics
router.get('/statistics', async (req, res) => {
    try {
        const { storyId } = req.query;
        const statistics = await intelligentTagService.getRejectionStatistics(storyId);
        res.json({ success: true, data: statistics });
    } catch (error) {
        console.error('Error getting rejection statistics:', error);
        res.status(500).json({ error: 'An error occurred while getting statistics.' });
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

// GET /intelligent-tags/suggestions/:storyId/reevaluate-status - Check if re-evaluation is needed
router.get('/suggestions/:storyId/reevaluate-status', async (req, res) => {
    try {
        const { storyId } = req.params;

        const isNeeded = await intelligentTagService.isReevaluationNeeded(storyId);
        res.json({ 
            success: true, 
            isReevaluationNeeded: isNeeded 
        });
    } catch (error) {
        console.error('Error checking re-evaluation status:', error);
        res.status(500).json({ error: 'An error occurred while checking re-evaluation status.' });
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

// AI Commentary Routes

// GET /intelligent-tags/commentaries/:storyId/:tagId - Get current AI commentary
router.get('/commentaries/:storyId/:tagId', async (req, res) => {
    try {
        const { storyId, tagId } = req.params;

        const commentary = await intelligentTagService.getCommentary(storyId, tagId);
        res.json({ success: true, data: commentary });
    } catch (error) {
        console.error('Error fetching commentary:', error);
        res.status(500).json({ error: 'An error occurred while fetching commentary.' });
    }
});

// GET /intelligent-tags/commentaries/:storyId/:tagId/history - Get commentary history
router.get('/commentaries/:storyId/:tagId/history', async (req, res) => {
    try {
        const { storyId, tagId } = req.params;

        const history = await intelligentTagService.getCommentaryHistory(storyId, tagId);
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Error fetching commentary history:', error);
        res.status(500).json({ error: 'An error occurred while fetching commentary history.' });
    }
});

// PUT /intelligent-tags/commentaries/:storyId/:tagId - Update AI commentary
router.put('/commentaries/:storyId/:tagId', async (req, res) => {
    try {
        const { storyId, tagId } = req.params;
        const { commentary, userFeedback } = req.body;

        if (!commentary) {
            return res.status(400).json({ error: 'commentary is required.' });
        }

        const result = await intelligentTagService.updateCommentary(storyId, tagId, commentary, userFeedback);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error updating commentary:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Commentary not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while updating commentary.' });
        }
    }
});

// GET /intelligent-tags/commentaries/:storyId - Get all commentaries for a story
router.get('/commentaries/:storyId', async (req, res) => {
    try {
        const { storyId } = req.params;

        const commentaries = await intelligentTagService.getStoryCommentaries(storyId);
        res.json({ success: true, data: commentaries });
    } catch (error) {
        console.error('Error fetching story commentaries:', error);
        res.status(500).json({ error: 'An error occurred while fetching story commentaries.' });
    }
});

// POST /intelligent-tags/commentaries/analyze - Analyze commentary quality
router.post('/commentaries/analyze', async (req, res) => {
    try {
        const { commentary } = req.body;

        if (!commentary) {
            return res.status(400).json({ error: 'commentary is required.' });
        }

        const analysis = await intelligentTagService.analyzeCommentaryQuality(commentary);
        res.json({ success: true, data: analysis });
    } catch (error) {
        console.error('Error analyzing commentary:', error);
        res.status(500).json({ error: 'An error occurred while analyzing commentary.' });
    }
});

// GET /intelligent-tags/commentaries/:storyId/stats - Get commentary statistics
router.get('/commentaries/:storyId/stats', async (req, res) => {
    try {
        const { storyId } = req.params;

        const stats = await intelligentTagService.getCommentaryStats(storyId);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching commentary stats:', error);
        res.status(500).json({ error: 'An error occurred while fetching commentary stats.' });
    }
});

module.exports = router; 