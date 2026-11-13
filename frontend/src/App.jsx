import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { EmergencyDashboard } from './components/emergency/EmergencyDashboard';
import { DonorSearch } from './components/search/DonorSearch';
import { DonorPortal } from './components/portal/DonorPortal';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { EmergencyRequestModal } from './components/emergency/EmergencyRequestModal';
import { AuthModal } from './components/auth/AuthModal';
import { bloodApi } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await bloodApi.getBloodRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load blood requests', err);
      setApiError(err.message || 'Failed to connect to SmartBlood API Gateway.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestCreated = (newRequest) => {
    setRequests((prev) => [newRequest, ...prev]);
    setCurrentView('emergency');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenEmergencyModal={() => setIsModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={setCurrentView}
            onOpenEmergencyModal={() => setIsModalOpen(true)}
          />
        )}

        <div className="container" style={{ paddingTop: '2rem' }}>
          {apiError && (
            <div
              style={{
                backgroundColor: '#fff5f5',
                color: '#c53030',
                border: '1px solid #feb2b2',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div>
                <strong>⚠️ Live API Communication Error:</strong>
                <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{apiError}</div>
              </div>
              <button
                type="button"
                onClick={fetchRequests}
                style={{
                  background: '#c53030',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              Loading SmartBlood network telemetry...
            </div>
          ) : (
            <>
              {currentView === 'emergency' && (
                <EmergencyDashboard
                  requests={requests}
                  onRefresh={fetchRequests}
                  onOpenEmergencyModal={() => setIsModalOpen(true)}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              )}

              {currentView === 'search' && (
                <DonorSearch
                  onOpenEmergencyModal={() => setIsModalOpen(true)}
                />
              )}

              {currentView === 'donor' && <DonorPortal />}

              {currentView === 'hospital' && (
                <HospitalDashboard
                  requests={requests}
                  onOpenEmergencyModal={() => setIsModalOpen(true)}
                  onRefreshRequests={fetchRequests}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Global Emergency Modal */}
      <EmergencyRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestCreated={handleRequestCreated}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Hospital Staff Cognito Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
