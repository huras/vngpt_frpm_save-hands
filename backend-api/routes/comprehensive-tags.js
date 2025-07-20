const express = require('express');
const ComprehensiveTagGenerationService = require('../services/ComprehensiveTagGenerationService');

const router = express.Router();
const comprehensiveTagService = new ComprehensiveTagGenerationService();

// POST /comprehensive-tags/generate - Generate comprehensive tags for a story
router.post('/generate', async (req, res) => {
    try {
        const { storyTitle, storyBrainstorm, limit = 10 } = req.body;

        if (!storyTitle || !storyBrainstorm) {
            return res.status(400).json({ 
                error: 'storyTitle and storyBrainstorm are required.' 
            });
        }

        console.log(`Generating comprehensive tags for story: ${storyTitle}`);

        const results = await comprehensiveTagService.generateComprehensiveTags(
            storyTitle, 
            storyBrainstorm, 
            limit
        );

        res.json({ 
            success: true, 
            data: results,
            message: 'Comprehensive tag generation completed successfully'
        });
    } catch (error) {
        console.error('Error generating comprehensive tags:', error);
        res.status(500).json({ 
            error: 'An error occurred while generating comprehensive tags.',
            details: error.message
        });
    }
});

// POST /comprehensive-tags/generate-streaming - Generate comprehensive tags with streaming updates
router.post('/generate-streaming', async (req, res) => {
    try {
        const { storyTitle, storyBrainstorm, limit = 10 } = req.body;

        if (!storyTitle || !storyBrainstorm) {
            return res.status(400).json({ 
                error: 'storyTitle and storyBrainstorm are required.' 
            });
        }

        console.log(`Starting streaming comprehensive tag generation for story: ${storyTitle}`);

        // Set headers for streaming
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Get the iterative generator
        const generator = comprehensiveTagService.generateComprehensiveTagsIterative(
            storyTitle, 
            storyBrainstorm, 
            limit
        );

        // Stream the results
        for await (const update of generator) {
            const updateString = JSON.stringify(update) + '\n';
            res.write(updateString);
            
            // Flush the response to ensure immediate delivery
            if (res.flush) {
                res.flush();
            }
        }

        res.end();
    } catch (error) {
        console.error('Error in streaming comprehensive tag generation:', error);
        
        // Send error as final update
        const errorUpdate = {
            stage: 'error',
            stageName: 'Error',
            progress: 0,
            total: 1,
            message: 'An error occurred during tag generation',
            error: error.message,
            data: null
        };
        
        res.write(JSON.stringify(errorUpdate) + '\n');
        res.end();
    }
});

// POST /comprehensive-tags/save/:storyId - Save comprehensive results to database
router.post('/save/:storyId', async (req, res) => {
    try {
        const { storyId } = req.params;
        const { results } = req.body;

        if (!results) {
            return res.status(400).json({ 
                error: 'results object is required.' 
            });
        }

        console.log(`Saving comprehensive results for story: ${storyId}`);

        const savedResults = await comprehensiveTagService.saveComprehensiveResults(
            storyId, 
            results
        );

        res.json({ 
            success: true, 
            data: savedResults,
            message: 'Comprehensive results saved successfully'
        });
    } catch (error) {
        console.error('Error saving comprehensive results:', error);
        res.status(500).json({ 
            error: 'An error occurred while saving comprehensive results.',
            details: error.message
        });
    }
});

// GET /comprehensive-tags/relationships/:tagId - Get related tags for a specific tag
router.get('/relationships/:tagId', async (req, res) => {
    try {
        const { tagId } = req.params;
        const { limit = 10 } = req.query;

        const { TagRelationship, Tag } = require('../models');
        
        const relationships = await TagRelationship.findAll({
            where: { 
                sourceTagId: tagId,
                isActive: true
            },
            include: [
                {
                    model: Tag,
                    as: 'relatedTag',
                    attributes: ['id', 'title', 'short_description', 'category', 'keywords', 'thumb_url']
                }
            ],
            order: [['confidence', 'DESC']],
            limit: parseInt(limit)
        });

        res.json({ 
            success: true, 
            data: relationships
        });
    } catch (error) {
        console.error('Error fetching tag relationships:', error);
        res.status(500).json({ 
            error: 'An error occurred while fetching tag relationships.' 
        });
    }
});

// GET /comprehensive-tags/world-building/:tagId - Get world-building effects for a specific tag
router.get('/world-building/:tagId', async (req, res) => {
    try {
        const { tagId } = req.params;

        const { TagWorldBuildingEffect } = require('../models');
        
        const effects = await TagWorldBuildingEffect.findAll({
            where: { 
                tagId,
                isActive: true
            },
            order: [['impactLevel', 'DESC'], ['confidence', 'DESC']]
        });

        res.json({ 
            success: true, 
            data: effects
        });
    } catch (error) {
        console.error('Error fetching world-building effects:', error);
        res.status(500).json({ 
            error: 'An error occurred while fetching world-building effects.' 
        });
    }
});

// POST /comprehensive-tags/relationships - Create a new tag relationship
router.post('/relationships', async (req, res) => {
    try {
        const { sourceTagId, relatedTagId, relationshipType, confidence, reasoning } = req.body;

        if (!sourceTagId || !relatedTagId) {
            return res.status(400).json({ 
                error: 'sourceTagId and relatedTagId are required.' 
            });
        }

        const { TagRelationship } = require('../models');
        
        const relationship = await TagRelationship.create({
            sourceTagId,
            relatedTagId,
            relationshipType: relationshipType || 'complementary',
            confidence: confidence || 0.8,
            reasoning: reasoning || 'Manually created relationship'
        });

        res.json({ 
            success: true, 
            data: relationship,
            message: 'Tag relationship created successfully'
        });
    } catch (error) {
        console.error('Error creating tag relationship:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ 
                error: 'This tag relationship already exists.' 
            });
        } else {
            res.status(500).json({ 
                error: 'An error occurred while creating the tag relationship.' 
            });
        }
    }
});

// POST /comprehensive-tags/world-building - Create a new world-building effect
router.post('/world-building', async (req, res) => {
    try {
        const { 
            tagId, 
            effectType, 
            title, 
            description, 
            impactLevel, 
            storyElements, 
            examples, 
            conflicts, 
            synergies, 
            confidence 
        } = req.body;

        if (!tagId || !title || !description) {
            return res.status(400).json({ 
                error: 'tagId, title, and description are required.' 
            });
        }

        const { TagWorldBuildingEffect } = require('../models');
        
        const effect = await TagWorldBuildingEffect.create({
            tagId,
            effectType: effectType || 'setting',
            title,
            description,
            impactLevel: impactLevel || 'moderate',
            storyElements: storyElements ? JSON.stringify(storyElements) : null,
            examples: examples ? JSON.stringify(examples) : null,
            conflicts: conflicts ? JSON.stringify(conflicts) : null,
            synergies: synergies ? JSON.stringify(synergies) : null,
            confidence: confidence || 0.8
        });

        res.json({ 
            success: true, 
            data: effect,
            message: 'World-building effect created successfully'
        });
    } catch (error) {
        console.error('Error creating world-building effect:', error);
        res.status(500).json({ 
            error: 'An error occurred while creating the world-building effect.' 
        });
    }
});

module.exports = router; 