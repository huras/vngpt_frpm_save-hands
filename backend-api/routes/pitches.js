const express = require('express');
const PitchService = require('../services/PitchService');

const router = express.Router();
const pitchService = new PitchService();

// POST /pitches/suggestions/:suggestionId/generate - Generate pitches for a suggestion
router.post('/suggestions/:suggestionId/generate', async (req, res) => {
    try {
        const { suggestionId } = req.params;
        const { count = 3 } = req.body;

        const result = await pitchService.generatePitches(suggestionId, count);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error generating pitches:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Suggestion not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while generating pitches.' });
        }
    }
});

// GET /pitches/suggestions/:suggestionId - Get pitches for a suggestion
router.get('/suggestions/:suggestionId', async (req, res) => {
    try {
        const { suggestionId } = req.params;

        const result = await pitchService.getPitches(suggestionId);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error fetching pitches:', error);
        res.status(500).json({ error: 'An error occurred while fetching pitches.' });
    }
});

// DELETE /pitches/:pitchId - Delete a specific pitch
router.delete('/:pitchId', async (req, res) => {
    try {
        const { pitchId } = req.params;

        const result = await pitchService.deletePitch(pitchId);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error deleting pitch:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Pitch not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while deleting the pitch.' });
        }
    }
});

// DELETE /pitches/suggestions/:suggestionId - Delete all pitches for a suggestion
router.delete('/suggestions/:suggestionId', async (req, res) => {
    try {
        const { suggestionId } = req.params;

        const result = await pitchService.deleteAllPitches(suggestionId);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error deleting all pitches:', error);
        res.status(500).json({ error: 'An error occurred while deleting pitches.' });
    }
});

// POST /pitches/:pitchId/rate - Rate a pitch
router.post('/:pitchId/rate', async (req, res) => {
    try {
        const { pitchId } = req.params;
        const { rating, comment } = req.body;

        if (!rating) {
            return res.status(400).json({ error: 'rating is required.' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'rating must be between 1 and 5.' });
        }

        const result = await pitchService.ratePitch(pitchId, rating, comment);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error rating pitch:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Pitch not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while rating the pitch.' });
        }
    }
});

// POST /pitches/:pitchId/favorite - Toggle favorite status for a pitch
router.post('/:pitchId/favorite', async (req, res) => {
    try {
        const { pitchId } = req.params;

        const result = await pitchService.togglePitchFavorite(pitchId);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error toggling pitch favorite:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Pitch not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while toggling favorite status.' });
        }
    }
});

// POST /pitches/:pitchId/regenerate - Regenerate a specific pitch
router.post('/:pitchId/regenerate', async (req, res) => {
    try {
        const { pitchId } = req.params;
        const { userFeedback } = req.body;

        const result = await pitchService.regeneratePitch(pitchId, userFeedback);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error regenerating pitch:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Pitch not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while regenerating the pitch.' });
        }
    }
});

// GET /pitches/stats - Get pitch statistics
router.get('/stats', async (req, res) => {
    try {
        const { suggestionId } = req.query;

        const stats = await pitchService.getPitchStats(suggestionId);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error getting pitch stats:', error);
        res.status(500).json({ error: 'An error occurred while getting pitch statistics.' });
    }
});

// GET /pitches/top-rated - Get top rated pitches
router.get('/top-rated', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const result = await pitchService.getTopRatedPitches(parseInt(limit));
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error getting top rated pitches:', error);
        res.status(500).json({ error: 'An error occurred while getting top rated pitches.' });
    }
});

// GET /pitches/favorites - Get favorite pitches
router.get('/favorites', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const result = await pitchService.getFavoritePitches(parseInt(limit));
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error getting favorite pitches:', error);
        res.status(500).json({ error: 'An error occurred while getting favorite pitches.' });
    }
});

module.exports = router; 