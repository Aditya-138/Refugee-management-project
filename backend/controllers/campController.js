const Camp = require('../models/Camp');

// @desc    Create new camp
// @route   POST /api/camps
// @access  Public
const createCamp = async (req, res) => {
    try {
        const campData = {
            ...req.body,
            location: {
                type: 'Point',
                coordinates: [req.body.longitude, req.body.latitude]
            }
        };

        const camp = await Camp.create(campData);

        res.status(201).json({
            success: true,
            data: camp
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get all camps
// @route   GET /api/camps
// @access  Public
const getAllCamps = async (req, res) => {
    try {
        const camps = await Camp.find().populate('connectedCamps', 'name address');

        res.status(200).json({
            success: true,
            count: camps.length,
            data: camps
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get single camp
// @route   GET /api/camps/:id
// @access  Public
const getCampById = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id).populate('connectedCamps');

        if (!camp) {
            return res.status(404).json({
                success: false,
                error: 'Camp not found'
            });
        }

        res.status(200).json({
            success: true,
            data: camp
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update camp
// @route   PUT /api/camps/:id
// @access  Public
const updateCamp = async (req, res) => {
    try {
        // If coordinates are being updated, update the location field
        if (req.body.latitude && req.body.longitude) {
            req.body.location = {
                type: 'Point',
                coordinates: [req.body.longitude, req.body.latitude]
            };
        }

        const camp = await Camp.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!camp) {
            return res.status(404).json({
                success: false,
                error: 'Camp not found'
            });
        }

        res.status(200).json({
            success: true,
            data: camp
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete camp
// @route   DELETE /api/camps/:id
// @access  Public
const deleteCamp = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id);

        if (!camp) {
            return res.status(404).json({
                success: false,
                error: 'Camp not found'
            });
        }

        await camp.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get available camps (not full)
// @route   GET /api/camps/available
// @access  Public
const getAvailableCamps = async (req, res) => {
    try {
        const camps = await Camp.find({
            $expr: { $lt: ['$currentOccupancy', '$capacity'] },
            status: { $in: ['Active', 'Emergency'] }
        });

        res.status(200).json({
            success: true,
            count: camps.length,
            data: camps
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Connect two camps
// @route   POST /api/camps/:id/connect/:targetId
// @access  Public
const connectCamps = async (req, res) => {
    try {
        const camp1 = await Camp.findById(req.params.id);
        const camp2 = await Camp.findById(req.params.targetId);

        if (!camp1 || !camp2) {
            return res.status(404).json({
                success: false,
                error: 'One or both camps not found'
            });
        }

        // Add bidirectional connection
        if (!camp1.connectedCamps.includes(camp2._id)) {
            camp1.connectedCamps.push(camp2._id);
            await camp1.save();
        }

        if (!camp2.connectedCamps.includes(camp1._id)) {
            camp2.connectedCamps.push(camp1._id);
            await camp2.save();
        }

        res.status(200).json({
            success: true,
            data: { camp1, camp2 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    createCamp,
    getAllCamps,
    getCampById,
    updateCamp,
    deleteCamp,
    getAvailableCamps,
    connectCamps
};