const Refugee = require('../models/Refugee');
const Camp = require('../models/Camp');
const { geocodeAddress } = require('../utils/geocoder');
const { findNearestCamp, findNearestCamps, calculateDistance } = require('../utils/distance');

// @desc    Geocode an address
// @route   POST /api/assignment/geocode
// @access  Public
const geocode = async (req, res) => {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an address'
            });
        }

        const location = await geocodeAddress(address);

        res.status(200).json({
            success: true,
            data: location
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Find nearest camps to a location
// @route   POST /api/assignment/nearest-camps
// @access  Public
const getNearestCamps = async (req, res) => {
    try {
        const { latitude, longitude, address, count = 5 } = req.body;
        let lat = latitude;
        let lon = longitude;

        // If address provided but no coordinates, geocode it
        if (address && (!latitude || !longitude)) {
            const location = await geocodeAddress(address);
            lat = location.latitude;
            lon = location.longitude;
        }

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                error: 'Please provide either coordinates or address'
            });
        }

        // Get all available camps
        const camps = await Camp.find({
            $expr: { $lt: ['$currentOccupancy', '$capacity'] },
            status: { $in: ['Active', 'Emergency'] }
        });

        if (camps.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No available camps found'
            });
        }

        const nearestCamps = findNearestCamps(lat, lon, camps, parseInt(count));

        res.status(200).json({
            success: true,
            searchLocation: { latitude: lat, longitude: lon },
            count: nearestCamps.length,
            data: nearestCamps
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Assign refugee to nearest available camp
// @route   POST /api/assignment/assign-refugee
// @access  Public
const assignRefugeeToNearestCamp = async (req, res) => {
    try {
        const { refugeeId } = req.body;

        if (!refugeeId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide refugee ID'
            });
        }

        // Get refugee details
        const refugee = await Refugee.findById(refugeeId);

        if (!refugee) {
            return res.status(404).json({
                success: false,
                error: 'Refugee not found'
            });
        }

        if (refugee.assignedCamp) {
            return res.status(400).json({
                success: false,
                error: 'Refugee already assigned to a camp'
            });
        }

        // Get all available camps
        const camps = await Camp.find({
            $expr: { $lt: ['$currentOccupancy', '$capacity'] },
            status: { $in: ['Active', 'Emergency'] }
        });

        if (camps.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No available camps found'
            });
        }

        // Find nearest camp with enough space
        const availableCamps = camps.filter(camp =>
            (camp.capacity - camp.currentOccupancy) >= refugee.familyMembers
        );

        if (availableCamps.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No camps with sufficient capacity found'
            });
        }

        const nearestCamp = findNearestCamp(
            refugee.latitude,
            refugee.longitude,
            availableCamps
        );

        // Update refugee with assigned camp
        refugee.assignedCamp = nearestCamp._id;
        refugee.status = 'Assigned';
        await refugee.save();

        // Update camp occupancy
        await Camp.findByIdAndUpdate(
            nearestCamp._id,
            { $inc: { currentOccupancy: refugee.familyMembers } }
        );

        res.status(200).json({
            success: true,
            message: 'Refugee successfully assigned to camp',
            data: {
                refugee: refugee,
                camp: nearestCamp,
                distance: nearestCamp.distance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Create refugee with address (auto-geocode) and auto-assign to camp
// @route   POST /api/assignment/register-and-assign
// @access  Public
const registerAndAssignRefugee = async (req, res) => {
    try {
        const { address, ...refugeeData } = req.body;

        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an address'
            });
        }

        // Geocode the address
        const location = await geocodeAddress(address);

        // Create refugee with geocoded coordinates
        const refugeePayload = {
            ...refugeeData,
            address: location.displayName || address,
            latitude: location.latitude,
            longitude: location.longitude,
            location: {
                type: 'Point',
                coordinates: [location.longitude, location.latitude]
            }
        };

        const refugee = await Refugee.create(refugeePayload);

        // Find and assign to nearest camp
        const camps = await Camp.find({
            $expr: { $lt: ['$currentOccupancy', '$capacity'] },
            status: { $in: ['Active', 'Emergency'] }
        });

        if (camps.length > 0) {
            const availableCamps = camps.filter(camp =>
                (camp.capacity - camp.currentOccupancy) >= refugee.familyMembers
            );

            if (availableCamps.length > 0) {
                const nearestCamp = findNearestCamp(
                    refugee.latitude,
                    refugee.longitude,
                    availableCamps
                );

                refugee.assignedCamp = nearestCamp._id;
                refugee.status = 'Assigned';
                await refugee.save();

                await Camp.findByIdAndUpdate(
                    nearestCamp._id,
                    { $inc: { currentOccupancy: refugee.familyMembers } }
                );

                return res.status(201).json({
                    success: true,
                    message: 'Refugee registered and assigned to nearest camp',
                    data: {
                        refugee: refugee,
                        camp: nearestCamp,
                        distance: nearestCamp.distance
                    }
                });
            }
        }

        // If no camps available, just return the created refugee
        res.status(201).json({
            success: true,
            message: 'Refugee registered but no available camps found',
            data: {
                refugee: refugee,
                camp: null
            }
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Calculate distance between two locations
// @route   POST /api/assignment/calculate-distance
// @access  Public
const getDistance = async (req, res) => {
    try {
        const { lat1, lon1, lat2, lon2 } = req.body;

        if (!lat1 || !lon1 || !lat2 || !lon2) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all coordinates (lat1, lon1, lat2, lon2)'
            });
        }

        const distance = calculateDistance(lat1, lon1, lat2, lon2);

        res.status(200).json({
            success: true,
            data: {
                distance: parseFloat(distance.toFixed(2)),
                unit: 'kilometers'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    geocode,
    getNearestCamps,
    assignRefugeeToNearestCamp,
    registerAndAssignRefugee,
    getDistance
};