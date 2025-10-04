import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import RefugeeForm from './components/RefugeeForm';
import CampForm from './components/CampForm';
import RefugeeList from './components/RefugeeList';
import CampList from './components/CampList';
import MapView from './components/MapView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register-refugee" element={<RefugeeForm />} />
            <Route path="/create-camp" element={<CampForm />} />
            <Route path="/refugees" element={<RefugeeList />} />
            <Route path="/camps" element={<CampList />} />
            <Route path="/map" element={<MapView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;