const express = require('express');
const router = express.Router();

router.use('/models', require('./models'));
router.use('/galleries', require('./galleries'));
router.use('/categories', require('./categories'));
router.use('/scraping', require('./scraping'));
router.use('/pictures', require('./pictures'));

module.exports = router;
