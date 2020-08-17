const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/testimonials', require('./testimonials'));
router.use('/lessons', require('./lessons'));
router.use('/videos', require('./videos'));
router.use('/people', require('./people'));
router.use('/about', require('./about'));

module.exports = router;