const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const Camp = require('./models/Camp');
const Refugee = require('./models/Refugee');

dotenv.config();

// Geocoding function
const geocodeAddress = async (address) => {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: address, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'RefugeeManagementSystem/1.0' }
        });

        if (response.data && response.data.length > 0) {
            return {
                latitude: parseFloat(response.data[0].lat),
                longitude: parseFloat(response.data[0].lon)
            };
        }
        throw new Error('Address not found');
    } catch (error) {
        console.error(`Geocoding failed for ${address}:`, error.message);
        return null;
    }
};

// Sample camps data
const campsData = [
    {
        name: "Mumbai Relief Center",
        address: "Bandra West, Mumbai, Maharashtra, India",
        capacity: 500,
        contactNumber: "+91-9876543210",
        managedBy: "Maharashtra Disaster Management Authority",
        resources: { food: 1000, water: 2000, medical: 100, shelter: 500 },
        facilities: ["Medical Center", "Food Distribution", "Shelter", "Water Supply"]
    },
    {
        name: "Delhi Safe Zone",
        address: "Connaught Place, New Delhi, Delhi, India",
        capacity: 800,
        contactNumber: "+91-9876543211",
        managedBy: "Delhi Emergency Services",
        resources: { food: 1500, water: 3000, medical: 150, shelter: 800 },
        facilities: ["Hospital Wing", "Emergency Services", "Food Court", "Sanitation"]
    },
    {
        name: "Pune Rescue Hub",
        address: "Shivajinagar, Pune, Maharashtra, India",
        capacity: 400,
        contactNumber: "+91-9876543212",
        managedBy: "Red Cross India",
        resources: { food: 800, water: 1500, medical: 80, shelter: 400 },
        facilities: ["Medical Tent", "Food Distribution", "Child Care Center"]
    },
    {
        name: "Chennai Emergency Camp",
        address: "T Nagar, Chennai, Tamil Nadu, India",
        capacity: 600,
        contactNumber: "+91-9876543213",
        managedBy: "Tamil Nadu Relief Organization",
        resources: { food: 1200, water: 2500, medical: 120, shelter: 600 },
        facilities: ["Hospital", "Food Supply", "Temporary Housing", "Schools"]
    },
    {
        name: "Bangalore Safe Haven",
        address: "MG Road, Bangalore, Karnataka, India",
        capacity: 700,
        contactNumber: "+91-9876543214",
        managedBy: "Karnataka Disaster Response Team",
        resources: { food: 1400, water: 2800, medical: 140, shelter: 700 },
        facilities: ["Medical Center", "Food Distribution", "Recreation Area", "Counseling"]
    }
];

// Sample refugees data
const refugeesData = [
    {
        name: "Amit Kumar",
        age: 35,
        gender: "Male",
        contactNumber: "+91-9123456780",
        address: "Andheri, Mumbai, Maharashtra, India",
        medicalConditions: "Diabetes",
        familyMembers: 4
    },
    {
        name: "Priya Sharma",
        age: 28,
        gender: "Female",
        contactNumber: "+91-9123456781",
        address: "Rohini, New Delhi, India",
        medicalConditions: "None",
        familyMembers: 3
    },
    {
        name: "Rajesh Patel",
        age: 42,
        gender: "Male",
        contactNumber: "+91-9123456782",
        address: "Kothrud, Pune, Maharashtra, India",
        medicalConditions: "Asthma",
        familyMembers: 5
    },
    {
        name: "Lakshmi Iyer",
        age: 31,
        gender: "Female",
        contactNumber: "+91-9123456783",
        address: "Adyar, Chennai, Tamil Nadu, India",
        medicalConditions: "None",
        familyMembers: 2
    },
    {
        name: "Suresh Reddy",
        age: 45,
        gender: "Male",
        contactNumber: "+91-9123456784",
        address: "Koramangala, Bangalore, Karnataka, India",
        medicalConditions: "High Blood Pressure",
        familyMembers: 6
    },
    {
        name: "Anita Das",
        age: 26,
        gender: "Female",
        contactNumber: "+91-9123456785",
        address: "Salt Lake, Kolkata, West Bengal, India",
        medicalConditions: "Pregnant - 7 months",
        familyMembers: 3
    },
    {
        name: "Mohammed Ali",
        age: 38,
        gender: "Male",
        contactNumber: "+91-9123456786",
        address: "Madhapur, Hyderabad, Telangana, India",
        medicalConditions: "None",
        familyMembers: 4
    },
    {
        name: "Neha Desai",
        age: 24,
        gender: "Female",
        contactNumber: "+91-9123456787",
        address: "Satellite, Ahmedabad, Gujarat, India",
        medicalConditions: "None",
        familyMembers: 2
    }
];

// Seed camps
const seedCamps = async () => {
    console.log('🏕️  Seeding camps...');

    for (const campData of campsData) {
        try {
            // Add delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));

            const coords = await geocodeAddress(campData.address);

            if (coords) {
                const camp = await Camp.create({
                    ...campData,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    location: {
                        type: 'Point',
                        coordinates: [coords.longitude, coords.latitude]
                    }
                });
                console.log(`✅ Created camp: ${camp.name}`);
            } else {
                console.log(`❌ Failed to geocode: ${campData.name}`);
            }
        } catch (error) {
            console.error(`❌ Error creating ${campData.name}:`, error.message);
        }
    }
};

// Seed refugees and assign to camps
const seedRefugees = async () => {
    console.log('👥 Seeding refugees...');

    for (const refugeeData of refugeesData) {
        try {
            // Add delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));

            const coords = await geocodeAddress(refugeeData.address);

            if (coords) {
                const refugee = await Refugee.create({
                    ...refugeeData,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    location: {
                        type: 'Point',
                        coordinates: [coords.longitude, coords.latitude]
                    }
                });

                // Find nearest available camp
                const camps = await Camp.find({
                    $expr: { $lt: ['$currentOccupancy', '$capacity'] }
                });

                if (camps.length > 0) {
                    // Simple nearest camp logic
                    let nearestCamp = camps[0];
                    let minDistance = Infinity;

                    camps.forEach(camp => {
                        const distance = Math.sqrt(
                            Math.pow(camp.latitude - refugee.latitude, 2) +
                            Math.pow(camp.longitude - refugee.longitude, 2)
                        );
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestCamp = camp;
                        }
                    });

                    // Assign refugee to nearest camp
                    refugee.assignedCamp = nearestCamp._id;
                    refugee.status = 'Assigned';
                    await refugee.save();

                    // Update camp occupancy
                    nearestCamp.currentOccupancy += refugee.familyMembers;
                    await nearestCamp.save();

                    console.log(`✅ Created refugee: ${refugee.name} → ${nearestCamp.name}`);
                } else {
                    console.log(`✅ Created refugee: ${refugee.name} (no camp available)`);
                }
            } else {
                console.log(`❌ Failed to geocode: ${refugeeData.name}`);
            }
        } catch (error) {
            console.error(`❌ Error creating ${refugeeData.name}:`, error.message);
        }
    }
};

// Main seed function
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 MongoDB Connected');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Camp.deleteMany({});
        await Refugee.deleteMany({});
        console.log('✅ Data cleared');

        // Seed camps first
        await seedCamps();

        // Then seed refugees
        await seedRefugees();

        console.log('🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

// Run the seed
seedDatabase();