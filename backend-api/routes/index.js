const express = require('express');
const router = express.Router();

router.use('/stories', require('./stories'));
router.use('/tags', require('./tags'));


module.exports = router;