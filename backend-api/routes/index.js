const express = require('express');
const router = express.Router();

router.use('/stories', require('./stories'));


module.exports = router;