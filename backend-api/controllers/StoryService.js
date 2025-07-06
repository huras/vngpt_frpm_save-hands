const BaseService = require('./BaseService');
const { Story } = require('../models');

class StoryService extends BaseService {
    constructor() {
        super(Story, []);
    }

    async findAllPaginated(filters, paginationArgs) {
        const { page, perPage } = paginationArgs;
        const { offset, limit } = this.getPagination(page, perPage);

        const paginatedStories = await this.model.findAndCountAll({
            where: filters,
            offset,
            limit,
            include: this.includes,
            order: [
                ['createdAt', 'DESC']
            ]
        });

        const totalItems = paginatedStories.count;
        const totalPages = Math.ceil(totalItems / perPage);

        return {
            data: paginatedStories.rows,
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

    async searchStories(searchTerm, paginationArgs = { page: 1, perPage: 10 }) {
        const { page, perPage } = paginationArgs;
        const { offset, limit } = this.getPagination(page, perPage);

        const { Op } = require('sequelize');

        const searchFilters = {
            [Op.or]: [
                { title: {
                        [Op.like]: `%${searchTerm}%` } },
                { brainstorm: {
                        [Op.like]: `%${searchTerm}%` } }
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

        const totalItems = paginatedStories.count;
        const totalPages = Math.ceil(totalItems / perPage);

        return {
            data: paginatedStories.rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
            },
        };
    }
}

module.exports = new StoryService();