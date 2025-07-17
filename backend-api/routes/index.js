const express = require('express');
const router = express.Router();

router.use('/stories', require('./stories'));
router.use('/tags', require('./tags'));
router.use('/intelligent-tags', require('./intelligent-tags'));

module.exports = router;