const express = require('express');
const modelService = require('../controllers/ModelService');
const galleryService = require('../controllers/GalleryService');

const db = require("../models");
const { sequelize, Gallery, GalleryCategory, Model, Picture } = db;
const { Op } = require('sequelize');

const router = express.Router();


router.put('/update-model-stars', async(req, res) => {
    try {
        const modelID = req.body.modelId; // Gallery ID from the request
        const stars = req.body.stars; // Array of gallery objects from the request
        var star_type = req.body.star_type

        const model = await Model.findOne({
            where: {
                id: modelID
            }
        });

        if (model) {
            if (!star_type) {
                model.stars = stars;
            } else {
                model[star_type] = stars;
            }
            await model.save();
            await updateModelScoreRating(model);
        } else {
            res.status(404).json({ error: 'Model not found.' });
        }

        res.json({ success: true, message: 'Model stars updated.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching gallery.' });
    }
});


// Route: /update-model-gender
router.put('/update-model-gender', async(req, res) => {
    try {
        const { modelId, gender } = req.body;
        const model = await modelService.update(modelId, { female: gender === 'F' });
        res.json({ success: true, model });
    } catch (error) {
        console.error('Error updating gender:', error);
        res.status(500).json({ error: 'An error occurred while updating model gender.' });
    }
});

router.post('/set-ethinic-beauty', async(req, res) => {
    const model_id = req.body.model_id;
    const ethnic_beauty = req.body.ethnic_beauty;

    try {
        const model = await Model.findOne({
            where: {
                id: model_id
            }
        });

        if (model) {
            model.ethnic_beauty = ethnic_beauty;
            await model.save();
            res.json({ success: true, message: "Model updated", model });
        } else {
            res.status(404).json({ error: 'Model not found.' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while updating model.' });
    }
});

router.get('/full-recalculate_score-rating', async(req, res) => {
    const allModels = await Model.findAll();
    for (const model of allModels) {
        await updateModelScoreRating(model);
    }
    res.json({ success: true, message: 'All models score rating recalculated.' });
});

const updateModelScoreRating = async(model) => {
    const ratingType = '2';
    const ratingLiteral = getRatingLiteral(ratingType);

    var {
        h_level_stars,
        stars,
        face_stars,
        tt_fullness_stars,
        tt_size_stars,
        nip_stars,
        aoreola_stars,
        torso_stars,
        leg_deliciousness_stars,
        ss_size_stars,
        ss_fullness_stars,
        ss_wideness_stars,
        would_give_baby_stars,
        would_take_baby_stars,
        diversity_baby_stars
    } = model;

    const original_h_level_stars = h_level_stars;
    if (!h_level_stars) h_level_stars = 0;
    else if (h_level_stars == 3) h_level_stars = 4;
    else if (h_level_stars == 4) h_level_stars = 4;
    else if (h_level_stars == 5) h_level_stars = 6;
    else if (h_level_stars == 6) h_level_stars = 6;
    else if (h_level_stars == 7) h_level_stars = 8;
    else if (h_level_stars == 8) h_level_stars = 8;
    else if (h_level_stars == 9) h_level_stars = 9;
    else if (h_level_stars == 10) h_level_stars = 10;
    else if (h_level_stars == 11) h_level_stars = 11;
    else if (h_level_stars == 12) h_level_stars = 12;

    const original_stars = stars;
    if (!stars) stars = 0;
    else if (stars == 1) stars = 1;
    else if (stars == 2) stars = 1;
    else if (stars == 3) stars = 2;
    else if (stars == 4) stars = 2;
    else if (stars == 5) stars = 3;
    else if (stars == 6) stars = 4;

    var scoreRating = 0;

    switch (ratingType) {
        case '1':
            scoreRating = (
                0 +
                torso_stars * (face_stars) +
                (ss_size_stars * ss_fullness_stars / 3) * face_stars +
                (tt_fullness_stars * face_stars) * face_stars +
                tt_size_stars * (face_stars) +
                nip_stars * (face_stars) +
                (face_stars) +
                (tt_fullness_stars)
            );
            break;

        case '2':
            scoreRating = (
                0 +
                original_h_level_stars * 2 +
                h_level_stars * 25

                +
                would_give_baby_stars * 300 +
                would_take_baby_stars * 200 +
                Math.pow(2, Number.parseInt(diversity_baby_stars ? diversity_baby_stars : 0)) * 30

                +
                // stars * 150
                face_stars * 105

                +
                torso_stars * 7

                +
                leg_deliciousness_stars * 10

                +
                tt_fullness_stars * (tt_size_stars + 9) +
                tt_size_stars * 25 +
                nip_stars * 12 +
                aoreola_stars * 12

                +
                ss_size_stars * (ss_fullness_stars + 7) +
                ss_wideness_stars * (ss_fullness_stars + 6)
            );
            break;

        case '3':
            scoreRating = (
                0 +
                stars +
                Math.pow(h_level_stars, 0.30 * face_stars) +
                Math.pow(h_level_stars, 0.20 * ss_fullness_stars * (ss_size_stars * 0.5)) +
                Math.pow(h_level_stars, 0.25 * tt_fullness_stars * tt_size_stars) +
                Math.pow(h_level_stars, 0.14 * nip_stars) +
                Math.pow(h_level_stars, 0.29 * torso_stars) +
                Math.pow(h_level_stars, 1.2 * h_level_stars) +
                Math.pow(h_level_stars, 0.26 * ss_fullness_stars * leg_deliciousness_stars)
            );
    }

    model.scoreRating = scoreRating;

    // const query = `
    //   UPDATE \`Models\` SET \`scoreRating\` = ${ratingLiteral} WHERE \`id\` = ${model.id}
    // `;

    try {
        await model.save();
    } catch (error) {
        console.error('Error updating model score rating:', error);
    }
}

function calculateBallonFitness(F, R, P, S) {
    // Fullness (F), Radius (R), Point Size (P), Safe Area Size (S)

    // Ensure inputs are within valid ranges
    F = Math.max(0, Math.min(F, 3));
    R = Math.max(0, Math.min(R, 4));
    P = Math.max(0, Math.min(P, 5)); // Assuming P can be 4 or 5
    S = Math.max(0, Math.min(S, 3));

    // Calculate contributions of Point Size and Safe Area Size
    const pointMultiplier = Math.max(0, P - 2) * 1.3; // Weight for P
    const safeAreaMultiplier = Math.max(0, S - 2) * 1.2; // Weight for S

    // Calculate fitness
    const fitness = F * (R * (1 + pointMultiplier + safeAreaMultiplier));

    return fitness;
}

const level_calculation_case = `
  CASE
    WHEN \`Model\`.\`h_level_stars\` = 3 THEN 3 
    WHEN \`Model\`.\`h_level_stars\` = 4 THEN 3 
    WHEN \`Model\`.\`h_level_stars\` = 5 THEN 4 
    WHEN \`Model\`.\`h_level_stars\` = 6 THEN 4
    WHEN \`Model\`.\`h_level_stars\` = 7 THEN 5 
    WHEN \`Model\`.\`h_level_stars\` = 8 THEN 5  
    ELSE \`Model\`.\`h_level_stars\` 
  END
`;
const ratingLiteral7 = `
        (
          0
          + \`Model\`.\`stars\`
          + POW( ( ${level_calculation_case}) * 1, 0.30 * \`Model\`.\`face_stars\`)
          + POW( ( ${level_calculation_case}) * 1, 0.20 * \`Model\`.\`ss_fullness_stars\` * (\`Model\`.\`ss_size_stars\` * 0.5))
          + POW( ( ${level_calculation_case}) * 1, 0.25 * \`Model\`.\`tt_fullness_stars\` * \`Model\`.\`tt_size_stars\`)
          + POW( ( ${level_calculation_case}) * 1, 0.14 * \`Model\`.\`nip_stars\`)
          + POW( ( ${level_calculation_case}) * 1, 0.21 * \`Model\`.\`torso_stars\`)
          + POW( ( ${level_calculation_case}) * 1, 1.2 * \`Model\`.\`h_level_stars\`)
          + POW( ( ${level_calculation_case}) * 1, 0.25 * \`Model\`.\`ss_fullness_stars\` * \`Model\`.\`leg_deliciousness_stars\`)
          )
          `;

const ratingLiteral6 = `
        (
          0
          + POW( \`Model\`.\`face_stars\` * 1.25, 0.20 * \`Model\`.\`ss_fullness_stars\` * (\`Model\`.\`ss_size_stars\` * 0.5))
          + POW( \`Model\`.\`face_stars\` * 1.25, 0.25 * \`Model\`.\`tt_fullness_stars\` * \`Model\`.\`tt_size_stars\`)
          + POW( \`Model\`.\`face_stars\` * 1.25, 0.21 * \`Model\`.\`torso_stars\`)
          + POW( \`Model\`.\`face_stars\` * 1.25, 1.2 * \`Model\`.\`h_level_stars\`)
          + POW( \`Model\`.\`face_stars\` * 1.25, 0.25 * \`Model\`.\`ss_fullness_stars\` * \`Model\`.\`leg_deliciousness_stars\`)
          )
          `;

const getRatingLiteral = (ratingType) => {
    switch (ratingType) {
        case '1':
            return `
                  (
                    0
                    + \`Model\`.\`torso_stars\` * (\`Model\`.\`face_stars\` )
                    + (\`Model\`.\`ss_size_stars\` * \`Model\`.\`ss_fullness_stars\` / 3) * \`Model\`.\`face_stars\` 
                    + (\`Model\`.\`tt_fullness_stars\` * \`Model\`.\`face_stars\` ) * \`Model\`.\`face_stars\`
                    + \`Model\`.\`tt_size_stars\` * (\`Model\`.\`face_stars\` ) 
                    +  \`Model\`.\`nip_stars\` * (\`Model\`.\`face_stars\` )
                    + (\`Model\`.\`face_stars\` )
                    + (\`Model\`.\`tt_fullness_stars\` )
                  )
                `;
        case '2':
            return `
                  (
                    0
                    + POW(2.2, \`Model\`.\`torso_stars\`)
                    + POW(2.15, \`Model\`.\`face_stars\`)
                    + POW(2.5, \`Model\`.\`tt_fullness_stars\`) 
                    + POW(2, \`Model\`.\`tt_size_stars\`) 
                    + POW(2.5, CASE WHEN \`Model\`.\`nip_stars\` - 2 > 0 THEN \`Model\`.\`nip_stars\` - 2 ELSE 1 END)
                    + POW(2.5, \`Model\`.\`ss_fullness_stars\`) 
                    + POW(1.25, \`Model\`.\`ss_size_stars\`)
                  )
                `;
            // Add additional rating formulas as needed...
        case '3':
            return ratingLiteral7;
        default:
            return `(
                  0
                  + POW( \`Model\`.\`face_stars\`, 0.25 * \`Model\`.\`ss_fullness_stars\` * \`Model\`.\`ss_size_stars\`)
                  + POW( \`Model\`.\`face_stars\`, 0.35 * \`Model\`.\`tt_fullness_stars\` * \`Model\`.\`tt_size_stars\`)
                  + POW( \`Model\`.\`face_stars\`, 0.23 * \`Model\`.\`torso_stars\`)
                  + POW( \`Model\`.\`face_stars\`, 0.5 * \`Model\`.\`ss_fullness_stars\` * \`Model\`.\`ss_fullness_stars\`)
                )`;
    }
};

const models_include = [{
        model: Picture,
        as: 'pictures', // Make sure to use the alias you defined in the Model associations
        include: [{
            model: Gallery,
            as: 'galleries', // Use correct alias here
            include: [{
                model: Picture,
                as: 'pictures' // Use correct alias here
            }]
        }]
    },
    {
        model: GalleryCategory,
        as: 'Categories', // Use the alias defined in the association with Model
        required: false
    },
    {
        model: GalleryCategory,
        as: 'Race', // Explicitly use the alias for the other association with GalleryCategory
        required: false
    }
]

router.get('/models', async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;
        const offset = (page - 1) * perPage;

        const { name, categories, orderBy } = req.query;

        // Default order clause
        let orderClause = [
            ['ss_fullness_stars', 'DESC']
        ];

        // Parse and validate orderBy parameter
        if (orderBy) {
            try {
                const parsedOrderBy = JSON.parse(orderBy);
                const validColumns = [
                    'ss_fullness_stars',
                    'tt_fullness_stars', 'tt_size_stars',
                    'id', 'name', 'nickname', 'stars', 'torso_stars', 'h_level_stars',
                    'nip_stars', 'aoreola_stars', 'face_stars', 'ss_wideness_stars',
                    'ss_size_stars', 'leg_deliciousness_stars',
                    'speed', 'mana', 'scoreRating'
                ];
                const validDirections = ['ASC', 'DESC'];

                // Build validated order clause
                orderClause = parsedOrderBy
                    .filter(({ column, direction }) =>
                        validColumns.includes(column) && validDirections.includes(direction)
                    )
                    .map(({ column, direction }) => [column, direction]);
            } catch (error) {
                console.error('Invalid orderBy parameter:', error);
                // Fallback to default order clause
                orderClause = [
                    ['ss_fullness_stars', 'DESC']
                ];
            }
        }

        const whereClause = {
            female: true
        };
        if (name) {
            whereClause.name = {
                [Op.like]: `%${name}%`
            };
        }
        if (categories) {
            whereClause.categories = {
                [Op.like]: `%${categories}%`
            };
        }

        const paginatedModels = await Model.findAll({
            where: whereClause,
            limit: perPage,
            offset: offset,
            order: orderClause,
            include: [{
                model: Picture,
                as: 'pictures',
                // include: [{
                //   model: Gallery,
                //   as: 'galleries', // Use correct alias here
                //   include: [
                //     {
                //       model: Picture,
                //       as: 'pictures' // Use correct alias here
                //     }
                //   ]
                // }]
            }, {
                model: GalleryCategory,
                as: 'categories', // Use the alias defined in the association with Model
            }]
        });

        const totalItems = await Model.count({ where: whereClause });
        const totalPages = Math.ceil(totalItems / perPage);

        res.json({
            data: paginatedModels,
            pagination: { currentPage: page, totalPages, totalItems },
        });
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'An error occurred while fetching models.' });
    }
});



// Search models by name
router.get('/search-models', async(req, res) => {
    const { search_text } = req.query;
    try {
        const models = await Model.findAll({
            where: {
                name: {
                    [Op.like]: `%${search_text}%`
                }
            }
        });
        res.status(200).json(models);
    } catch (error) {
        res.status(500).send('Error searching models: ' + error.message);
    }
});

// Search categories by name
router.get('/search-categories', async(req, res) => {
    const { search_text } = req.query;
    try {
        const categories = await GalleryCategory.findAll({
            where: {
                name: {
                    [Op.like]: `%${search_text}%`
                }
            }
        });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).send('Error searching categories: ' + error.message);
    }
});

// Get a model by ID and all its relations
router.get('/model/:id', async(req, res) => {
    try {
        const modelID = req.params.id; // Gallery ID from the request

        const model = await Model.findOne({
            where: {
                id: modelID
            },
            include: [{
                    model: Picture,
                    as: 'pictures',
                    // include: [{
                    //   model: Gallery,
                    //   as: 'galleries', // Use correct alias here
                    //   include: [
                    //     {
                    //       model: Picture,
                    //       as: 'pictures' // Use correct alias here
                    //     }
                    //   ]
                    // }]
                }, {
                    model: Gallery,
                    as: 'galleries',
                    include: {
                        model: Picture,
                        as: 'pictures'
                    }
                }, {
                    model: GalleryCategory,
                    as: 'categories', // Use the alias defined in the association with Model
                    required: false
                },
                {
                    model: GalleryCategory,
                    as: 'Race', // Explicitly use the alias for the other association with GalleryCategory
                    required: false
                }
            ]
        })

        res.status(200).json(model);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching gallery.' });
    }
});

// Get multiple models by IDs with all their relations
router.get('/models-by-ids', async(req, res) => {
    try {
        const { ids } = req.query;

        if (!ids) {
            return res.status(400).json({ error: 'Model IDs are required' });
        }

        const modelIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

        if (modelIds.length === 0) {
            return res.status(400).json({ error: 'No valid model IDs provided' });
        }

        const models = await Model.findAll({
            where: {
                id: {
                    [Op.in]: modelIds
                }
            },
            include: [{
                    model: Picture,
                    as: 'pictures',
                }, {
                    model: Gallery,
                    as: 'galleries',
                    include: {
                        model: Picture,
                        as: 'pictures'
                    }
                }, {
                    model: GalleryCategory,
                    as: 'categories',
                    required: false
                },
                {
                    model: GalleryCategory,
                    as: 'Race',
                    required: false
                }
            ],
            order: [
                ['id', 'ASC']
            ]
        });

        res.status(200).json(models);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching models.' });
    }
});

// Toggle category association with model
router.post('/toggle-model-category', async(req, res) => {
    const { model_id, category_id, active } = req.body;

    try {
        // Step 1: Fetch the model to ensure it exists
        const model = await Model.findByPk(model_id);
        if (!model) {
            return res.status(404).json({ error: 'Model not found' });
        }

        // Step 2: Check if the category exists
        const category = await GalleryCategory.findByPk(category_id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Use the alias 'categories' that was set up in the association
        const isAssociated = await model.hasCategory(category);

        if (!active) {
            // If associated, remove the category
            if (isAssociated) {
                await model.removeCategory(category);
            }
        } else if (active) {
            // If not associated, add the category
            if (!isAssociated) {
                await model.addCategory(category);
            }
        }

        // Step 3: Fetch the updated model for verification
        const updatedModel = await Model.findOne({
            where: {
                id: model_id
            },
            include: [{ model: GalleryCategory, as: 'categories' }]
        });

        res.status(200).json(updatedModel);
    } catch (error) {
        console.error('Error toggling category for model:', error);
        res.status(500).json({ error: 'An error occurred while toggling category for model.' });
    }
});

//Update a model thumb based on id and image url
router.put('/toggle-image-to-model-gallery', async(req, res) => {
    const { modelId, imageUrl } = req.body;
    const model = await Model.findOne({ where: { id: modelId } });

    if (model) {
        const gallery = model.gallery_urls ? JSON.parse(model.gallery_urls) : [];
        const imageExists = gallery.includes(imageUrl);

        if (imageExists) {
            // Remove image if already in the gallery
            model.gallery_urls = JSON.stringify(gallery.filter((url) => url !== imageUrl));
        } else {
            // Add image to the end of the gallery
            gallery.push(imageUrl);
            model.gallery_urls = JSON.stringify(gallery);
        }

        await model.save();
        res.json({ success: true, message: imageExists ? 'Image removed from gallery.' : 'Image added to gallery.' });
    } else {
        res.status(404).json({ error: 'Model not found.' });
    }
});

// Set a specific image as the first in the gallery
router.put('/set-first-image-in-model-gallery', async(req, res) => {
    const { modelId, imageUrl } = req.body;
    const model = await Model.findOne({ where: { id: modelId } });

    if (model) {
        const gallery = model.gallery_urls ? JSON.parse(model.gallery_urls) : [];
        if (!gallery.includes(imageUrl)) {
            return res.status(400).json({ error: 'Image not found in gallery.' });
        }
        // Move the image to the first position
        const updatedGallery = [imageUrl, ...gallery.filter((url) => url !== imageUrl)];
        model.gallery_urls = JSON.stringify(updatedGallery);
        await model.save();
        res.json({ success: true, message: 'Image set as first in gallery.' });
    } else {
        res.status(404).json({ error: 'Model not found.' });
    }
});

// Set a specific image at a desired index in the gallery
router.put('/set-image-index-in-model-gallery', async(req, res) => {
    const { modelId, imageUrl, index } = req.body;
    const model = await Model.findOne({ where: { id: modelId } });

    if (model) {
        let gallery = model.gallery_urls ? JSON.parse(model.gallery_urls) : [];
        const currentIdx = gallery.indexOf(imageUrl);
        if (currentIdx === -1) {
            return res.status(400).json({ error: 'Image not found in gallery.' });
        }
        // Remove the image from its current position
        gallery.splice(currentIdx, 1);
        // Clamp the index to a valid range
        const targetIdx = Math.max(0, Math.min(index, gallery.length));
        // Insert the image at the desired index
        gallery.splice(targetIdx, 0, imageUrl);
        model.gallery_urls = JSON.stringify(gallery);
        await model.save();
        res.json({ success: true, message: `Image moved to index ${targetIdx}.` });
    } else {
        res.status(404).json({ error: 'Model not found.' });
    }
});

router.put('/update-model-gender', async(req, res) => {
    const { modelId, gender } = req.body;
    const model = await Model.findOne({
        where: {
            id: modelId
        }
    });

    if (model) {
        model.female = gender === "F"
        await model.save();
        res.json({ success: true, message: "Model sex updated." });
    } else {
        res.status(404).json({ error: 'Model not found.' });
    }
});


router.put('/update-model-stars', async(req, res) => {
    try {
        const modelID = req.body.modelId; // Gallery ID from the request
        const stars = req.body.stars; // Array of gallery objects from the request
        var star_type = req.body.star_type

        const model = await Model.findOne({
            where: {
                id: modelID
            }
        });

        if (model) {
            if (!star_type)
                model.stars = stars;
            else
                model[star_type] = stars;
            await model.save();
        } else {
            res.status(404).json({ error: 'Model not found.' });
        }

        res.json({ success: true, message: 'Model stars updated.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching gallery.' });
    }
});

// Other model routes here...

module.exports = router;