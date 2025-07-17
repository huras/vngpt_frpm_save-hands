'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.addColumn('Stories', 'lastReevaluatedAt', {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Timestamp of when tag suggestions were last re-evaluated'
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Stories', 'lastReevaluatedAt');
    }
}; 