/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers

    // Convert degrees to radians
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // Distance in kilometers
};

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number}
 */
const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Find nearest camp to given coordinates
 * @param {number} latitude - Refugee latitude
 * @param {number} longitude - Refugee longitude
 * @param {Array} camps - Array of camp objects with latitude and longitude
 * @returns {Object} Nearest camp with distance
 */
const findNearestCamp = (latitude, longitude, camps) => {
    if (!camps || camps.length === 0) {
        return null;
    }

    let nearestCamp = null;
    let minDistance = Infinity;

    camps.forEach(camp => {
        const distance = calculateDistance(
            latitude,
            longitude,
            camp.latitude,
            camp.longitude
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearestCamp = {
                ...camp.toObject ? camp.toObject() : camp,
                distance: parseFloat(distance.toFixed(2))
            };
        }
    });

    return nearestCamp;
};

/**
 * Find N nearest camps to given coordinates
 * @param {number} latitude - Refugee latitude
 * @param {number} longitude - Refugee longitude
 * @param {Array} camps - Array of camp objects
 * @param {number} count - Number of nearest camps to return
 * @returns {Array} Array of nearest camps with distances
 */
const findNearestCamps = (latitude, longitude, camps, count = 5) => {
    if (!camps || camps.length === 0) {
        return [];
    }

    const campsWithDistance = camps.map(camp => {
        const distance = calculateDistance(
            latitude,
            longitude,
            camp.latitude,
            camp.longitude
        );

        return {
            ...camp.toObject ? camp.toObject() : camp,
            distance: parseFloat(distance.toFixed(2))
        };
    });

    // Sort by distance and return top N
    return campsWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, count);
};

/**
 * Check if a location is within a certain radius of a point
 * @param {number} lat1 - Center point latitude
 * @param {number} lon1 - Center point longitude
 * @param {number} lat2 - Target point latitude
 * @param {number} lon2 - Target point longitude
 * @param {number} radius - Radius in kilometers
 * @returns {boolean}
 */
const isWithinRadius = (lat1, lon1, lat2, lon2, radius) => {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= radius;
};

module.exports = {
    calculateDistance,
    findNearestCamp,
    findNearestCamps,
    isWithinRadius
};