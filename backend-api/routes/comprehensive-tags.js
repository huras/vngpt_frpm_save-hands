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
        const { storyTitle, storyBrainstorm, limit = 10, storyId } = req.body;

        if (!storyTitle || !storyBrainstorm) {
            return res.status(400).json({ 
                error: 'storyTitle and storyBrainstorm are required.' 
            });
        }

        console.log(`Starting streaming comprehensive tag generation for story: ${storyTitle}${storyId ? ` (ID: ${storyId})` : ''}`);

        // Set headers for streaming
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Get the iterative generator with storyId for auto-saving
        const generator = comprehensiveTagService.generateComprehensiveTagsIterative(
            storyTitle, 
            storyBrainstorm, 
            limit,
            storyId // Pass storyId for auto-saving
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

// GET /comprehensive-tags/story/:storyId - Get comprehensive results for a specific story
router.get('/story/:storyId', async (req, res) => {
    try {
        const { storyId } = req.params;

        const { TagSuggestion, TagRelationship, TagWorldBuildingEffect, Tag, Story } = require('../models');
        
        // Get tag suggestions for this story
        const tagSuggestions = await TagSuggestion.findAll({
            where: { 
                storyId,
                suggestionType: 'comprehensive_generation',
                status: { [require('sequelize').Op.in]: ['accepted', 'pending'] } // Include both accepted and pending
            },
            include: [
                {
                    model: Tag,
                    as: 'tag',
                    attributes: ['id', 'title', 'short_description', 'broader_description', 'category', 'keywords', 'thumb_url', 'media_url', 'media_type']
                }
            ],
            order: [['confidence', 'DESC']]
        });

        // Get tag relationships for the suggested tags
        const suggestedTagIds = tagSuggestions.map(s => s.tagId);
        const tagRelationships = await TagRelationship.findAll({
            where: { 
                sourceTagId: suggestedTagIds,
                isActive: true
            },
            include: [
                {
                    model: Tag,
                    as: 'relatedTag',
                    attributes: ['id', 'title', 'short_description', 'broader_description', 'category', 'keywords', 'thumb_url', 'media_url', 'media_type']
                }
            ],
            order: [['confidence', 'DESC']]
        });

        // Get world-building effects for the suggested tags
        const worldBuildingEffects = await TagWorldBuildingEffect.findAll({
            where: { 
                tagId: suggestedTagIds,
                isActive: true
            },
            order: [['impactLevel', 'DESC'], ['confidence', 'DESC']]
        });

        // Format the data to match the comprehensive results structure
        const relevantTags = tagSuggestions.map(suggestion => ({
            ...suggestion.tag.toJSON(),
            selectionReasoning: suggestion.reasoning,
            relevanceScore: Math.round(suggestion.confidence * 10),
            suggestionId: suggestion.id,
            suggestionStatus: suggestion.status,
            acceptedAt: suggestion.acceptedAt,
            rejectedAt: suggestion.rejectedAt,
            userRating: suggestion.userRating,
            ratingComment: suggestion.ratingComment
        }));

        // Group related tags by source tag
        const relatedTagsMap = {};
        tagRelationships.forEach(relationship => {
            const sourceTagId = relationship.sourceTagId;
            if (!relatedTagsMap[sourceTagId]) {
                relatedTagsMap[sourceTagId] = [];
            }
            relatedTagsMap[sourceTagId].push({
                ...relationship.relatedTag.toJSON(),
                relationshipType: relationship.relationshipType,
                relationshipReasoning: relationship.reasoning,
                confidence: relationship.confidence
            });
        });

        // Group world-building effects by tag
        const worldBuildingEffectsByTag = {};
        worldBuildingEffects.forEach(effect => {
            const tagId = effect.tagId;
            if (!worldBuildingEffectsByTag[tagId]) {
                worldBuildingEffectsByTag[tagId] = [];
            }
            worldBuildingEffectsByTag[tagId].push({
                effectType: effect.effectType,
                title: effect.title,
                description: effect.description,
                impactLevel: effect.impactLevel,
                storyElements: effect.storyElements ? JSON.parse(effect.storyElements) : [],
                examples: effect.examples ? JSON.parse(effect.examples) : [],
                conflicts: effect.conflicts ? JSON.parse(effect.conflicts) : [],
                synergies: effect.synergies ? JSON.parse(effect.synergies) : [],
                confidence: effect.confidence
            });
        });

        // Get tag titles for world-building effects
        const tagTitles = {};
        relevantTags.forEach(tag => {
            tagTitles[tag.id] = tag.title;
        });

        const formattedWorldBuildingEffects = Object.entries(worldBuildingEffectsByTag).map(([tagId, effects]) => ({
            tagId: parseInt(tagId),
            tagTitle: tagTitles[tagId] || 'Unknown Tag',
            effects
        }));

        const results = {
            relevantTags,
            relatedTagsMap,
            worldBuildingEffects: formattedWorldBuildingEffects,
            summary: {
                totalRelevantTags: relevantTags.length,
                totalRelatedTags: Object.values(relatedTagsMap).flat().length,
                totalWorldBuildingEffects: formattedWorldBuildingEffects.length
            }
        };

        res.json({ 
            success: true, 
            data: results,
            message: 'Comprehensive results retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching comprehensive results for story:', error);
        res.status(500).json({ 
            error: 'An error occurred while fetching comprehensive results.',
            details: error.message
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

// POST /comprehensive-tags/suggestions/:suggestionId/accept - Accept a tag suggestion
router.post('/suggestions/:suggestionId/accept', async (req, res) => {
    try {
        const { suggestionId } = req.params;
        const { userRating, ratingComment } = req.body;

        const { TagSuggestion } = require('../models');
        
        const suggestion = await TagSuggestion.findByPk(suggestionId);
        if (!suggestion) {
            return res.status(404).json({ 
                error: 'Tag suggestion not found.' 
            });
        }

        // Update the suggestion status to accepted
        await suggestion.update({
            status: 'accepted',
            acceptedAt: new Date(),
            userRating: userRating || null,
            ratingComment: ratingComment || null,
            ratedAt: userRating ? new Date() : null
        });

        res.json({ 
            success: true, 
            data: suggestion,
            message: 'Tag suggestion accepted successfully'
        });
    } catch (error) {
        console.error('Error accepting tag suggestion:', error);
        res.status(500).json({ 
            error: 'An error occurred while accepting the tag suggestion.' 
        });
    }
});

// POST /comprehensive-tags/suggestions/:suggestionId/reject - Reject a tag suggestion
router.post('/suggestions/:suggestionId/reject', async (req, res) => {
    try {
        const { suggestionId } = req.params;
        const { rejectionReason, userRating, ratingComment } = req.body;

        const { TagSuggestion } = require('../models');
        
        const suggestion = await TagSuggestion.findByPk(suggestionId);
        if (!suggestion) {
            return res.status(404).json({ 
                error: 'Tag suggestion not found.' 
            });
        }

        // Update the suggestion status to rejected
        await suggestion.update({
            status: 'rejected',
            rejectedAt: new Date(),
            rejectionReason: rejectionReason || null,
            userRating: userRating || null,
            ratingComment: ratingComment || null,
            ratedAt: userRating ? new Date() : null
        });

        res.json({ 
            success: true, 
            data: suggestion,
            message: 'Tag suggestion rejected successfully'
        });
    } catch (error) {
        console.error('Error rejecting tag suggestion:', error);
        res.status(500).json({ 
            error: 'An error occurred while rejecting the tag suggestion.' 
        });
    }
});

// POST /comprehensive-tags/suggestions/:suggestionId/rate - Rate a tag suggestion
router.post('/suggestions/:suggestionId/rate', async (req, res) => {
    try {
        const { suggestionId } = req.params;
        const { userRating, ratingComment } = req.body;

        if (!userRating || userRating < 1 || userRating > 5) {
            return res.status(400).json({ 
                error: 'User rating must be between 1 and 5.' 
            });
        }

        const { TagSuggestion } = require('../models');
        
        const suggestion = await TagSuggestion.findByPk(suggestionId);
        if (!suggestion) {
            return res.status(404).json({ 
                error: 'Tag suggestion not found.' 
            });
        }

        // Update the suggestion with rating
        await suggestion.update({
            userRating,
            ratingComment: ratingComment || null,
            ratedAt: new Date()
        });

        res.json({ 
            success: true, 
            data: suggestion,
            message: 'Tag suggestion rated successfully'
        });
    } catch (error) {
        console.error('Error rating tag suggestion:', error);
        res.status(500).json({ 
            error: 'An error occurred while rating the tag suggestion.' 
        });
    }
});

// POST /comprehensive-tags/suggestions/:suggestionId/reset - Reset a tag suggestion to pending
router.post('/suggestions/:suggestionId/reset', async (req, res) => {
    try {
        const { suggestionId } = req.params;

        const { TagSuggestion } = require('../models');
        
        const suggestion = await TagSuggestion.findByPk(suggestionId);
        if (!suggestion) {
            return res.status(404).json({ 
                error: 'Tag suggestion not found.' 
            });
        }

        // Reset the suggestion status to pending
        await suggestion.update({
            status: 'pending',
            acceptedAt: null,
            rejectedAt: null,
            rejectionReason: null
        });

        res.json({ 
            success: true, 
            data: suggestion,
            message: 'Tag suggestion reset to pending successfully'
        });
    } catch (error) {
        console.error('Error resetting tag suggestion:', error);
        res.status(500).json({ 
            error: 'An error occurred while resetting the tag suggestion.' 
        });
    }
});

// DELETE /comprehensive-tags/suggestions/:storyId/clear - Clear all comprehensive tag suggestions for a story
router.delete('/suggestions/:storyId/clear', async (req, res) => {
    try {
        const { storyId } = req.params;

        const { TagSuggestion, TagRelationship, TagWorldBuildingEffect } = require('../models');
        
        // Find all comprehensive tag suggestions for the story
        const suggestions = await TagSuggestion.findAll({
            where: {
                storyId,
                suggestionType: 'comprehensive_generation'
            }
        });

        if (suggestions.length === 0) {
            return res.json({ 
                success: true, 
                message: 'No comprehensive tag suggestions found to clear',
                clearedCount: 0
            });
        }

        // Get the tag IDs from the suggestions
        const tagIds = suggestions.map(s => s.tagId);

        // Delete tag relationships for these tags
        const deletedRelationships = await TagRelationship.destroy({
            where: {
                sourceTagId: tagIds
            }
        });

        // Delete world-building effects for these tags
        const deletedEffects = await TagWorldBuildingEffect.destroy({
            where: {
                tagId: tagIds
            }
        });

        // Delete the tag suggestions
        const deletedSuggestions = await TagSuggestion.destroy({
            where: {
                storyId,
                suggestionType: 'comprehensive_generation'
            }
        });

        console.log(`Cleared comprehensive tag suggestions for story ${storyId}: ${deletedSuggestions} suggestions, ${deletedRelationships} relationships, ${deletedEffects} effects`);

        res.json({ 
            success: true, 
            message: `Cleared ${deletedSuggestions} comprehensive tag suggestions and related data`,
            clearedCount: deletedSuggestions,
            deletedRelationships,
            deletedEffects
        });
    } catch (error) {
        console.error('Error clearing comprehensive tag suggestions:', error);
        res.status(500).json({ 
            error: 'An error occurred while clearing comprehensive tag suggestions.',
            details: error.message
        });
    }
});

// POST /comprehensive-tags/generate-related/:tagId - Generate related tags for a specific tag
router.post('/generate-related/:tagId', async (req, res) => {
    try {
        const { tagId } = req.params;
        const { storyId, limit = 3 } = req.body;

        if (!tagId) {
            return res.status(400).json({ 
                error: 'tagId is required.' 
            });
        }

        console.log(`Generating related tags for tag ID: ${tagId}${storyId ? ` (Story ID: ${storyId})` : ''}`);

        // Get the tag to generate related tags for
        const { Tag } = require('../models');
        const sourceTag = await Tag.findByPk(tagId);
        
        if (!sourceTag) {
            return res.status(404).json({ 
                error: 'Tag not found.' 
            });
        }

        // Generate related tags using the service
        const relatedTags = await comprehensiveTagService.generateRelatedTagsForTag(
            sourceTag, 
            limit, 
            storyId
        );

        // Save relationships to database if storyId is provided
        if (storyId && relatedTags.length > 0) {
            const { TagRelationship } = require('../models');
            
            for (const relatedTag of relatedTags) {
                try {
                    await TagRelationship.create({
                        sourceTagId: parseInt(tagId),
                        relatedTagId: relatedTag.id,
                        relationshipType: relatedTag.relationshipType,
                        confidence: relatedTag.confidence,
                        reasoning: relatedTag.relationshipReasoning
                    });
                } catch (error) {
                    // Ignore duplicate relationship errors
                    if (error.name !== 'SequelizeUniqueConstraintError') {
                        console.error('Error saving tag relationship:', error);
                    }
                }
            }
        }

        res.json({ 
            success: true, 
            data: {
                sourceTag: {
                    id: sourceTag.id,
                    title: sourceTag.title,
                    short_description: sourceTag.short_description,
                    category: sourceTag.category
                },
                relatedTags,
                totalGenerated: relatedTags.length
            },
            message: `Generated ${relatedTags.length} related tags for "${sourceTag.title}"`
        });
    } catch (error) {
        console.error('Error generating related tags for tag:', error);
        res.status(500).json({ 
            error: 'An error occurred while generating related tags.',
            details: error.message
        });
    }
});

// POST /comprehensive-tags/generate-world-building/:tagId - Generate world-building effects for a specific tag
router.post('/generate-world-building/:tagId', async (req, res) => {
    try {
        const { tagId } = req.params;
        const { storyTitle, storyBrainstorm, storyId } = req.body;

        if (!tagId) {
            return res.status(400).json({ 
                error: 'tagId is required.' 
            });
        }

        if (!storyTitle || !storyBrainstorm) {
            return res.status(400).json({ 
                error: 'storyTitle and storyBrainstorm are required for world-building analysis.' 
            });
        }

        console.log(`Generating world-building effects for tag ID: ${tagId}${storyId ? ` (Story ID: ${storyId})` : ''}`);

        // Get the tag to generate world-building effects for
        const { Tag } = require('../models');
        const sourceTag = await Tag.findByPk(tagId);
        
        if (!sourceTag) {
            return res.status(404).json({ 
                error: 'Tag not found.' 
            });
        }

        // Generate world-building effects using the service
        const worldBuildingEffects = await comprehensiveTagService.generateWorldBuildingEffectsForTag(
            sourceTag, 
            storyTitle, 
            storyBrainstorm
        );

        // Save world-building effects to database if storyId is provided
        if (storyId && worldBuildingEffects.length > 0) {
            const { TagWorldBuildingEffect } = require('../models');
            
            for (const effect of worldBuildingEffects) {
                try {
                    await TagWorldBuildingEffect.create({
                        tagId: parseInt(tagId),
                        effectType: effect.effectType,
                        title: effect.title,
                        description: effect.description,
                        impactLevel: effect.impactLevel,
                        storyElements: JSON.stringify(effect.storyElements || []),
                        examples: JSON.stringify(effect.examples || []),
                        conflicts: JSON.stringify(effect.conflicts || []),
                        synergies: JSON.stringify(effect.synergies || []),
                        confidence: effect.confidence || 0.8
                    });
                } catch (error) {
                    // Ignore duplicate effect errors
                    if (error.name !== 'SequelizeUniqueConstraintError') {
                        console.error('Error saving world-building effect:', error);
                    }
                }
            }
        }

        res.json({ 
            success: true, 
            data: {
                sourceTag: {
                    id: sourceTag.id,
                    title: sourceTag.title,
                    short_description: sourceTag.short_description,
                    category: sourceTag.category
                },
                worldBuildingEffects,
                totalGenerated: worldBuildingEffects.length
            },
            message: `Generated ${worldBuildingEffects.length} world-building effects for "${sourceTag.title}"`
        });
    } catch (error) {
        console.error('Error generating world-building effects for tag:', error);
        res.status(500).json({ 
            error: 'An error occurred while generating world-building effects.',
            details: error.message
        });
    }
});

module.exports = router; 