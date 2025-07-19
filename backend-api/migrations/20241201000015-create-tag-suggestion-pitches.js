'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('TagSuggestionPitches', {
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
                onDelete: 'CASCADE'
            },
            pitch: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            pitchType: {
                type: Sequelize.ENUM('character_development', 'plot_enhancement', 'theme_exploration', 'world_building', 'conflict_creation', 'general'),
                allowNull: false,
                defaultValue: 'general'
            },
            confidence: {
                type: Sequelize.FLOAT,
                allowNull: true,
                defaultValue: 0.8
            },
            userRating: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            ratingComment: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            ratedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            isFavorite: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            generationContext: {
                type: Sequelize.TEXT,
                allowNull: true
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
        });

        // Add indexes with error handling
        try {
            await queryInterface.addIndex('TagSuggestionPitches', ['tagSuggestionId'], {
                name: 'idx_tag_suggestion_pitch_suggestion'
            });
        } catch (error) {
            console.log('Index idx_tag_suggestion_pitch_suggestion already exists, skipping...');
        }

        try {
            await queryInterface.addIndex('TagSuggestionPitches', ['pitchType'], {
                name: 'idx_tag_suggestion_pitch_type'
            });
        } catch (error) {
            console.log('Index idx_tag_suggestion_pitch_type already exists, skipping...');
        }

        try {
            await queryInterface.addIndex('TagSuggestionPitches', ['userRating'], {
                name: 'idx_tag_suggestion_pitch_rating'
            });
        } catch (error) {
            console.log('Index idx_tag_suggestion_pitch_rating already exists, skipping...');
        }

        try {
            await queryInterface.addIndex('TagSuggestionPitches', ['isFavorite'], {
                name: 'idx_tag_suggestion_pitch_favorite'
            });
        } catch (error) {
            console.log('Index idx_tag_suggestion_pitch_favorite already exists, skipping...');
        }
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('TagSuggestionPitches');
    }
}; 