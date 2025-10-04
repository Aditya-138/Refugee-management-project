const express = require('express');
const router = express.Router();
const {
    createCamp,
    getAllCamps,
    getCampById,
    updateCamp,
    deleteCamp,
    getAvailableCamps,
    connectCamps
} = require('../controllers/campController');

// Special routes (must be before /:id routes)
router.get('/available', getAvailableCamps);
router.post('/:id/connect/:targetId', connectCamps);

// Base routes
router.route('/')
    .get(getAllCamps)
    .post(createCamp);

// ID-based routes
router.route('/:id')
    .get(getCampById)
    .put(updateCamp)
    .delete(deleteCamp);

module.exports = router;