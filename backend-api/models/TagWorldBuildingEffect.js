module.exports = (sequelize, Sequelize) => {
    const TagWorldBuildingEffect = sequelize.define('TagWorldBuildingEffect', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tagId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Tags',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            comment: 'The tag this world-building effect belongs to'
        },
        effectType: {
            type: Sequelize.ENUM('setting', 'character', 'plot', 'atmosphere', 'theme', 'conflict', 'resolution'),
            allowNull: false,
            defaultValue: 'setting',
            comment: 'Type of world-building effect'
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: 'Short title for this world-building effect'
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
            comment: 'Detailed description of how this tag affects world-building'
        },
        impactLevel: {
            type: Sequelize.ENUM('minor', 'moderate', 'major', 'transformative'),
            allowNull: false,
            defaultValue: 'moderate',
            comment: 'Level of impact this tag has on the story'
        },
        storyElements: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of story elements this tag affects (characters, setting, plot points, etc.)'
        },
        examples: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of example scenarios or story moments'
        },
        conflicts: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of potential conflicts or challenges this tag introduces'
        },
        synergies: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of tags that work well with this one for world-building'
        },
        confidence: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0.8,
            comment: 'AI confidence score for this world-building effect (0-1)'
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Whether this world-building effect is currently active'
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
                fields: ['tagId'],
                name: 'idx_tag_world_building_tag'
            },
            {
                fields: ['effectType'],
                name: 'idx_tag_world_building_type'
            },
            {
                fields: ['impactLevel'],
                name: 'idx_tag_world_building_impact'
            },
            {
                fields: ['isActive'],
                name: 'idx_tag_world_building_active'
            }
        ]
    });

    // Instance methods
    TagWorldBuildingEffect.prototype.getStoryElementsArray = function() {
        try {
            return this.storyElements ? JSON.parse(this.storyElements) : [];
        } catch (error) {
            console.error('Error parsing storyElements:', error);
            return [];
        }
    };

    TagWorldBuildingEffect.prototype.getExamplesArray = function() {
        try {
            return this.examples ? JSON.parse(this.examples) : [];
        } catch (error) {
            console.error('Error parsing examples:', error);
            return [];
        }
    };

    TagWorldBuildingEffect.prototype.getConflictsArray = function() {
        try {
            return this.conflicts ? JSON.parse(this.conflicts) : [];
        } catch (error) {
            console.error('Error parsing conflicts:', error);
            return [];
        }
    };

    TagWorldBuildingEffect.prototype.getSynergiesArray = function() {
        try {
            return this.synergies ? JSON.parse(this.synergies) : [];
        } catch (error) {
            console.error('Error parsing synergies:', error);
            return [];
        }
    };

    // Associations
    TagWorldBuildingEffect.associate = function(models) {
        TagWorldBuildingEffect.belongsTo(models.Tag, {
            foreignKey: 'tagId',
            as: 'tag'
        });
    };

    return TagWorldBuildingEffect;
}; 