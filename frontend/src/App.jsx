import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LiveUrgentFeed } from './components/emergency/LiveUrgentFeed';
import { DonorDashboard } from './components/dashboard/DonorDashboard';
import { HospitalDashboard } from './components/dashboard/HospitalDashboard';
import { EmergencyRequestModal } from './components/emergency/EmergencyRequestModal';
import { bloodApi } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState('urgent');
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
    setCurrentView('urgent');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenEmergencyModal={() => setIsModalOpen(true)}
      />

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', padding: '0.25rem 0.75rem', borderRadius: 9999, border: '1px solid rgba(239, 68, 68, 0.4)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            <span>⚡ AWS Weekend Challenge – No Pipeline, No Problem</span>
          </div>
          <h1 className="hero-title">
            Intelligent Serverless Blood Donation Network
          </h1>
          <p className="hero-subtitle">
            Connecting critical hospital emergencies to compatible nearby donors in seconds using AWS Lambda, Amazon DynamoDB, Amazon SNS, and API Gateway.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="container" style={{ flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading network telemetry...
          </div>
        ) : (
          <>
            {currentView === 'urgent' && (
              <LiveUrgentFeed
                requests={requests}
                onRequestUpdated={fetchRequests}
              />
            )}
            {currentView === 'donor' && <DonorDashboard />}
            {currentView === 'hospital' && (
              <HospitalDashboard onOpenEmergencyModal={() => setIsModalOpen(true)} />
            )}
          </>
        )}
      </main>

      {/* Emergency Request Modal */}
      <EmergencyRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestCreated={handleRequestCreated}
      />

      <Footer />
    </div>
  );
}

export default App;

