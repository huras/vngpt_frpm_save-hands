'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.addColumn('Tags', 'media_url', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'URL to image or video thumbnail'
        });

        await queryInterface.addColumn('Tags', 'media_type', {
            type: Sequelize.ENUM('image', 'video'),
            allowNull: true,
            defaultValue: 'image',
            comment: 'Type of media: image or video'
        });

        // Migrate existing thumb_url data to media_url
        await queryInterface.sequelize.query(`
      UPDATE Tags 
      SET media_url = thumb_url, media_type = 'image' 
      WHERE thumb_url IS NOT NULL AND media_url IS NULL
    `);
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Tags', 'media_type');
        await queryInterface.removeColumn('Tags', 'media_url');
    }
};