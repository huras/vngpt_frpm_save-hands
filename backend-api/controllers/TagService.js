const BaseService = require('./BaseService');
const { Tag, Story } = require('../models');
const { getImageUrl, deleteImage } = require('../utils/imageUpload');
const AIService = require('../services/AIService');

class TagService extends BaseService {
    constructor() {
        super(Tag, [
            { model: Story, as: 'stories' }
        ]);
        this.aiService = new AIService();
    }

    async findAllPaginated(filters, paginationArgs) {
        const { page, perPage } = paginationArgs;
        const { offset, limit } = this.getPagination(page, perPage);

        const paginatedTags = await this.model.findAndCountAll({
            where: filters,
            offset,
            limit,
            include: this.includes,
            order: [
                ['title', 'ASC']
            ]
        });

        const totalItems = paginatedTags.count;
        const totalPages = Math.ceil(totalItems / perPage);

        return {
            data: paginatedTags.rows,
            pagination: {
                currentPage: page,
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

    async searchTags(searchTerm, paginationArgs = { page: 1, perPage: 10 }) {
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
                    short_description: {
                        [Op.like]: `%${searchTerm}%`
                    }
                }
            ]
        };

        const paginatedTags = await this.model.findAndCountAll({
            where: searchFilters,
            offset,
            limit,
            include: this.includes,
            order: [
                ['title', 'ASC']
            ]
        });

        const totalItems = paginatedTags.count;
        const totalPages = Math.ceil(totalItems / perPage);

        return {
            data: paginatedTags.rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
            },
        };
    }

    async addTagToStory(tagId, storyId) {
        const tag = await this.findById(tagId);
        if (!tag) throw new Error('Tag not found.');

        const story = await Story.findByPk(storyId);
        if (!story) throw new Error('Story not found.');

        await tag.addStory(story);

        return tag;
    }

    async removeTagFromStory(tagId, storyId) {
        const tag = await this.findById(tagId);
        if (!tag) throw new Error('Tag not found.');

        const story = await Story.findByPk(storyId);
        if (!story) throw new Error('Story not found.');

        await tag.removeStory(story);

        return tag;
    }

    async getTagsByStory(storyId) {
        const story = await Story.findByPk(storyId, {
            include: [{ model: Tag, as: 'tags' }]
        });
        if (!story) throw new Error('Story not found.');
        return story.tags;
    }

    async getStoriesByTag(tagId) {
        const tag = await this.findById(tagId, [{ model: Story, as: 'stories' }]);
        if (!tag) throw new Error('Tag not found.');
        return tag.stories;
    }

    async getTagRecommendations(tagId, limit = 5) {
        // First, verify the tag exists
        const sourceTag = await this.findById(tagId);
        if (!sourceTag) throw new Error('Tag not found.');

        const { Op } = require('sequelize');

        // Get recommendations based on multiple criteria
        let recommendations = [];

        // 1. Try to find tags with similar descriptions
        if (sourceTag.short_description) {
            const similarTags = await this.model.findAll({
                where: {
                    id: {
                        [Op.ne]: tagId
                    }, // Exclude the source tag
                    short_description: {
                        [Op.like]: `%${sourceTag.short_description.split(' ')[0]}%`
                    }
                },
                limit: Math.ceil(limit / 2),
                order: [
                    ['title', 'ASC']
                ]
            });
            recommendations.push(...similarTags);
        }

        // 2. Try to find tags with similar titles (same category)
        const titleWords = sourceTag.title.toLowerCase().split(' ');
        const categoryTags = await this.model.findAll({
            where: {
                id: {
                    [Op.ne]: tagId
                },
                title: {
                    [Op.or]: titleWords.map(word => ({
                        [Op.like]: `%${word}%`
                    }))
                }
            },
            limit: Math.ceil(limit / 2),
            order: [
                ['title', 'ASC']
            ]
        });
        recommendations.push(...categoryTags);

        // 3. If we don't have enough recommendations, fill with random tags
        if (recommendations.length < limit) {
            const existingIds = recommendations.map(tag => tag.id);
            const randomTags = await this.model.findAll({
                where: {
                    id: {
                        [Op.ne]: tagId,
                        [Op.notIn]: existingIds
                    }
                },
                limit: limit - recommendations.length,
                order: require('sequelize').literal('RAND()')
            });
            recommendations.push(...randomTags);
        }

        // Remove duplicates and limit to requested amount
        const uniqueRecommendations = recommendations
            .filter((tag, index, self) =>
                index === self.findIndex(t => t.id === tag.id)
            )
            .slice(0, limit);

        return uniqueRecommendations;
    }

    async getAIRecommendations(selectedTagIds, limit = 5) {
        try {
            // Get selected tags
            const selectedTags = await Tag.findAll({
                where: { id: selectedTagIds }
            });

            // Get all available tags for recommendations
            const allTags = await Tag.findAll({
                order: [
                    ['title', 'ASC']
                ]
            });

            // Get AI recommendations
            const recommendations = await this.aiService.generateRecommendations(
                selectedTags,
                allTags,
                limit
            );

            return {
                success: true,
                data: {
                    recommendations: recommendations.recommendations,
                    reasoning: recommendations.reasoning,
                    compatibility_score: recommendations.compatibility_score
                }
            };
        } catch (error) {
            console.error('Error getting AI recommendations:', error);
            return { success: false, error: 'Failed to get AI recommendations' };
        }
    }

    async updateTagAI(tagId) {
        const tag = await this.findById(tagId);
        if (!tag) throw new Error('Tag not found.');

        try {
            // Update AI embedding
            await this.aiService.updateTagAI(tag);

            return tag;
        } catch (error) {
            console.error('Error updating tag AI data:', error);
            throw error;
        }
    }

    async createWithImage(tagData, imageFile) {
        const tag = await this.create(tagData);

        if (imageFile) {
            const imageUrl = await getImageUrl(imageFile);
            await tag.update({ thumb_url: imageUrl });
        }

        // Update AI data for new tag
        try {
            await this.updateTagAI(tag.id);
        } catch (error) {
            console.error('Error updating AI data for new tag:', error);
        }

        return tag;
    }

    async updateWithImage(tagId, tagData, imageFile) {
        const tag = await this.findById(tagId);
        if (!tag) throw new Error('Tag not found.');

        if (imageFile) {
            // Delete old image if exists
            if (tag.thumb_url) {
                await deleteImage(tag.thumb_url);
            }

            const imageUrl = await getImageUrl(imageFile);
            tagData.thumb_url = imageUrl;
        }

        await tag.update(tagData);

        // Update AI data for modified tag
        try {
            await this.updateTagAI(tag.id);
        } catch (error) {
            console.error('Error updating AI data for modified tag:', error);
        }

        return tag;
    }

    async deleteWithImage(tagId) {
        const tag = await this.findById(tagId);
        if (!tag) throw new Error('Tag not found.');

        // Delete image if exists
        if (tag.thumb_url) {
            await deleteImage(tag.thumb_url);
        }

        await tag.destroy();
    }

    async getAllTags() {
        try {
            const tags = await Tag.findAll({
                order: [
                    ['title', 'ASC']
                ]
            });
            return { success: true, data: tags };
        } catch (error) {
            console.error('Error fetching tags:', error);
            return { success: false, error: 'Failed to fetch tags' };
        }
    }

    async getTagById(id) {
        try {
            const tag = await Tag.findByPk(id);
            if (!tag) {
                return { success: false, error: 'Tag not found' };
            }
            return { success: true, data: tag };
        } catch (error) {
            console.error('Error fetching tag:', error);
            return { success: false, error: 'Failed to fetch tag' };
        }
    }

    async createTag(tagData) {
        try {
            const tag = await Tag.create(tagData);

            // Update AI data for the new tag
            await this.aiService.updateTagAI(tag);

            return { success: true, data: tag };
        } catch (error) {
            console.error('Error creating tag:', error);
            return { success: false, error: 'Failed to create tag' };
        }
    }

    async updateTag(id, updateData) {
        try {
            const tag = await Tag.findByPk(id);
            if (!tag) {
                return { success: false, error: 'Tag not found' };
            }

            await tag.update(updateData);

            // Update AI data if relevant fields changed
            if (updateData.title || updateData.short_description || updateData.keywords) {
                await this.aiService.updateTagAI(tag);
            }

            return { success: true, data: tag };
        } catch (error) {
            console.error('Error updating tag:', error);
            return { success: false, error: 'Failed to update tag' };
        }
    }

    async deleteTag(id) {
        try {
            const tag = await Tag.findByPk(id);
            if (!tag) {
                return { success: false, error: 'Tag not found' };
            }

            await tag.destroy();
            return { success: true, message: 'Tag deleted successfully' };
        } catch (error) {
            console.error('Error deleting tag:', error);
            return { success: false, error: 'Failed to delete tag' };
        }
    }

    async getTagsByCategory(category) {
        try {
            const tags = await Tag.findByCategory(category);
            return { success: true, data: tags };
        } catch (error) {
            console.error('Error fetching tags by category:', error);
            return { success: false, error: 'Failed to fetch tags by category' };
        }
    }

    async getSimilarTags(tagId, limit = 5) {
        try {
            const tags = await Tag.findSimilar(tagId, limit);
            return { success: true, data: tags };
        } catch (error) {
            console.error('Error fetching similar tags:', error);
            return { success: false, error: 'Failed to fetch similar tags' };
        }
    }

    async getTagsByKeywords(keywordArray) {
        try {
            const tags = await Tag.findByKeywords(keywordArray);
            return { success: true, data: tags };
        } catch (error) {
            console.error('Error fetching tags by keywords:', error);
            return { success: false, error: 'Failed to fetch tags by keywords' };
        }
    }

    async getTagInsights(tagId) {
        try {
            const tag = await Tag.findByPk(tagId);
            if (!tag) {
                return { success: false, error: 'Tag not found' };
            }

            const insights = await this.aiService.generateTagInsights(
                tag.title,
                tag.short_description,
                tag.keywords,
                tag.category
            );

            return { success: true, data: insights };
        } catch (error) {
            console.error('Error getting tag insights:', error);
            return { success: false, error: 'Failed to get tag insights' };
        }
    }

    async calculateTagSimilarity(tagId1, tagId2) {
        try {
            const tag1 = await Tag.findByPk(tagId1);
            const tag2 = await Tag.findByPk(tagId2);

            if (!tag1 || !tag2) {
                return { success: false, error: 'One or both tags not found' };
            }

            const similarity = this.aiService.calculateSimilarity(tag1, tag2);
            return { success: true, data: { similarity } };
        } catch (error) {
            console.error('Error calculating tag similarity:', error);
            return { success: false, error: 'Failed to calculate tag similarity' };
        }
    }

    async searchTags(query, limit = 10) {
        try {
            const { Op } = require('sequelize');

            const tags = await Tag.findAll({
                where: {
                    [Op.or]: [{
                            title: {
                                [Op.like]: `%${query}%`
                            }
                        },
                        {
                            short_description: {
                                [Op.like]: `%${query}%`
                            }
                        },
                        {
                            keywords: {
                                [Op.like]: `%${query}%`
                            }
                        }
                    ]
                },
                order: [
                    ['title', 'ASC']
                ],
                limit
            });

            return { success: true, data: tags };
        } catch (error) {
            console.error('Error searching tags:', error);
            return { success: false, error: 'Failed to search tags' };
        }
    }

    async getCategoryStats() {
        try {
            const { Op } = require('sequelize');

            const stats = await Tag.findAll({
                attributes: [
                    'category', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
                ],
                where: {
                    category: {
                        [Op.ne]: null
                    }
                },
                group: ['category'],
                order: [
                    [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']
                ]
            });

            return { success: true, data: stats };
        } catch (error) {
            console.error('Error fetching category stats:', error);
            return { success: false, error: 'Failed to fetch category stats' };
        }
    }
}

module.exports = new TagService();