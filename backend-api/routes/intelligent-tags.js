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

// POST /intelligent-tags/suggestions/:suggestionId/regenerate - Regenerate a single suggestion
router.post('/suggestions/:suggestionId/regenerate', async (req, res) => {
    try {
        const { suggestionId } = req.params;
        const { userFeedback } = req.body;

        const result = await intelligentTagService.regenerateSuggestion(suggestionId, userFeedback);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error regenerating suggestion:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Suggestion not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while regenerating the suggestion.' });
        }
    }
});

// GET /intelligent-tags/suggestions/:storyId/:tagId/history - Get suggestion history
router.get('/suggestions/:storyId/:tagId/history', async (req, res) => {
    try {
        const { storyId, tagId } = req.params;

        const result = await intelligentTagService.getSuggestionHistory(storyId, tagId);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error getting suggestion history:', error);
        res.status(500).json({ error: 'An error occurred while getting suggestion history.' });
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

// DELETE /intelligent-tags/suggestions/:storyId/clear-pending - Clear all pending suggestions
router.delete('/suggestions/:storyId/clear-pending', async (req, res) => {
    try {
        const { storyId } = req.params;

        const result = await intelligentTagService.clearPendingSuggestions(storyId);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error clearing pending suggestions:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Story not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while clearing pending suggestions.' });
        }
    }
});

// POST /intelligent-tags/suggestions/:storyId/generate-streaming - Generate suggestions iteratively with streaming
router.post('/suggestions/:storyId/generate-streaming', async (req, res) => {
    try {
        const { storyId } = req.params;
        const { limit = 10 } = req.body;

        // Set headers for streaming
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // Send initial connection message
        res.write('data: {"type": "connected", "message": "Streaming suggestions started"}\n\n');

        const result = await intelligentTagService.generateSuggestionsStreaming(storyId, limit, (suggestion) => {
            // Send each suggestion as it's generated
            res.write(`data: ${JSON.stringify({
                type: 'suggestion',
                data: suggestion
            })}\n\n`);
        });

        // Send completion message
        res.write(`data: ${JSON.stringify({
            type: 'complete',
            data: result
        })}\n\n`);

        res.end();
    } catch (error) {
        console.error('Error generating streaming suggestions:', error);
        
        // Send error message if connection is still open
        if (!res.headersSent) {
            res.status(500).json({ error: 'An error occurred while generating suggestions.' });
        } else {
            res.write(`data: ${JSON.stringify({
                type: 'error',
                error: 'An error occurred while generating suggestions.'
            })}\n\n`);
            res.end();
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

// POST /intelligent-tags/commentaries/:storyId/:tagId - Create new AI commentary
router.post('/commentaries/:storyId/:tagId', async (req, res) => {
    try {
        const { storyId, tagId } = req.params;
        const { commentary, userFeedback, triggerType = 'user_feedback' } = req.body;

        if (!commentary) {
            return res.status(400).json({ error: 'commentary is required.' });
        }

        const result = await intelligentTagService.createCommentary(storyId, tagId, commentary, userFeedback, triggerType);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error creating commentary:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Story or tag not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while creating commentary.' });
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

// POST /intelligent-tags/generate-directive - Generate AI directive for tag
router.post('/generate-directive', async (req, res) => {
    try {
        const { storyId, tagId, storyTitle, storyBrainstorm } = req.body;

        if (!storyId || !tagId) {
            return res.status(400).json({ error: 'storyId and tagId are required.' });
        }

        const directive = await intelligentTagService.generateTagDirective(storyId, tagId, storyTitle, storyBrainstorm);
        res.json({ success: true, data: { directive } });
    } catch (error) {
        console.error('Error generating directive:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Story or tag not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while generating directive.' });
        }
    }
});

// POST /intelligent-tags/generate-explanation - Generate AI explanation for tag (legacy)
router.post('/generate-explanation', async (req, res) => {
    try {
        const { storyId, tagId, storyTitle, storyBrainstorm } = req.body;

        if (!storyId || !tagId) {
            return res.status(400).json({ error: 'storyId and tagId are required.' });
        }

        const explanation = await intelligentTagService.generateTagExplanation(storyId, tagId, storyTitle, storyBrainstorm);
        res.json({ success: true, data: { explanation } });
    } catch (error) {
        console.error('Error generating explanation:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Story or tag not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while generating explanation.' });
        }
    }
});

// POST /intelligent-tags/suggestions/:suggestionId/rate - Rate a tag suggestion
router.post('/suggestions/:suggestionId/rate', async (req, res) => {
    try {
        const { suggestionId } = req.params;
        const { rating, comment } = req.body;

        if (!rating) {
            return res.status(400).json({ error: 'rating is required.' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'rating must be between 1 and 5.' });
        }

        const result = await intelligentTagService.rateSuggestion(suggestionId, rating, comment);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error rating suggestion:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Suggestion not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while rating the suggestion.' });
        }
    }
});

// POST /intelligent-tags/reasonings/:reasoningId/reject - Reject an accepted suggestion
router.post('/reasonings/:reasoningId/reject', async (req, res) => {
    try {
        const { reasoningId } = req.params;
        const { reason } = req.body;

        const result = await intelligentTagService.rejectAcceptedSuggestion(reasoningId, reason);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error rejecting accepted suggestion:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Reasoning not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while rejecting the suggestion.' });
        }
    }
});

// POST /intelligent-tags/reasonings/:reasoningId/rate - Rate a reasoning directly
router.post('/reasonings/:reasoningId/rate', async (req, res) => {
    try {
        const { reasoningId } = req.params;
        const { rating, comment } = req.body;

        if (!rating) {
            return res.status(400).json({ error: 'rating is required.' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'rating must be between 1 and 5.' });
        }

        const result = await intelligentTagService.rateReasoning(reasoningId, rating, comment);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error rating reasoning:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Reasoning not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while rating the reasoning.' });
        }
    }
});

// PUT /intelligent-tags/reasonings/:reasoningId - Update a reasoning
router.put('/reasonings/:reasoningId', async (req, res) => {
    try {
        const { reasoningId } = req.params;
        const { reasoning } = req.body;

        if (!reasoning) {
            return res.status(400).json({ error: 'reasoning is required.' });
        }

        const result = await intelligentTagService.updateReasoning(reasoningId, reasoning);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error updating reasoning:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Reasoning not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while updating the reasoning.' });
        }
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