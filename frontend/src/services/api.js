const API_URL = 'http://localhost:5000/api';


// Helper function to handle fetch requests
const fetchAPI = async (endpoint, options = {}) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

// ============ REFUGEE APIs ============
export const refugeeAPI = {
    // Get all refugees
    getAll: () => fetchAPI('/refugees'),

    // Get single refugee
    getById: (id) => fetchAPI(`/refugees/${id}`),

    // Create refugee (manual - with coordinates)
    create: (data) =>
        fetchAPI('/refugees', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Update refugee
    update: (id, data) =>
        fetchAPI(`/refugees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    // Delete refugee
    delete: (id) =>
        fetchAPI(`/refugees/${id}`, {
            method: 'DELETE',
        }),
};

// ============ CAMP APIs ============
export const campAPI = {
    // Get all camps
    getAll: () => fetchAPI('/camps'),

    // Get single camp
    getById: (id) => fetchAPI(`/camps/${id}`),

    // Get available camps only
    getAvailable: () => fetchAPI('/camps/available'),

    // Create camp
    create: (data) =>
        fetchAPI('/camps', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Update camp
    update: (id, data) =>
        fetchAPI(`/camps/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    // Delete camp
    delete: (id) =>
        fetchAPI(`/camps/${id}`, {
            method: 'DELETE',
        }),

    // Connect two camps
    connect: (id1, id2) =>
        fetchAPI(`/camps/${id1}/connect/${id2}`, {
            method: 'POST',
        }),
};

// ============ ASSIGNMENT APIs ============
export const assignmentAPI = {
    // Geocode an address
    geocode: (address) =>
        fetchAPI('/assignment/geocode', {
            method: 'POST',
            body: JSON.stringify({ address }),
        }),

    // Get nearest camps to location
    getNearestCamps: (data) =>
        fetchAPI('/assignment/nearest-camps', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Assign existing refugee to nearest camp
    assignRefugee: (refugeeId) =>
        fetchAPI('/assignment/assign-refugee', {
            method: 'POST',
            body: JSON.stringify({ refugeeId }),
        }),

    // Register refugee with address (auto-geocode and auto-assign)
    registerAndAssign: (data) =>
        fetchAPI('/assignment/register-and-assign', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Calculate distance
    calculateDistance: (coords) =>
        fetchAPI('/assignment/calculate-distance', {
            method: 'POST',
            body: JSON.stringify(coords),
        }),
};