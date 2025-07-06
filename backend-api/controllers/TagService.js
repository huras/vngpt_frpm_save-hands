const BaseService = require('./BaseService');
const { Tag, Story } = require('../models');
const { getImageUrl, deleteImage } = require('../utils/imageUpload');

class TagService extends BaseService {
    constructor() {
        super(Tag, [
            { model: Story, as: 'stories' }
        ]);
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
        const story = await Story.findByPk(storyId);
        if (!story) throw new Error('Story not found.');
        const associated = await tag.hasStory(story);
        if (associated) return tag;
        await tag.addStory(story);
        return this.findById(tagId);
    }

    async removeTagFromStory(tagId, storyId) {
        const tag = await this.findById(tagId);
        const story = await Story.findByPk(storyId);
        if (!story) throw new Error('Story not found.');
        await tag.removeStory(story);
        return this.findById(tagId);
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

    async createWithImage(tagData, imageFile) {
        try {
            // If image file is provided, update the thumb_url
            if (imageFile) {
                tagData.thumb_url = getImageUrl(imageFile.filename);
            }

            const tag = await this.create(tagData);
            return tag;
        } catch (error) {
            // If creation fails and image was uploaded, delete it
            if (imageFile) {
                await deleteImage(imageFile.filename);
            }
            throw error;
        }
    }

    async updateWithImage(id, tagData, imageFile) {
        try {
            const existingTag = await this.findById(id);
            if (!existingTag) {
                throw new Error('Tag not found');
            }

            // If new image is provided, delete old image and update thumb_url
            if (imageFile) {
                // Delete old image if it exists
                if (existingTag.thumb_url) {
                    const oldFilename = existingTag.thumb_url.split('/').pop();
                    await deleteImage(oldFilename);
                }
                tagData.thumb_url = getImageUrl(imageFile.filename);
            }

            const updatedTag = await this.update(id, tagData);
            return updatedTag;
        } catch (error) {
            // If update fails and new image was uploaded, delete it
            if (imageFile) {
                await deleteImage(imageFile.filename);
            }
            throw error;
        }
    }

    async deleteWithImage(id) {
        try {
            const tag = await this.findById(id);
            if (!tag) {
                throw new Error('Tag not found');
            }

            // Delete associated image if it exists
            if (tag.thumb_url) {
                const filename = tag.thumb_url.split('/').pop();
                await deleteImage(filename);
            }

            // Delete the tag
            await this.delete(id);
            return { message: 'Tag deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new TagService();