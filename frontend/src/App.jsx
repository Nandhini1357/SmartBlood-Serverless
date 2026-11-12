import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { EmergencyDashboard } from './components/emergency/EmergencyDashboard';
import { DonorSearch } from './components/search/DonorSearch';
import { DonorPortal } from './components/portal/DonorPortal';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { EmergencyRequestModal } from './components/emergency/EmergencyRequestModal';
import { bloodApi } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const data = await bloodApi.getBloodRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load blood requests', err);
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
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
