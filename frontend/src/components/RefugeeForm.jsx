import React, { useState } from 'react';
import { assignmentAPI } from '../services/api';
import '../styles/Forms.css';

const RefugeeForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        contactNumber: '',
        address: '',
        medicalConditions: '',
        familyMembers: 1,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await assignmentAPI.registerAndAssign(formData);

            if (response.success) {
                setMessage({
                    type: 'success',
                    text: `Refugee registered successfully! ${response.data.camp
                        ? `Assigned to ${response.data.camp.name} (${response.data.distance} km away)`
                        : 'No available camps found.'
                        }`,
                });

                // Reset form
                setFormData({
                    name: '',
                    age: '',
                    gender: 'Male',
                    contactNumber: '',
                    address: '',
                    medicalConditions: '',
                    familyMembers: 1,
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to register refugee',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Register Refugee</h2>
            <p className="form-subtitle">
                Enter refugee details. Address will be auto-geocoded and assigned to nearest camp.
            </p>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter full name"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="age">Age *</label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            required
                            min="0"
                            max="120"
                            placeholder="Age"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender">Gender *</label>
                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
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

                <div className="form-group">
                    <label htmlFor="address">Address *</label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows="3"
                        placeholder="Enter full address (City, State, Country)"
                    />
                    <small>Example: Bandra West, Mumbai, Maharashtra, India</small>
                </div>

                <div className="form-group">
                    <label htmlFor="familyMembers">Number of Family Members *</label>
                    <input
                        type="number"
                        id="familyMembers"
                        name="familyMembers"
                        value={formData.familyMembers}
                        onChange={handleChange}
                        required
                        min="1"
                        max="50"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="medicalConditions">Medical Conditions</label>
                    <textarea
                        id="medicalConditions"
                        name="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={handleChange}
                        rows="3"
                        placeholder="List any medical conditions (optional)"
                    />
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register & Assign to Camp'}
                </button>
            </form>
        </div>
    );
};

export default RefugeeForm;