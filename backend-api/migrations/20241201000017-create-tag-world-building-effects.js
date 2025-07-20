'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TagWorldBuildingEffects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tags',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      effectType: {
        type: Sequelize.ENUM('setting', 'character', 'plot', 'atmosphere', 'theme', 'conflict', 'resolution'),
        allowNull: false,
        defaultValue: 'setting'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      impactLevel: {
        type: Sequelize.ENUM('minor', 'moderate', 'major', 'transformative'),
        allowNull: false,
        defaultValue: 'moderate'
      },
      storyElements: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      examples: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      conflicts: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      synergies: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      confidence: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.8
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
      await queryInterface.addIndex('TagWorldBuildingEffects', ['tagId'], {
        name: 'idx_tag_world_building_tag'
      });
    } catch (error) {
      console.log('Index idx_tag_world_building_tag already exists, skipping...');
    }
    try {
      await queryInterface.addIndex('TagWorldBuildingEffects', ['effectType'], {
        name: 'idx_tag_world_building_type'
      });
    } catch (error) {
      console.log('Index idx_tag_world_building_type already exists, skipping...');
    }
    try {
      await queryInterface.addIndex('TagWorldBuildingEffects', ['impactLevel'], {
        name: 'idx_tag_world_building_impact'
      });
    } catch (error) {
      console.log('Index idx_tag_world_building_impact already exists, skipping...');
    }
    try {
      await queryInterface.addIndex('TagWorldBuildingEffects', ['isActive'], {
        name: 'idx_tag_world_building_active'
      });
    } catch (error) {
      console.log('Index idx_tag_world_building_active already exists, skipping...');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TagWorldBuildingEffects');
  }
}; 