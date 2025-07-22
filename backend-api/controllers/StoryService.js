const BaseService = require('./BaseService');
const { Story, Tag, TagSuggestion, StoryTagReasoning } = require('../models');

class StoryService extends BaseService {
    constructor() {
        super(Story, [
            // Remove tagSuggestions from default includes since we don't want to show pending suggestions in stories list
            {
                model: StoryTagReasoning,
                as: 'tagReasonings',
                include: [
                    { model: Tag, as: 'tag' }
                ],
                required: false
            }
        ]);
    }

    async findAllPaginated(filters, paginationArgs) {
        const { page, perPage } = paginationArgs;
        const { offset, limit } = this.getPagination(page, perPage);

        const paginatedStories = await this.model.findAndCountAll({
            where: filters,
            offset,
            limit,
            include: this.includes,
            distinct: true, // This ensures we count distinct stories, not joined rows
            order: [
                ['createdAt', 'DESC']
            ]
        });

        // Add accepted tags to each story
        const storiesWithTags = await Promise.all(
            paginatedStories.rows.map(async (story) => {
                const acceptedTags = await this.getStoryTags(story.id);
                return {
                    ...story.toJSON(),
                    tags: acceptedTags
                };
            })
        );

        const totalItems = paginatedStories.count;
        const totalPages = Math.ceil(totalItems / perPage);

        return {
            data: storiesWithTags,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems,
            },
        };
    }

    getPagination(page, perPage) {
        const limit = perPage ? parseInt(perPage) : 10;
        const offset = page ? (parseInt(page) - 1) * limit : 0;
        return { offset, limit };
    }

    async searchStories(searchTerm, paginationArgs = { page: 1, perPage: 10 }) {
        const { page, perPage } = paginationArgs;
        const { offset, limit } = this.getPagination(page, perPage);

        const { Op } = require('sequelize');

        const searchFilters = {
            [Op.or]: [{
                    title: {
                        [Op.like]: `%${searchTerm}%`
                    }
                },
                {
                    brainstorm: {
                        [Op.like]: `%${searchTerm}%`
                    }
                }
            ]
        };

        const paginatedStories = await this.model.findAndCountAll({
            where: searchFilters,
            offset,
            limit,
            order: [
                ['createdAt', 'DESC']
            ]
        });

        // Add accepted tags to each story
        const storiesWithTags = await Promise.all(
            paginatedStories.rows.map(async (story) => {
                const acceptedTags = await this.getStoryTags(story.id);
                return {
                    ...story.toJSON(),
                    tags: acceptedTags
                };
            })
        );

        const totalItems = paginatedStories.count;
        const totalPages = Math.ceil(totalItems / perPage);

        return {
            data: storiesWithTags,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems,
            },
        };
    }

    async duplicateStory(id) {
        const originalStory = await this.findById(id);
        if (!originalStory) {
            throw new Error(`Story with ID ${id} not found.`);
        }

        // Create a new story with the same title and brainstorm
        const duplicatedStory = await this.create({
            title: `${originalStory.title} (Copy)`,
            brainstorm: originalStory.brainstorm || ''
        });

        return duplicatedStory;
    }

    /**
     * Get all tags associated with a story through accepted suggestions and reasonings
     */
    async getStoryTags(storyId) {
        try {
            // Get accepted tag suggestions
            const acceptedSuggestions = await TagSuggestion.findAll({
                where: { 
                    storyId, 
                    status: 'accepted' 
                },
                include: [
                    { model: Tag, as: 'tag' }
                ]
            });

            // Get tags from story tag reasonings
            const tagReasonings = await StoryTagReasoning.findAll({
                where: { storyId },
                include: [
                    { model: Tag, as: 'tag' }
                ]
            });

            // Combine and deduplicate tags
            const tagMap = new Map();
            
            acceptedSuggestions.forEach(suggestion => {
                if (suggestion.tag) {
                    tagMap.set(suggestion.tag.id, suggestion.tag);
                }
            });

            tagReasonings.forEach(reasoning => {
                if (reasoning.tag) {
                    tagMap.set(reasoning.tag.id, reasoning.tag);
                }
            });

            return Array.from(tagMap.values());
        } catch (error) {
            console.error('Error getting story tags:', error);
            throw error;
        }
    }
}

module.exports = new StoryService();