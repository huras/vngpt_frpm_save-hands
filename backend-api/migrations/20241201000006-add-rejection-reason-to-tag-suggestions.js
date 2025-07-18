'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.addColumn('TagSuggestions', 'rejectionReason', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Reason provided by user for rejecting this suggestion'
        });

        // Add index for better query performance when analyzing rejections
        await queryInterface.addIndex('TagSuggestions', ['status', 'rejectionReason'], {
            name: 'idx_tag_suggestion_status_rejection'
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.removeIndex('TagSuggestions', 'idx_tag_suggestion_status_rejection');
        await queryInterface.removeColumn('TagSuggestions', 'rejectionReason');
    }
}; 