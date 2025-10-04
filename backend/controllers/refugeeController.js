const Refugee = require('../models/Refugee');
const Camp = require('../models/Camp');

// @desc    Create new refugee
// @route   POST /api/refugees
// @access  Public
const createRefugee = async (req, res) => {
    try {
        const refugeeData = {
            ...req.body,
            location: {
                type: 'Point',
                coordinates: [req.body.longitude, req.body.latitude]
            }
        };

        const refugee = await Refugee.create(refugeeData);

        res.status(201).json({
            success: true,
            data: refugee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get all refugees
// @route   GET /api/refugees
// @access  Public
const getAllRefugees = async (req, res) => {
    try {
        const refugees = await Refugee.find().populate('assignedCamp', 'name address');

        res.status(200).json({
            success: true,
            count: refugees.length,
            data: refugees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get single refugee
// @route   GET /api/refugees/:id
// @access  Public
const getRefugeeById = async (req, res) => {
    try {
        const refugee = await Refugee.findById(req.params.id).populate('assignedCamp');

        if (!refugee) {
            return res.status(404).json({
                success: false,
                error: 'Refugee not found'
            });
        }

        res.status(200).json({
            success: true,
            data: refugee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update refugee
// @route   PUT /api/refugees/:id
// @access  Public
const updateRefugee = async (req, res) => {
    try {
        // If coordinates are being updated, update the location field
        if (req.body.latitude && req.body.longitude) {
            req.body.location = {
                type: 'Point',
                coordinates: [req.body.longitude, req.body.latitude]
            };
        }

        const refugee = await Refugee.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!refugee) {
            return res.status(404).json({
                success: false,
                error: 'Refugee not found'
            });
        }

        res.status(200).json({
            success: true,
            data: refugee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete refugee
// @route   DELETE /api/refugees/:id
// @access  Public
const deleteRefugee = async (req, res) => {
    try {
        const refugee = await Refugee.findById(req.params.id);

        if (!refugee) {
            return res.status(404).json({
                success: false,
                error: 'Refugee not found'
            });
        }

        // If refugee was assigned to a camp, decrease camp occupancy
        if (refugee.assignedCamp) {
            await Camp.findByIdAndUpdate(
                refugee.assignedCamp,
                { $inc: { currentOccupancy: -refugee.familyMembers } }
            );
        }

        await refugee.deleteOne();

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

module.exports = {
    createRefugee,
    getAllRefugees,
    getRefugeeById,
    updateRefugee,
    deleteRefugee
};