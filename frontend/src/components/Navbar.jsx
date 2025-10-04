import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    🏕️ Refugee Management
                </Link>
                <ul className="navbar-menu">
                    <li className="navbar-item">
                        <Link to="/" className="navbar-link">Home</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/register-refugee" className="navbar-link">Register Refugee</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/create-camp" className="navbar-link">Create Camp</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/refugees" className="navbar-link">Refugees</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/camps" className="navbar-link">Camps</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/map" className="navbar-link">🗺️ Map</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;