import React, { useState, useEffect } from 'react';
import { campAPI } from '../services/api';
import '../styles/Lists.css';

const CampList = () => {
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [connectingCamp, setConnectingCamp] = useState(null);

    useEffect(() => {
        fetchCamps();
    }, []);

    const fetchCamps = async () => {
        try {
            const response = await campAPI.getAll();
            if (response.success) {
                setCamps(response.data);
            }
        } catch (err) {
            setError('Failed to fetch camps');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this camp?')) {
            try {
                await campAPI.delete(id);
                fetchCamps(); // Refresh the list
            } catch (err) {
                alert('Failed to delete camp');
            }
        }
    };

    const handleConnectCamps = async (campId) => {
        const targetCampId = prompt('Enter the ID of the camp to connect to:');

        if (!targetCampId) return;

        setConnectingCamp(campId);
        try {
            await campAPI.connect(campId, targetCampId);
            alert('Camps connected successfully!');
            fetchCamps();
        } catch (err) {
            alert(err.message || 'Failed to connect camps');
        } finally {
            setConnectingCamp(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusClass =
            status === 'Active'
                ? 'badge-success'
                : status === 'Full'
                    ? 'badge-danger'
                    : status === 'Emergency'
                        ? 'badge-warning'
                        : 'badge-secondary';
        return <span className={`badge ${statusClass}`}>{status}</span>;
    };

    const getOccupancyPercentage = (current, total) => {
        return ((current / total) * 100).toFixed(1);
    };

    const getOccupancyClass = (percentage) => {
        if (percentage >= 90) return 'occupancy-high';
        if (percentage >= 70) return 'occupancy-medium';
        return 'occupancy-low';
    };

    if (loading) return <div className="loading">Loading camps...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="list-container">
            <div className="list-header">
                <h2>Refugee Camps</h2>
                <p className="count">Total: {camps.length}</p>
            </div>

            {camps.length === 0 ? (
                <div className="empty-state">
                    <p>No camps created yet.</p>
                </div>
            ) : (
                <div className="cards-container">
                    {camps.map((camp) => {
                        const occupancyPercent = getOccupancyPercentage(camp.currentOccupancy, camp.capacity);
                        return (
                            <div key={camp._id} className="camp-card">
                                <div className="card-header">
                                    <h3>{camp.name}</h3>
                                    {getStatusBadge(camp.status)}
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="label">📍 Location:</span>
                                        <span className="value">{camp.address}</span>
                                    </div>

                                    <div className="info-row">
                                        <span className="label">📞 Contact:</span>
                                        <span className="value">{camp.contactNumber || 'N/A'}</span>
                                    </div>

                                    <div className="info-row">
                                        <span className="label">🏢 Managed By:</span>
                                        <span className="value">{camp.managedBy}</span>
                                    </div>

                                    <div className="info-row">
                                        <span className="label">📊 Occupancy:</span>
                                        <span className={`value ${getOccupancyClass(occupancyPercent)}`}>
                                            {camp.currentOccupancy} / {camp.capacity} ({occupancyPercent}%)
                                        </span>
                                    </div>

                                    <div className="progress-bar">
                                        <div
                                            className={`progress-fill ${getOccupancyClass(occupancyPercent)}`}
                                            style={{ width: `${occupancyPercent}%` }}
                                        ></div>
                                    </div>

                                    <div className="info-row">
                                        <span className="label">🗺️ Coordinates:</span>
                                        <span className="value">
                                            {camp.latitude.toFixed(4)}, {camp.longitude.toFixed(4)}
                                        </span>
                                    </div>

                                    <div className="resources">
                                        <h4>Resources:</h4>
                                        <div className="resource-grid">
                                            <div className="resource-item">
                                                <span className="resource-icon">🍽️</span>
                                                <span>Food: {camp.resources.food}</span>
                                            </div>
                                            <div className="resource-item">
                                                <span className="resource-icon">💧</span>
                                                <span>Water: {camp.resources.water}</span>
                                            </div>
                                            <div className="resource-item">
                                                <span className="resource-icon">⚕️</span>
                                                <span>Medical: {camp.resources.medical}</span>
                                            </div>
                                            <div className="resource-item">
                                                <span className="resource-icon">🏠</span>
                                                <span>Shelter: {camp.resources.shelter}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {camp.facilities && camp.facilities.length > 0 && (
                                        <div className="facilities">
                                            <h4>Facilities:</h4>
                                            <div className="facility-tags">
                                                {camp.facilities.map((facility, idx) => (
                                                    <span key={idx} className="facility-tag">
                                                        {facility}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {camp.connectedCamps && camp.connectedCamps.length > 0 && (
                                        <div className="connections">
                                            <h4>Connected to:</h4>
                                            {camp.connectedCamps.map((connected, idx) => (
                                                <span key={idx} className="connected-camp">
                                                    {connected.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="camp-id">
                                        <small>ID: {camp._id}</small>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <button
                                        className="btn-connect"
                                        onClick={() => handleConnectCamps(camp._id)}
                                        disabled={connectingCamp === camp._id}
                                    >
                                        {connectingCamp === camp._id ? 'Connecting...' : '🔗 Connect'}
                                    </button>
                                    <button className="btn-delete" onClick={() => handleDelete(camp._id)}>
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CampList;