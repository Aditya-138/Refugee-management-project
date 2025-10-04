import React, { useState } from 'react';
import { campAPI, assignmentAPI } from '../services/api';
import '../styles/Forms.css';

const CampForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        capacity: '',
        contactNumber: '',
        managedBy: 'Disaster Management Authority',
        food: 0,
        water: 0,
        medical: 0,
        shelter: 0,
        facilities: '',
    });

    const [loading, setLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [coordinates, setCoordinates] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleGeocodeAddress = async () => {
        if (!formData.address) {
            setMessage({ type: 'error', text: 'Please enter an address first' });
            return;
        }

        setGeocoding(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await assignmentAPI.geocode(formData.address);

            if (response.success) {
                setCoordinates({
                    latitude: response.data.latitude,
                    longitude: response.data.longitude,
                });
                setMessage({
                    type: 'success',
                    text: `Address geocoded! Lat: ${response.data.latitude.toFixed(4)}, Lon: ${response.data.longitude.toFixed(4)}`,
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to geocode address. Please check the address.',
            });
        } finally {
            setGeocoding(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!coordinates) {
            setMessage({ type: 'error', text: 'Please geocode the address first!' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const facilitiesArray = formData.facilities
                ? formData.facilities.split(',').map((f) => f.trim()).filter((f) => f)
                : [];

            const campData = {
                name: formData.name,
                address: formData.address,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                capacity: parseInt(formData.capacity),
                contactNumber: formData.contactNumber,
                managedBy: formData.managedBy,
                resources: {
                    food: parseInt(formData.food) || 0,
                    water: parseInt(formData.water) || 0,
                    medical: parseInt(formData.medical) || 0,
                    shelter: parseInt(formData.shelter) || 0,
                },
                facilities: facilitiesArray,
            };

            const response = await campAPI.create(campData);

            if (response.success) {
                setMessage({
                    type: 'success',
                    text: `Camp "${formData.name}" created successfully!`,
                });

                // Reset form
                setFormData({
                    name: '',
                    address: '',
                    capacity: '',
                    contactNumber: '',
                    managedBy: 'Disaster Management Authority',
                    food: 0,
                    water: 0,
                    medical: 0,
                    shelter: 0,
                    facilities: '',
                });
                setCoordinates(null);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to create camp',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Create New Camp</h2>
            <p className="form-subtitle">Enter camp details and geocode the address before submitting.</p>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="name">Camp Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Camp Alpha"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="address">Address *</label>
                    <div className="address-group">
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            rows="2"
                            placeholder="Enter camp address"
                        />
                        <button type="button" className="btn-geocode" onClick={handleGeocodeAddress} disabled={geocoding}>
                            {geocoding ? 'Geocoding...' : '📍 Geocode'}
                        </button>
                    </div>
                    {coordinates && (
                        <small className="coordinates-display">
                            ✅ Coordinates: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                        </small>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="capacity">Capacity *</label>
                        <input
                            type="number"
                            id="capacity"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            required
                            min="1"
                            placeholder="Max people"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contactNumber">Contact Number</label>
                        <input
                            type="tel"
                            id="contactNumber"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            placeholder="+91-XXXXXXXXXX"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="managedBy">Managed By</label>
                    <input
                        type="text"
                        id="managedBy"
                        name="managedBy"
                        value={formData.managedBy}
                        onChange={handleChange}
                        placeholder="Organization name"
                    />
                </div>

                <div className="form-section">
                    <h3>Resources Available</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="food">Food (units)</label>
                            <input type="number" id="food" name="food" value={formData.food} onChange={handleChange} min="0" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="water">Water (units)</label>
                            <input type="number" id="water" name="water" value={formData.water} onChange={handleChange} min="0" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="medical">Medical (units)</label>
                            <input
                                type="number"
                                id="medical"
                                name="medical"
                                value={formData.medical}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="shelter">Shelter (units)</label>
                            <input
                                type="number"
                                id="shelter"
                                name="shelter"
                                value={formData.shelter}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="facilities">Facilities (comma-separated)</label>
                    <input
                        type="text"
                        id="facilities"
                        name="facilities"
                        value={formData.facilities}
                        onChange={handleChange}
                        placeholder="e.g., Medical Center, Food Distribution, Shelter"
                    />
                </div>

                <button type="submit" className="btn-submit" disabled={loading || !coordinates}>
                    {loading ? 'Creating Camp...' : 'Create Camp'}
                </button>
            </form>
        </div>
    );
};

export default CampForm;