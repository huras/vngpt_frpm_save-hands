const express = require('express');
const storyService = require('../controllers/StoryService');

const router = express.Router();

// GET /stories - Get all stories with pagination
router.get('/', async(req, res) => {
    try {
        const { page = 1, perPage = 10, search } = req.query;

        if (search) {
            const result = await storyService.searchStories(search, { page, perPage });
            res.json(result);
        } else {
            const result = await storyService.findAllPaginated({}, { page, perPage });
            res.json(result);
        }
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ error: 'An error occurred while fetching stories.' });
    }
});

// GET /stories/:id - Get a specific story
router.get('/:id', async(req, res) => {
    try {
        const story = await storyService.findById(req.params.id);
        res.json(story);
    } catch (error) {
        console.error('Error fetching story:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Story not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while fetching the story.' });
        }
    }
});

// POST /stories - Create a new story
router.post('/', async(req, res) => {
    try {
        const { title, brainstorm } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required.' });
        }

        const story = await storyService.create({
            title: title.trim(),
            brainstorm: brainstorm || ''
        });

        res.status(201).json(story);
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ error: 'An error occurred while creating the story.' });
    }
});

// PUT /stories/:id - Update a story
router.put('/:id', async(req, res) => {
    try {
        const { title, brainstorm } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required.' });
        }

        const story = await storyService.update(req.params.id, {
            title: title.trim(),
            brainstorm: brainstorm || ''
        });

        res.json(story);
    } catch (error) {
        console.error('Error updating story:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Story not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while updating the story.' });
        }
    }
});

// DELETE /stories/:id - Delete a story
router.delete('/:id', async(req, res) => {
    try {
        await storyService.delete(req.params.id);
        res.json({ message: 'Story deleted successfully.' });
    } catch (error) {
        console.error('Error deleting story:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Story not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while deleting the story.' });
        }
    }
});

// GET /stories/search/:term - Search stories (alternative endpoint)
router.get('/search/:term', async(req, res) => {
    try {
        const { page = 1, perPage = 10 } = req.query;
        const result = await storyService.searchStories(req.params.term, { page, perPage });
        res.json(result);
    } catch (error) {
        console.error('Error searching stories:', error);
        res.status(500).json({ error: 'An error occurred while searching stories.' });
    }
});

module.exports = router;