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

    // Create indexes
    await queryInterface.addIndex('TagWorldBuildingEffects', ['tagId'], {
      name: 'idx_tag_world_building_tag'
    });
    await queryInterface.addIndex('TagWorldBuildingEffects', ['effectType'], {
      name: 'idx_tag_world_building_type'
    });
    await queryInterface.addIndex('TagWorldBuildingEffects', ['impactLevel'], {
      name: 'idx_tag_world_building_impact'
    });
    await queryInterface.addIndex('TagWorldBuildingEffects', ['isActive'], {
      name: 'idx_tag_world_building_active'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TagWorldBuildingEffects');
  }
}; 