import React, { useState, useEffect } from 'react';
import { refugeeAPI, campAPI } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
    const [stats, setStats] = useState({
        totalRefugees: 0,
        assignedRefugees: 0,
        totalCamps: 0,
        activeCamps: 0,
        totalCapacity: 0,
        currentOccupancy: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [refugeeResponse, campResponse] = await Promise.all([
                refugeeAPI.getAll(),
                campAPI.getAll(),
            ]);

            if (refugeeResponse.success && campResponse.success) {
                const refugees = refugeeResponse.data;
                const camps = campResponse.data;

                const assignedCount = refugees.filter((r) => r.assignedCamp).length;
                const activeCampsCount = camps.filter((c) => c.status === 'Active').length;
                const totalCapacity = camps.reduce((sum, c) => sum + c.capacity, 0);
                const totalOccupancy = camps.reduce((sum, c) => sum + c.currentOccupancy, 0);

                setStats({
                    totalRefugees: refugees.length,
                    assignedRefugees: assignedCount,
                    totalCamps: camps.length,
                    activeCamps: activeCampsCount,
                    totalCapacity,
                    currentOccupancy: totalOccupancy,
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const occupancyPercentage = stats.totalCapacity > 0
        ? ((stats.currentOccupancy / stats.totalCapacity) * 100).toFixed(1)
        : 0;

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>🏕️ Disaster Management & Refugee Camp System</h1>
                <p>Real-time management of refugee records, safe zones, and resource allocation</p>
            </div>

            {loading ? (
                <div className="loading">Loading statistics...</div>
            ) : (
                <>
                    <div className="stats-grid">
                        <div className="stat-card blue">
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <h3>{stats.totalRefugees}</h3>
                                <p>Total Refugees</p>
                            </div>
                        </div>

                        <div className="stat-card green">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <h3>{stats.assignedRefugees}</h3>
                                <p>Assigned to Camps</p>
                            </div>
                        </div>

                        <div className="stat-card orange">
                            <div className="stat-icon">🏕️</div>
                            <div className="stat-content">
                                <h3>{stats.totalCamps}</h3>
                                <p>Total Camps</p>
                            </div>
                        </div>

                        <div className="stat-card purple">
                            <div className="stat-icon">🟢</div>
                            <div className="stat-content">
                                <h3>{stats.activeCamps}</h3>
                                <p>Active Camps</p>
                            </div>
                        </div>

                        <div className="stat-card teal">
                            <div className="stat-icon">📊</div>
                            <div className="stat-content">
                                <h3>{stats.totalCapacity}</h3>
                                <p>Total Capacity</p>
                            </div>
                        </div>

                        <div className="stat-card pink">
                            <div className="stat-icon">📈</div>
                            <div className="stat-content">
                                <h3>{occupancyPercentage}%</h3>
                                <p>Occupancy Rate</p>
                            </div>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <h2>Quick Actions</h2>
                        <div className="action-buttons">
                            <Link to="/register-refugee" className="action-btn primary">
                                ➕ Register New Refugee
                            </Link>
                            <Link to="/create-camp" className="action-btn secondary">
                                🏕️ Create New Camp
                            </Link>
                            <Link to="/refugees" className="action-btn info">
                                📋 View All Refugees
                            </Link>
                            <Link to="/camps" className="action-btn warning">
                                🏕️ View All Camps
                            </Link>
                        </div>
                    </div>

                    <div className="features-section">
                        <h2>System Features</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">🗺️</div>
                                <h3>Geocoding</h3>
                                <p>Automatic address to coordinates conversion</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">📍</div>
                                <h3>Nearest Camp Finder</h3>
                                <p>Assign refugees to closest available camps</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">📊</div>
                                <h3>Real-time Tracking</h3>
                                <p>Monitor camp occupancy and resources</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">🔗</div>
                                <h3>Camp Connections</h3>
                                <p>Link camps for resource sharing</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Home;