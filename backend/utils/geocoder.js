const axios = require('axios');

/**
 * Geocode an address to latitude and longitude using OpenStreetMap Nominatim API
 * @param {string} address - The address to geocode
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
const geocodeAddress = async (address) => {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'RefugeeManagementSystem/1.0'
            }
        });

        if (response.data && response.data.length > 0) {
            const location = response.data[0];
            return {
                latitude: parseFloat(location.lat),
                longitude: parseFloat(location.lon),
                displayName: location.display_name
            };
        } else {
            throw new Error('Address not found');
        }
    } catch (error) {
        throw new Error(`Geocoding failed: ${error.message}`);
    }
};

/**
 * Reverse geocode coordinates to an address
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>}
 */
const reverseGeocode = async (latitude, longitude) => {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
                lat: latitude,
                lon: longitude,
                format: 'json'
            },
            headers: {
                'User-Agent': 'RefugeeManagementSystem/1.0'
            }
        });

        if (response.data && response.data.display_name) {
            return response.data.display_name;
        } else {
            throw new Error('Location not found');
        }
    } catch (error) {
        throw new Error(`Reverse geocoding failed: ${error.message}`);
    }
};

module.exports = {
    geocodeAddress,
    reverseGeocode
};