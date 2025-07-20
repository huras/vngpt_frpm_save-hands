'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.addColumn('Tags', 'broader_description', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Comprehensive description providing broader context and detailed explanation of the tag'
        });

        // Add index for better performance when searching by broader_description
        await queryInterface.addIndex('Tags', ['broader_description'], {
            type: 'FULLTEXT',
            name: 'idx_tags_broader_description_fulltext'
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.removeIndex('Tags', 'idx_tags_broader_description_fulltext');
        await queryInterface.removeColumn('Tags', 'broader_description');
    }
}; 