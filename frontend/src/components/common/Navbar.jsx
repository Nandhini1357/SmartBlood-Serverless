import React, { useState } from 'react';
import {
  AlertTriangle,
  Heart,
  Search,
  Building2,
  Activity,
  Home,
  Menu,
  X,
  Cloud,
  Database
} from 'lucide-react';
import { isMockMode } from '../../services/api';

export const Navbar = ({ currentView, onViewChange, onOpenEmergencyModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mockActive = isMockMode();

  const handleTabClick = (viewName) => {
    onViewChange(viewName);
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      {/* Mode Banner */}
      <div className={`env-banner ${mockActive ? 'mock' : 'live'}`}>
        {mockActive ? (
          <>
            <Database size={14} />
            <span>Local Mock Mode Active &bull; Interactive Fictional Bay Area Emergency Data</span>
          </>
        ) : (
          <>
            <Cloud size={14} />
            <span>AWS API Gateway & DynamoDB Connected</span>
          </>
        )}
      </div>

      <div className="container nav-container">
        {/* Brand */}
        <div className="logo-group" onClick={() => handleTabClick('landing')}>
          <span style={{ fontSize: '1.6rem' }}>🩸</span>
          <span style={{ color: 'var(--primary)' }}>SmartBlood</span>
          <span className="logo-badge">AWS Serverless</span>
        </div>

        {/* Desktop Navigation */}
        <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <button
            className={`nav-tab ${currentView === 'landing' ? 'active' : ''}`}
            onClick={() => handleTabClick('landing')}
          >
            <Home size={15} />
            <span>Home</span>
          </button>

          <button
            className={`nav-tab ${currentView === 'emergency' ? 'active' : ''}`}
            onClick={() => handleTabClick('emergency')}
          >
            <Activity size={15} />
            <span>Live Alerts</span>
          </button>

          <button
            className={`nav-tab ${currentView === 'search' ? 'active' : ''}`}
            onClick={() => handleTabClick('search')}
          >
            <Search size={15} />
            <span>Find Donors</span>
          </button>

          <button
            className={`nav-tab ${currentView === 'donor' ? 'active' : ''}`}
            onClick={() => handleTabClick('donor')}
          >
            <Heart size={15} />
            <span>Donor Portal</span>
          </button>

          <button
            className={`nav-tab ${currentView === 'hospital' ? 'active' : ''}`}
            onClick={() => handleTabClick('hospital')}
          >
            <Building2 size={15} />
            <span>Hospital Portal</span>
          </button>
        </nav>

        {/* Right CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-emergency" onClick={onOpenEmergencyModal}>
            <AlertTriangle size={17} />
            <span>Emergency Broadcast</span>
          </button>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};
