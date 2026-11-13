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
  Database,
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { isMockMode } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({
  currentView,
  onViewChange,
  onOpenEmergencyModal,
  onOpenAuthModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mockActive = isMockMode();
  const { user, isAuthenticated, logout } = useAuth();

  const handleTabClick = (viewName) => {
    onViewChange(viewName);
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container nav-container">
        {/* Brand */}
        <div className="logo-group" onClick={() => handleTabClick('landing')}>
          <span style={{ fontSize: '1.6rem' }}>🩸</span>
          <span style={{ color: 'var(--primary)' }}>SmartBlood</span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Cognito Auth Status / Action Button */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: 20,
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#334155'
                }}
                title={`Cognito Verified: ${user.email} (${user.role})`}
              >
                <ShieldCheck size={14} color="#059669" />
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.facilityName || user.email.split('@')[0]}
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    background: '#e2e8f0',
                    color: '#475569',
                    padding: '0.1rem 0.35rem',
                    borderRadius: 10
                  }}
                >
                  STAFF
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Sign out of Cognito session"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '0.45rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <UserCheck size={14} color="var(--primary)" />
              <span>Hospital Sign In</span>
            </button>
          )}

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
