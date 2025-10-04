import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { refugeeAPI, campAPI } from '../services/api';
import 'leaflet/dist/leaflet.css';
import '../styles/MapView.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const campIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const refugeeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const assignedRefugeeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MapView = () => {
    const [camps, setCamps] = useState([]);
    const [refugees, setRefugees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCamps, setShowCamps] = useState(true);
    const [showRefugees, setShowRefugees] = useState(true);
    const [showConnections, setShowConnections] = useState(true);
    const [showAssignments, setShowAssignments] = useState(true);

    // Default center (India - you can change this)
    const defaultCenter = [20.5937, 78.9629];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [campResponse, refugeeResponse] = await Promise.all([
                campAPI.getAll(),
                refugeeAPI.getAll(),
            ]);

            if (campResponse.success) {
                setCamps(campResponse.data);
            }
            if (refugeeResponse.success) {
                setRefugees(refugeeResponse.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate map center based on data
    const getMapCenter = () => {
        const allPoints = [
            ...camps.map(c => [c.latitude, c.longitude]),
            ...refugees.map(r => [r.latitude, r.longitude])
        ];

        if (allPoints.length === 0) return defaultCenter;

        const avgLat = allPoints.reduce((sum, p) => sum + p[0], 0) / allPoints.length;
        const avgLng = allPoints.reduce((sum, p) => sum + p[1], 0) / allPoints.length;

        return [avgLat, avgLng];
    };

    // Get connections between camps
    const getCampConnections = () => {
        const connections = [];
        camps.forEach(camp => {
            if (camp.connectedCamps && camp.connectedCamps.length > 0) {
                camp.connectedCamps.forEach(connectedId => {
                    const connectedCamp = camps.find(c => c._id === connectedId._id || c._id === connectedId);
                    if (connectedCamp) {
                        connections.push({
                            from: [camp.latitude, camp.longitude],
                            to: [connectedCamp.latitude, connectedCamp.longitude],
                            camps: [camp.name, connectedCamp.name]
                        });
                    }
                });
            }
        });
        return connections;
    };

    // Get assignments (refugee to camp)
    const getAssignments = () => {
        return refugees
            .filter(r => r.assignedCamp && r.assignedCamp._id)
            .map(refugee => {
                const camp = camps.find(c => c._id === refugee.assignedCamp._id);
                if (camp) {
                    return {
                        from: [refugee.latitude, refugee.longitude],
                        to: [camp.latitude, camp.longitude],
                        refugee: refugee.name,
                        camp: camp.name
                    };
                }
                return null;
            })
            .filter(Boolean);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return '#28a745';
            case 'Full': return '#dc3545';
            case 'Emergency': return '#ffc107';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return <div className="loading">Loading map data...</div>;
    }

    const mapCenter = getMapCenter();
    const connections = getCampConnections();
    const assignments = getAssignments();

    return (
        <div className="map-view-container">
            <div className="map-controls">
                <h2>🗺️ Interactive Map View</h2>
                <div className="control-buttons">
                    <button
                        className={`control-btn ${showCamps ? 'active' : ''}`}
                        onClick={() => setShowCamps(!showCamps)}
                    >
                        🏕️ Camps ({camps.length})
                    </button>
                    <button
                        className={`control-btn ${showRefugees ? 'active' : ''}`}
                        onClick={() => setShowRefugees(!showRefugees)}
                    >
                        👤 Refugees ({refugees.length})
                    </button>
                    <button
                        className={`control-btn ${showConnections ? 'active' : ''}`}
                        onClick={() => setShowConnections(!showConnections)}
                    >
                        🔗 Connections ({connections.length})
                    </button>
                    <button
                        className={`control-btn ${showAssignments ? 'active' : ''}`}
                        onClick={() => setShowAssignments(!showAssignments)}
                    >
                        📍 Assignments ({assignments.length})
                    </button>
                    <button className="control-btn refresh" onClick={fetchData}>
                        🔄 Refresh
                    </button>
                </div>

                <div className="map-legend">
                    <div className="legend-item">
                        <span className="legend-icon green">🏕️</span>
                        <span>Camp</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-icon blue">👤</span>
                        <span>Unassigned Refugee</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-icon orange">👤</span>
                        <span>Assigned Refugee</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-line green"></span>
                        <span>Camp Connection</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-line orange"></span>
                        <span>Assignment Route</span>
                    </div>
                </div>
            </div>

            <MapContainer
                center={mapCenter}
                zoom={6}
                className="leaflet-map"
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Camp Markers */}
                {showCamps && camps.map((camp) => (
                    <React.Fragment key={camp._id}>
                        <Marker
                            position={[camp.latitude, camp.longitude]}
                            icon={campIcon}
                        >
                            <Popup>
                                <div className="popup-content">
                                    <h3>🏕️ {camp.name}</h3>
                                    <p><strong>Status:</strong> <span style={{ color: getStatusColor(camp.status) }}>{camp.status}</span></p>
                                    <p><strong>Address:</strong> {camp.address}</p>
                                    <p><strong>Occupancy:</strong> {camp.currentOccupancy} / {camp.capacity}</p>
                                    <p><strong>Managed By:</strong> {camp.managedBy}</p>
                                    <div className="popup-resources">
                                        <p><strong>Resources:</strong></p>
                                        <ul>
                                            <li>🍽️ Food: {camp.resources.food}</li>
                                            <li>💧 Water: {camp.resources.water}</li>
                                            <li>⚕️ Medical: {camp.resources.medical}</li>
                                            <li>🏠 Shelter: {camp.resources.shelter}</li>
                                        </ul>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                        {/* Camp radius circle */}
                        <Circle
                            center={[camp.latitude, camp.longitude]}
                            radius={5000} // 5km radius
                            pathOptions={{
                                color: getStatusColor(camp.status),
                                fillColor: getStatusColor(camp.status),
                                fillOpacity: 0.1
                            }}
                        />
                    </React.Fragment>
                ))}

                {/* Refugee Markers */}
                {showRefugees && refugees.map((refugee) => (
                    <Marker
                        key={refugee._id}
                        position={[refugee.latitude, refugee.longitude]}
                        icon={refugee.assignedCamp ? assignedRefugeeIcon : refugeeIcon}
                    >
                        <Popup>
                            <div className="popup-content">
                                <h3>👤 {refugee.name}</h3>
                                <p><strong>Age:</strong> {refugee.age}</p>
                                <p><strong>Gender:</strong> {refugee.gender}</p>
                                <p><strong>Family Members:</strong> {refugee.familyMembers}</p>
                                <p><strong>Status:</strong> {refugee.status}</p>
                                {refugee.assignedCamp && (
                                    <p><strong>Assigned Camp:</strong> {refugee.assignedCamp.name}</p>
                                )}
                                <p><strong>Medical:</strong> {refugee.medicalConditions || 'None'}</p>
                                <p><strong>Contact:</strong> {refugee.contactNumber || 'N/A'}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Camp Connections */}
                {showConnections && connections.map((connection, idx) => (
                    <Polyline
                        key={`connection-${idx}`}
                        positions={[connection.from, connection.to]}
                        pathOptions={{
                            color: '#28a745',
                            weight: 3,
                            opacity: 0.7,
                            dashArray: '10, 10'
                        }}
                    >
                        <Popup>
                            <div className="popup-content">
                                <h4>🔗 Camp Connection</h4>
                                <p>{connection.camps[0]} ↔️ {connection.camps[1]}</p>
                            </div>
                        </Popup>
                    </Polyline>
                ))}

                {/* Assignment Routes */}
                {showAssignments && assignments.map((assignment, idx) => (
                    <Polyline
                        key={`assignment-${idx}`}
                        positions={[assignment.from, assignment.to]}
                        pathOptions={{
                            color: '#fd7e14',
                            weight: 2,
                            opacity: 0.6
                        }}
                    >
                        <Popup>
                            <div className="popup-content">
                                <h4>📍 Assignment</h4>
                                <p><strong>Refugee:</strong> {assignment.refugee}</p>
                                <p><strong>Assigned to:</strong> {assignment.camp}</p>
                            </div>
                        </Popup>
                    </Polyline>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;