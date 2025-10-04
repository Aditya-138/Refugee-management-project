const express = require('express');
const router = express.Router();
const {
    geocode,
    getNearestCamps,
    assignRefugeeToNearestCamp,
    registerAndAssignRefugee,
    getDistance
} = require('../controllers/assignmentController');

// Geocoding routes
router.post('/geocode', geocode);

// Distance calculation
router.post('/calculate-distance', getDistance);

// Find nearest camps
router.post('/nearest-camps', getNearestCamps);

// Assign refugee to camp
router.post('/assign-refugee', assignRefugeeToNearestCamp);

// Register refugee with address and auto-assign
router.post('/register-and-assign', registerAndAssignRefugee);

module.exports = router;