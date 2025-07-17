module.exports = (sequelize, Sequelize) => {
    const Tag = sequelize.define('Tag', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        media_url: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'URL to image or video thumbnail'
        },
        media_type: {
            type: Sequelize.ENUM('image', 'video'),
            allowNull: true,
            defaultValue: 'image',
            comment: 'Type of media: image or video'
        },
        thumb_url: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Legacy field - use media_url instead'
        },
        short_description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        // AI-related fields
        category: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Main category for grouping similar tags (e.g., genre, theme, setting)'
        },
        keywords: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Comma-separated keywords for AI analysis and search'
        },
        ai_embedding: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'OpenAI embedding vector for semantic similarity (1536 dimensions)'
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
        hooks: {
            beforeSave: async(tag) => {
                // Auto-generate keywords if not provided
                if (!tag.keywords && tag.title) {
                    const words = tag.title.toLowerCase()
                        .split(/[\s\-_]+/)
                        .filter(word => word.length > 2);
                    tag.keywords = words.join(',');
                }

                // Auto-assign category if not provided
                if (!tag.category && tag.title) {
                    tag.category = await tag.assignedCategory || 'general';
                }
            }
        }
    });

    // Instance methods
    Tag.prototype.getKeywordsArray = function() {
        return this.keywords ? this.keywords.split(',').map(k => k.trim()) : [];
    };

    Tag.prototype.getEmbeddingArray = function() {
        try {
            return this.ai_embedding ? JSON.parse(this.ai_embedding) : null;
        } catch (error) {
            console.error('Error parsing ai_embedding:', error);
            return null;
        }
    };

    Tag.prototype.getSimilarityScore = function(otherTag) {
        if (!this.ai_embedding || !otherTag.ai_embedding) return 0;

        try {
            const embedding1 = this.getEmbeddingArray();
            const embedding2 = otherTag.getEmbeddingArray();

            if (!embedding1 || !embedding2) return 0;

            // Calculate cosine similarity
            const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
            const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
            const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));

            return dotProduct / (magnitude1 * magnitude2);
        } catch (error) {
            console.error('Error calculating similarity:', error);
            return 0;
        }
    };

    // Class methods
    Tag.findByCategory = function(category) {
        return this.findAll({
            where: { category },
            order: [
                ['title', 'ASC']
            ]
        });
    };

    Tag.findSimilar = function(tagId, limit = 5) {
        return this.findAll({
            where: {
                id: {
                    [Sequelize.Op.ne]: tagId
                }
            },
            order: [
                ['title', 'ASC']
            ],
            limit
        });
    };

    Tag.findByKeywords = function(keywordArray) {
        const { Op } = require('sequelize');
        const keywordConditions = keywordArray.map(keyword => ({
            keywords: {
                [Op.like]: `%${keyword}%`
            }
        }));

        return this.findAll({
            where: {
                [Op.or]: keywordConditions
            },
            order: [
                ['title', 'ASC']
            ]
        });
    };

    // Associations for Tag
    Tag.associate = function(models) {
        // Many-to-Many relationship with Story
        Tag.belongsToMany(models.Story, {
            through: 'story_tags', // Link table for the many-to-many relationship
            as: 'stories'
        });
    };

    return Tag;
};