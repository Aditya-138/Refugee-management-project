import React, { useState, useEffect } from 'react';
import { refugeeAPI, assignmentAPI } from '../services/api';
import '../styles/Lists.css';

const RefugeeList = () => {
    const [refugees, setRefugees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assigningId, setAssigningId] = useState(null);

    useEffect(() => {
        fetchRefugees();
    }, []);

    const fetchRefugees = async () => {
        try {
            const response = await refugeeAPI.getAll();
            if (response.success) {
                setRefugees(response.data);
            }
        } catch (err) {
            setError('Failed to fetch refugees');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignToCamp = async (refugeeId) => {
        setAssigningId(refugeeId);
        try {
            const response = await assignmentAPI.assignRefugee(refugeeId);
            if (response.success) {
                alert(
                    `Refugee assigned to ${response.data.camp.name} (${response.data.distance} km away)`
                );
                fetchRefugees(); // Refresh the list
            }
        } catch (err) {
            alert(err.message || 'Failed to assign refugee');
        } finally {
            setAssigningId(null);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this refugee?')) {
            try {
                await refugeeAPI.delete(id);
                fetchRefugees(); // Refresh the list
            } catch (err) {
                alert('Failed to delete refugee');
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusClass =
            status === 'Assigned'
                ? 'badge-success'
                : status === 'Pending'
                    ? 'badge-warning'
                    : 'badge-info';
        return <span className={`badge ${statusClass}`}>{status}</span>;
    };

    if (loading) return <div className="loading">Loading refugees...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="list-container">
            <div className="list-header">
                <h2>Registered Refugees</h2>
                <p className="count">Total: {refugees.length}</p>
            </div>

            {refugees.length === 0 ? (
                <div className="empty-state">
                    <p>No refugees registered yet.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Age</th>
                                <th>Gender</th>
                                <th>Contact</th>
                                <th>Address</th>
                                <th>Family</th>
                                <th>Status</th>
                                <th>Assigned Camp</th>
                                <th>Medical</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refugees.map((refugee) => (
                                <tr key={refugee._id}>
                                    <td>
                                        <strong>{refugee.name}</strong>
                                    </td>
                                    <td>{refugee.age}</td>
                                    <td>{refugee.gender}</td>
                                    <td>{refugee.contactNumber || 'N/A'}</td>
                                    <td className="address-cell" title={refugee.address}>
                                        {refugee.address.substring(0, 40)}...
                                    </td>
                                    <td>{refugee.familyMembers}</td>
                                    <td>{getStatusBadge(refugee.status)}</td>
                                    <td>
                                        {refugee.assignedCamp ? (
                                            <span className="camp-name">{refugee.assignedCamp.name}</span>
                                        ) : (
                                            <span className="not-assigned">Not Assigned</span>
                                        )}
                                    </td>
                                    <td>{refugee.medicalConditions || 'None'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {!refugee.assignedCamp && (
                                                <button
                                                    className="btn-assign"
                                                    onClick={() => handleAssignToCamp(refugee._id)}
                                                    disabled={assigningId === refugee._id}
                                                >
                                                    {assigningId === refugee._id ? 'Assigning...' : 'Assign'}
                                                </button>
                                            )}
                                            <button className="btn-delete" onClick={() => handleDelete(refugee._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RefugeeList;