const express = require('express');
const storyService = require('../controllers/StoryService');
const tagService = require('../controllers/TagService');

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

// GET /stories/:id/tags - Get all tags for a story
router.get('/:id/tags', async(req, res) => {
    try {
        const tags = await tagService.getTagsByStory(req.params.id);
        res.json(tags);
    } catch (error) {
        console.error('Error fetching tags for story:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Story not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while fetching tags for story.' });
        }
    }
});

// POST /stories/:id/tags/:tagId - Add tag to story
router.post('/:id/tags/:tagId', async(req, res) => {
    try {
        const tag = await tagService.addTagToStory(req.params.tagId, req.params.id);
        res.json({ message: 'Tag added to story successfully.', tag });
    } catch (error) {
        console.error('Error adding tag to story:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Story or tag not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while adding tag to story.' });
        }
    }
});

// DELETE /stories/:id/tags/:tagId - Remove tag from story
router.delete('/:id/tags/:tagId', async(req, res) => {
    try {
        await tagService.removeTagFromStory(req.params.tagId, req.params.id);
        res.json({ message: 'Tag removed from story successfully.' });
    } catch (error) {
        console.error('Error removing tag from story:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Story or tag not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while removing tag from story.' });
        }
    }
});

module.exports = router;