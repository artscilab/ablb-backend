const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/testimonials', require('./testimonials'));
router.use('/lessons', require('./lessons'));

module.exports = router;