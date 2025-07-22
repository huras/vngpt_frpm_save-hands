module.exports = (sequelize, Sequelize) => {
    const TagWorldBuildingDirectives = sequelize.define('TagWorldBuildingDirectives', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        characterGeneration: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for character generation based on this tag'
        },
        characterEvolution: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for character evolution and development based on this tag'
        },
        placeGeneration: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for place generation based on this tag'
        },
        placeEvolution: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for place evolution and changes based on this tag'
        },
        objectGeneration: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for object generation based on this tag'
        },
        objectEvolution: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for object evolution and transformation based on this tag'
        },
        arcGeneration: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for arc generation based on this tag'
        },
        arcEvolution: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for arc evolution and progression based on this tag'
        },
        pastEventsGeneration: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for past events generation based on this tag'
        },
        pastEventsEvolution: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI-generated directives for past events evolution and historical development based on this tag'
        },
        relevantAreas: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of relevant directive types for this tag (e.g., ["character_generation", "place_generation"])'
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
                name: 'unique_tag_world_building_directives_suggestion'
            },
            {
                fields: ['tagSuggestionId'],
                name: 'idx_tag_world_building_directives_suggestion'
            }
        ]
    });

    // Associations
    TagWorldBuildingDirectives.associate = function(models) {
        TagWorldBuildingDirectives.belongsTo(models.TagSuggestion, {
            foreignKey: 'tagSuggestionId',
            as: 'tagSuggestion'
        });

        // One-to-Many relationship with TagSuggestionDirective
        TagWorldBuildingDirectives.hasMany(models.TagSuggestionDirective, {
            foreignKey: 'tagWorldBuildingDirectivesId',
            as: 'directives'
        });
    };

    return TagWorldBuildingDirectives;
}; 