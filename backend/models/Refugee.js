const mongoose = require('mongoose');

const refugeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide refugee name'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Please provide age']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    contactNumber: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Please provide address']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    assignedCamp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Camp',
        default: null
    },
    medicalConditions: {
        type: String,
        default: 'None'
    },
    familyMembers: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'Relocated'],
        default: 'Pending'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create 2dsphere index for geospatial queries
refugeeSchema.index({ location: '2dsphere' });

const Refugee = mongoose.model('Refugee', refugeeSchema);

module.exports = Refugee;