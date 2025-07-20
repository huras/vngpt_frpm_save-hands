'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        // Remove the unique constraint to allow multiple directives per suggestion
        await queryInterface.removeIndex('TagSuggestionDirectives', 'unique_tag_suggestion_directive');
        
        // Add a new index for better performance without uniqueness
        await queryInterface.addIndex('TagSuggestionDirectives', {
            fields: ['tagSuggestionId'],
            name: 'idx_tag_suggestion_directive_suggestion_many'
        });
    },

    down: async(queryInterface, Sequelize) => {
        // Remove the new index
        await queryInterface.removeIndex('TagSuggestionDirectives', 'idx_tag_suggestion_directive_suggestion_many');
        
        // Restore the unique constraint
        await queryInterface.addIndex('TagSuggestionDirectives', {
            unique: true,
            fields: ['tagSuggestionId'],
            name: 'unique_tag_suggestion_directive'
        });
    }
}; 