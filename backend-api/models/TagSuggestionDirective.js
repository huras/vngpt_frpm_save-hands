module.exports = (sequelize, Sequelize) => {
    const TagSuggestionDirective = sequelize.define('TagSuggestionDirective', {
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
        tagWorldBuildingDirectivesId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'TagWorldBuildingDirectives',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            comment: 'Reference to the TagWorldBuildingDirectives this directive belongs to'
        },
        directiveType: {
            type: Sequelize.ENUM('character_generation', 'character_evolution', 'place_generation', 'place_evolution', 'object_generation', 'object_evolution', 'arc_generation', 'arc_evolution', 'past_events_generation', 'past_events_evolution', 'general'),
            allowNull: false,
            defaultValue: 'general',
            comment: 'Type of directive this represents'
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
                fields: ['tagSuggestionId'],
                name: 'idx_tag_suggestion_directive_suggestion'
            }
        ]
    });

    // Associations
    TagSuggestionDirective.associate = function(models) {
        TagSuggestionDirective.belongsTo(models.TagSuggestion, {
            foreignKey: 'tagSuggestionId',
            as: 'tagSuggestion'
        });

        TagSuggestionDirective.belongsTo(models.TagWorldBuildingDirectives, {
            foreignKey: 'tagWorldBuildingDirectivesId',
            as: 'tagWorldBuildingDirectives'
        });
    };

    return TagSuggestionDirective;
}; 