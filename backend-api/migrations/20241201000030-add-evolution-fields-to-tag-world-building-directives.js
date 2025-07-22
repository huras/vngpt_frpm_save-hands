'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        // Add new evolution fields to TagWorldBuildingDirectives table
        await queryInterface.addColumn('TagWorldBuildingDirectives', 'characterEvolution', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for character evolution and development based on this tag'
        });

        await queryInterface.addColumn('TagWorldBuildingDirectives', 'placeEvolution', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for place evolution and changes based on this tag'
        });

        await queryInterface.addColumn('TagWorldBuildingDirectives', 'objectEvolution', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for object evolution and transformation based on this tag'
        });

        await queryInterface.addColumn('TagWorldBuildingDirectives', 'arcEvolution', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for arc evolution and progression based on this tag'
        });

        await queryInterface.addColumn('TagWorldBuildingDirectives', 'pastEventsEvolution', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for past events evolution and historical development based on this tag'
        });
    },

    down: async(queryInterface, Sequelize) => {
        // Remove the evolution columns
        await queryInterface.removeColumn('TagWorldBuildingDirectives', 'pastEventsEvolution');
        await queryInterface.removeColumn('TagWorldBuildingDirectives', 'arcEvolution');
        await queryInterface.removeColumn('TagWorldBuildingDirectives', 'objectEvolution');
        await queryInterface.removeColumn('TagWorldBuildingDirectives', 'placeEvolution');
        await queryInterface.removeColumn('TagWorldBuildingDirectives', 'characterEvolution');
    }
}; 