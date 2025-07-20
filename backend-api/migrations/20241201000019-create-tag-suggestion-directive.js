'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('TagSuggestionDirectives', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            tagSuggestionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'TagSuggestions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'Reference to the accepted TagSuggestion'
            },
            directive: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: 'The AI-generated directive for using this tag effectively'
            },
            directive_aim: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: 'The specific aim or goal of this directive'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        }, {
            indexes: [
                {
                    unique: true,
                    fields: ['tagSuggestionId'],
                    name: 'unique_tag_suggestion_directive'
                },
                {
                    fields: ['tagSuggestionId'],
                    name: 'idx_tag_suggestion_directive_suggestion'
                }
            ]
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('TagSuggestionDirectives');
    }
}; 