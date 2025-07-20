'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TagRelationships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sourceTagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tags',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      relatedTagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tags',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      relationshipType: {
        type: Sequelize.ENUM('complementary', 'synergistic', 'thematic', 'genre_related', 'setting_related'),
        allowNull: false,
        defaultValue: 'complementary'
      },
      confidence: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.8
      },
      reasoning: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      usageCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Create indexes with error handling
    try {
      await queryInterface.addIndex('TagRelationships', ['sourceTagId', 'relatedTagId'], {
        unique: true,
        name: 'unique_tag_relationship'
      });
    } catch (error) {
      console.log('Index unique_tag_relationship already exists, skipping...');
    }
    try {
      await queryInterface.addIndex('TagRelationships', ['sourceTagId'], {
        name: 'idx_tag_relationship_source'
      });
    } catch (error) {
      console.log('Index idx_tag_relationship_source already exists, skipping...');
    }
    try {
      await queryInterface.addIndex('TagRelationships', ['relatedTagId'], {
        name: 'idx_tag_relationship_related'
      });
    } catch (error) {
      console.log('Index idx_tag_relationship_related already exists, skipping...');
    }
    try {
      await queryInterface.addIndex('TagRelationships', ['relationshipType'], {
        name: 'idx_tag_relationship_type'
      });
    } catch (error) {
      console.log('Index idx_tag_relationship_type already exists, skipping...');
    }
    try {
      await queryInterface.addIndex('TagRelationships', ['isActive'], {
        name: 'idx_tag_relationship_active'
      });
    } catch (error) {
      console.log('Index idx_tag_relationship_active already exists, skipping...');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TagRelationships');
  }
}; 