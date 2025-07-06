module.exports = (sequelize, Sequelize) => {
    const Model = sequelize.define('Model', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        url: {
            type: Sequelize.STRING,
            allowNull: true
        },
        face_url: {
            type: Sequelize.STRING,
            allowNull: true
        },
        thumbUrl: {
            type: Sequelize.STRING,
            allowNull: true
        },
        backthumbUrl: {
            type: Sequelize.STRING,
            allowNull: true
        },
        stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        ethnic_beauty_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        ethnic_beauty: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: ""
        },
        gallery_urls: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        torso_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        h_level_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        nip_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        aoreola_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        face_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        ss_wideness_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        ss_fullness_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        ss_size_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        tt_fullness_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        tt_size_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        would_give_baby_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        would_take_baby_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        diversity_baby_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        leg_deliciousness_stars: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        female: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
        sub_scraped: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        nickname: {
            type: Sequelize.STRING,
            allowNull: true
        },
        level: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        skill: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        spirit: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        strength: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        vitality: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        speed: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        mana: {
            type: Sequelize.FLOAT,
            allowNull: true
        },
        skills: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        magics: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        backstory: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        scoreRating: {
            type: Sequelize.DOUBLE,
            allowNull: true
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
    }, {});

    // // Associations for Model
    // Model.associate = function(models) {
    //   // Many-to-Many relationship with GalleryCategory
    //   Model.belongsToMany(models.GalleryCategory, {
    //     through: 'model_gallery_category', // Link table for the many-to-many relationship
    //     as: 'categories'
    //   });

    //   // Many-to-Many relationship with Gallery
    //   Model.belongsToMany(models.Gallery, {
    //     through: 'galleries_models', // Link table for the many-to-many relationship
    //     as: 'galleries'
    //   });

    //   // Optional: Define reverse associations for clarity
    //   models.Gallery.belongsToMany(Model, {
    //     through: 'galleries_models',
    //     as: 'models'
    //   });
    // };

    // // Example custom method for Model
    // Model.findModelsByGalleryCategory = async function(categoryId) {
    //   return Model.findAll({
    //     include: {
    //       model: sequelize.models.GalleryCategory,
    //       where: { id: categoryId },
    //       as: 'categories'
    //     }
    //   });
    // };

    return Model;
};