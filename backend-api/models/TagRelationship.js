module.exports = (sequelize, Sequelize) => {
    const TagRelationship = sequelize.define('TagRelationship', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sourceTagId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Tags',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            comment: 'The source tag that has related tags'
        },
        relatedTagId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Tags',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            comment: 'The related tag that is suggested for the source tag'
        },
        relationshipType: {
            type: Sequelize.ENUM('complementary', 'synergistic', 'thematic', 'genre_related', 'setting_related'),
            allowNull: false,
            defaultValue: 'complementary',
            comment: 'Type of relationship between the tags'
        },
        confidence: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0.8,
            comment: 'AI confidence score for this relationship (0-1)'
        },
        reasoning: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'AI reasoning for why these tags are related'
        },
        usageCount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Number of times this relationship has been used in stories'
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Whether this relationship is currently active'
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
                fields: ['sourceTagId', 'relatedTagId'],
                name: 'unique_tag_relationship'
            },
            {
                fields: ['sourceTagId'],
                name: 'idx_tag_relationship_source'
            },
            {
                fields: ['relatedTagId'],
                name: 'idx_tag_relationship_related'
            },
            {
                fields: ['relationshipType'],
                name: 'idx_tag_relationship_type'
            },
            {
                fields: ['isActive'],
                name: 'idx_tag_relationship_active'
            }
        ]
    });

    // Associations
    TagRelationship.associate = function(models) {
        TagRelationship.belongsTo(models.Tag, {
            foreignKey: 'sourceTagId',
            as: 'sourceTag'
        });
        
        TagRelationship.belongsTo(models.Tag, {
            foreignKey: 'relatedTagId',
            as: 'relatedTag'
        });
    };

    return TagRelationship;
}; 