const express = require('express');
const tagService = require('../controllers/TagService');
const storyService = require('../controllers/StoryService');
const { upload } = require('../utils/mediaUpload');

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
router.post('/', upload.single('media'), async(req, res) => {
    try {
        const { title, short_description } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required.' });
        }

        const tag = await tagService.createWithMedia({
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
router.put('/:id', upload.single('media'), async(req, res) => {
    try {
        const { title, short_description } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required.' });
        }

        const tag = await tagService.updateWithMedia(req.params.id, {
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
        await tagService.deleteWithMedia(req.params.id);
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

// POST /tags/:id/stories/:storyId - Add tag to story (deprecated - use intelligent tag suggestions instead)
router.post('/:id/stories/:storyId', async(req, res) => {
    try {
        res.status(410).json({ 
            error: 'This endpoint is deprecated. Use intelligent tag suggestions instead.',
            message: 'Tags are now managed through TagSuggestions and StoryTagReasonings. Use the intelligent tag system for better tag management.'
        });
    } catch (error) {
        console.error('Error with deprecated endpoint:', error);
        res.status(500).json({ error: 'An error occurred.' });
    }
});

// DELETE /tags/:id/stories/:storyId - Remove tag from story (deprecated - use intelligent tag system instead)
router.delete('/:id/stories/:storyId', async(req, res) => {
    try {
        res.status(410).json({ 
            error: 'This endpoint is deprecated. Use intelligent tag system instead.',
            message: 'Tags are now managed through TagSuggestions and StoryTagReasonings. Use the intelligent tag system for better tag management.'
        });
    } catch (error) {
        console.error('Error with deprecated endpoint:', error);
        res.status(500).json({ error: 'An error occurred.' });
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

// GET /tags/:id/recommendations - Get tag recommendations based on a tag
router.get('/:id/recommendations', async(req, res) => {
    try {
        const { limit = 5 } = req.query;
        const recommendations = await tagService.getTagRecommendations(req.params.id, parseInt(limit));
        res.json(recommendations);
    } catch (error) {
        console.error('Error fetching tag recommendations:', error);
        if (error.message && error.message.includes('not found')) {
            res.status(404).json({ error: 'Tag not found.' });
        } else {
            res.status(500).json({ error: 'An error occurred while fetching tag recommendations.' });
        }
    }
});

// POST /tags/ai-recommendations - Get AI-powered recommendations based on multiple tags
router.post('/ai-recommendations', async(req, res) => {
    try {
        const { tagIds, limit = 8, storyBrainstorm, forceNew = false, focusedMode = false, focusTagId = null } = req.body;

        // Allow empty tagIds array for content-based recommendations
        if (!tagIds || !Array.isArray(tagIds)) {
            return res.status(400).json({ error: 'tagIds must be an array.' });
        }

        const result = await tagService.getAIRecommendations(tagIds, parseInt(limit), storyBrainstorm, forceNew, focusedMode, focusTagId);
        res.json(result);
    } catch (error) {
        console.error('Error fetching AI recommendations:', error);
        res.status(500).json({ error: 'An error occurred while fetching AI recommendations.' });
    }
});

// POST /tags/ai-suggestions - Get AI suggestions for adding/removing tags
router.post('/ai-suggestions', async(req, res) => {
    try {
        const { selectedTags, action, changedTag, storyBrainstorm } = req.body;

        if (!selectedTags || !Array.isArray(selectedTags)) {
            return res.status(400).json({ error: 'selectedTags must be an array.' });
        }

        if (!action || !['add', 'remove', 'initial', 'refresh'].includes(action)) {
            return res.status(400).json({ error: 'action must be one of: add, remove, initial, refresh.' });
        }

        const result = await tagService.getAITagSuggestions(selectedTags, action, changedTag, storyBrainstorm);
        res.json(result);
    } catch (error) {
        console.error('Error fetching AI tag suggestions:', error);
        res.status(500).json({ error: 'An error occurred while fetching AI tag suggestions.' });
    }
});

// POST /tags/persist-ai-suggested - Persist a single AI-suggested tag
router.post('/persist-ai-suggested', async(req, res) => {
    try {
        const { virtualTagData } = req.body;

        if (!virtualTagData || !virtualTagData.title) {
            return res.status(400).json({ error: 'virtualTagData with title is required.' });
        }

        const result = await tagService.persistAISuggestedTag(virtualTagData);

        if (result.success) {
            res.status(result.isExisting ? 200 : 201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error persisting AI-suggested tag:', error);
        res.status(500).json({ error: 'An error occurred while persisting AI-suggested tag.' });
    }
});

// POST /tags/batch-persist-ai-suggested - Persist multiple AI-suggested tags
router.post('/batch-persist-ai-suggested', async(req, res) => {
    try {
        const { virtualTagsData } = req.body;

        if (!virtualTagsData || !Array.isArray(virtualTagsData) || virtualTagsData.length === 0) {
            return res.status(400).json({ error: 'virtualTagsData array is required and must not be empty.' });
        }

        const result = await tagService.batchPersistAISuggestedTags(virtualTagsData);
        res.json(result);
    } catch (error) {
        console.error('Error batch persisting AI-suggested tags:', error);
        res.status(500).json({ error: 'An error occurred while batch persisting AI-suggested tags.' });
    }
});

module.exports = router;