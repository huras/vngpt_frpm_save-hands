'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        try {
            // Remove the existing unique constraint
            await queryInterface.removeIndex('TagSuggestions', 'unique_story_tag_suggestion');
            console.log('Removed existing unique constraint on storyId, tagId');
        } catch (error) {
            console.log('Unique constraint unique_story_tag_suggestion does not exist, skipping removal');
        }

        try {
            // Add a new unique constraint that only applies to pending suggestions
            // This allows multiple suggestions for the same story-tag combination
            // but ensures only one pending suggestion exists at a time
            await queryInterface.addIndex('TagSuggestions', ['storyId', 'tagId', 'status'], {
                unique: true,
                where: {
                    status: 'pending'
                },
                name: 'unique_pending_story_tag_suggestion'
            });
            console.log('Added new unique constraint for pending suggestions only');
        } catch (error) {
            console.log('Error adding new unique constraint:', error.message);
        }

        // Add additional indexes for better performance
        try {
            await queryInterface.addIndex('TagSuggestions', ['storyId', 'tagId'], {
                name: 'idx_story_tag_suggestion'
            });
            console.log('Added index on storyId, tagId');
        } catch (error) {
            console.log('Index idx_story_tag_suggestion already exists, skipping...');
        }
    },

    down: async(queryInterface, Sequelize) => {
        try {
            // Remove the new unique constraint
            await queryInterface.removeIndex('TagSuggestions', 'unique_pending_story_tag_suggestion');
            console.log('Removed unique constraint for pending suggestions');
        } catch (error) {
            console.log('Unique constraint unique_pending_story_tag_suggestion does not exist, skipping removal');
        }

        try {
            // Restore the original unique constraint
            await queryInterface.addIndex('TagSuggestions', ['storyId', 'tagId'], {
                unique: true,
                name: 'unique_story_tag_suggestion'
            });
            console.log('Restored original unique constraint on storyId, tagId');
        } catch (error) {
            console.log('Error restoring original unique constraint:', error.message);
        }

        try {
            // Remove the additional index
            await queryInterface.removeIndex('TagSuggestions', 'idx_story_tag_suggestion');
            console.log('Removed additional index on storyId, tagId');
        } catch (error) {
            console.log('Index idx_story_tag_suggestion does not exist, skipping removal');
        }
    }
}; 