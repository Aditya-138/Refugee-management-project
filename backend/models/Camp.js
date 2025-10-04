const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide camp name'],
        unique: true,
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Please provide camp address']
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
    capacity: {
        type: Number,
        required: [true, 'Please provide camp capacity'],
        min: 1
    },
    currentOccupancy: {
        type: Number,
        default: 0,
        min: 0
    },
    resources: {
        food: {
            type: Number,
            default: 0
        },
        water: {
            type: Number,
            default: 0
        },
        medical: {
            type: Number,
            default: 0
        },
        shelter: {
            type: Number,
            default: 0
        }
    },
    facilities: {
        type: [String],
        default: []
    },
    connectedCamps: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Camp'
    }],
    status: {
        type: String,
        enum: ['Active', 'Full', 'Inactive', 'Emergency'],
        default: 'Active'
    },
    managedBy: {
        type: String,
        default: 'Disaster Management Authority'
    },
    contactNumber: {
        type: String
    },
    establishedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create 2dsphere index for geospatial queries
campSchema.index({ location: '2dsphere' });

// Virtual property to check availability
campSchema.virtual('availableCapacity').get(function () {
    return this.capacity - this.currentOccupancy;
});

// Update status based on occupancy
campSchema.pre('save', function (next) {
    if (this.currentOccupancy >= this.capacity) {
        this.status = 'Full';
    } else if (this.status === 'Full' && this.currentOccupancy < this.capacity) {
        this.status = 'Active';
    }
    next();
});

const Camp = mongoose.model('Camp', campSchema);

module.exports = Camp;