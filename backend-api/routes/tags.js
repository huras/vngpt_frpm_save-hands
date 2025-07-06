const express = require('express');
const tagService = require('../controllers/TagService');
const storyService = require('../controllers/StoryService');
const { upload } = require('../utils/imageUpload');

const router = express.Router();

// GET /tags - Get all tags with pagination
router.get('/', async(req, res) => {
    try {
        const { page = 1, perPage = 10, search } = req.query;

        if (search) {
            const result = await tagService.searchTags(search, { page, perPage });
            res.json(result);
        } else {
            const result = await tagService.findAllPaginated({}, { page, perPage });
            res.json(result);
        }
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'An error occurred while fetching tags.' });
    }
});

// GET /tags/:id - Get a specific tag
router.get('/:id', async(req, res) => {
    try {
        const tag = await tagService.findById(req.params.id);
        res.json(tag);
    } catch (error) {
        console.error('Error fetching tag:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Tag not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while fetching the tag.' });
        }
    }
});

// POST /tags - Create a new tag
router.post('/', upload.single('image'), async(req, res) => {
    try {
        const { title, short_description } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required.' });
        }

        const tag = await tagService.createWithImage({
            title: title.trim(),
            short_description: short_description || null
        }, req.file);

        res.status(201).json(tag);
    } catch (error) {
        console.error('Error creating tag:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ error: 'A tag with this title already exists.' });
        } else {
            res.status(500).json({ error: 'An error occurred while creating the tag.' });
        }
    }
});

// PUT /tags/:id - Update a tag
router.put('/:id', upload.single('image'), async(req, res) => {
    try {
        const { title, short_description } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required.' });
        }

        const tag = await tagService.updateWithImage(req.params.id, {
            title: title.trim(),
            short_description: short_description || null
        }, req.file);

        res.json(tag);
    } catch (error) {
        console.error('Error updating tag:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Tag not found.' });
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ error: 'A tag with this title already exists.' });
        } else {
            res.status(500).json({ error: 'An error occurred while updating the tag.' });
        }
    }
});

// DELETE /tags/:id - Delete a tag
router.delete('/:id', async(req, res) => {
    try {
        await tagService.deleteWithImage(req.params.id);
        res.json({ message: 'Tag deleted successfully.' });
    } catch (error) {
        console.error('Error deleting tag:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Tag not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while deleting the tag.' });
        }
    }
});

// GET /tags/search/:term - Search tags (alternative endpoint)
router.get('/search/:term', async(req, res) => {
    try {
        const { page = 1, perPage = 10 } = req.query;
        const result = await tagService.searchTags(req.params.term, { page, perPage });
        res.json(result);
    } catch (error) {
        console.error('Error searching tags:', error);
        res.status(500).json({ error: 'An error occurred while searching tags.' });
    }
});

// POST /tags/:id/stories/:storyId - Add tag to story
router.post('/:id/stories/:storyId', async(req, res) => {
    try {
        const tag = await tagService.addTagToStory(req.params.id, req.params.storyId);
        res.json({ message: 'Tag added to story successfully.', tag });
    } catch (error) {
        console.error('Error adding tag to story:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Tag or story not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while adding tag to story.' });
        }
    }
});

// DELETE /tags/:id/stories/:storyId - Remove tag from story
router.delete('/:id/stories/:storyId', async(req, res) => {
    try {
        await tagService.removeTagFromStory(req.params.id, req.params.storyId);
        res.json({ message: 'Tag removed from story successfully.' });
    } catch (error) {
        console.error('Error removing tag from story:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Tag or story not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while removing tag from story.' });
        }
    }
});

// GET /tags/:id/stories - Get all stories for a tag
router.get('/:id/stories', async(req, res) => {
    try {
        const stories = await tagService.getStoriesByTag(req.params.id);
        res.json(stories);
    } catch (error) {
        console.error('Error fetching stories for tag:', error.stack || error);
        if (error.message && error.message.includes('not found')) {
            res.status(404).json({ error: 'Tag not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while fetching stories for tag.' });
        }
    }
});

module.exports = router;