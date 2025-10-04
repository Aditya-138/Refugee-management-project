const express = require('express');
const router = express.Router();
const {
    createRefugee,
    getAllRefugees,
    getRefugeeById,
    updateRefugee,
    deleteRefugee
} = require('../controllers/refugeeController');

// Base routes
router.route('/')
    .get(getAllRefugees)
    .post(createRefugee);

// ID-based routes
router.route('/:id')
    .get(getRefugeeById)
    .put(updateRefugee)
    .delete(deleteRefugee);

module.exports = router;