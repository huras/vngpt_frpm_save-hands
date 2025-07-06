'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.addColumn('Tags', 'category', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Main category for grouping similar tags (e.g., genre, theme, setting)'
        });

        await queryInterface.addColumn('Tags', 'keywords', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Comma-separated keywords for AI analysis and search'
        });

        await queryInterface.addColumn('Tags', 'ai_embedding', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'OpenAI embedding vector for semantic similarity (1536 dimensions)'
        });

        // Add index for better performance
        await queryInterface.addIndex('Tags', ['category']);
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.removeIndex('Tags', ['category']);

        await queryInterface.removeColumn('Tags', 'ai_embedding');
        await queryInterface.removeColumn('Tags', 'keywords');
        await queryInterface.removeColumn('Tags', 'category');
    }
};