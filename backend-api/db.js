const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false, // Disable logging
    pool: {
      max: 25, // Maximum number of connections in pool
      min: 0,
      acquire: 30000, // Maximum time (in ms) that pool will try to get connection before throwing error
      idle: 10000 // Time (in ms) before an idle connection is released
    }
  })
 
module.exports = sequelize;