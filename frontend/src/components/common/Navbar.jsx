import React from 'react';
import { Droplet, AlertCircle, User, Building2 } from 'lucide-react';

export const Navbar = ({ currentView, onViewChange, onOpenEmergencyModal }) => {
  return (
    <header className="header">
      <div className="container nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div className="logo-group">
            <span style={{ fontSize: '1.6rem' }}>🩸</span>
            <span>SmartBlood</span>
            <span className="logo-badge">AWS Serverless</span>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-tab ${currentView === 'urgent' ? 'active' : ''}`}
              onClick={() => onViewChange('urgent')}
            >
              Emergency Feed
            </button>
            <button
              className={`nav-tab ${currentView === 'donor' ? 'active' : ''}`}
              onClick={() => onViewChange('donor')}
            >
              Donor Portal
            </button>
            <button
              className={`nav-tab ${currentView === 'hospital' ? 'active' : ''}`}
              onClick={() => onViewChange('hospital')}
            >
              Hospital Dashboard
            </button>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-emergency" onClick={onOpenEmergencyModal}>
            <AlertCircle size={18} />
            <span>Emergency Request</span>
          </button>
        </div>
      </div>
    </header>
  );
};

