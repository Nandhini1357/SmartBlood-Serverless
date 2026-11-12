import React, { useState } from 'react';
import { Droplet, MapPin, Phone, Users, Clock, CheckCircle } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { bloodApi } from '../../services/api';

export const LiveUrgentFeed = ({ requests, onRequestUpdated }) => {
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [matches, setMatches] = useState(null);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const handleViewMatches = async (requestId) => {
    if (selectedRequestId === requestId) {
      setSelectedRequestId(null);
      setMatches(null);
      return;
    }

    setSelectedRequestId(requestId);
    setLoadingMatches(true);
    try {
      const matchData = await bloodApi.getMatches(requestId);
      setMatches(matchData);
    } catch (err) {
      console.error('Failed to load matches', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Live Emergency Blood Feed</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Real-time critical requests awaiting compatible donor dispatch
          </p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></span>
          <span>Live WebSocket / Polling Active</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {requests.map((req) => (
          <div key={req.requestId} className="card" style={{ transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--primary-border)'
                }}>
                  {req.bloodType}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{req.hospitalName}</h3>
                    <StatusBadge urgency={req.urgencyLevel} />
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} /> {req.city}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Droplet size={14} /> {req.unitsNeeded} unit(s) required
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Phone size={14} /> {req.contactPhone}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} /> {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleViewMatches(req.requestId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.9rem',
                    borderRadius: 8,
                    background: selectedRequestId === req.requestId ? 'var(--text-main)' : 'var(--surface-alt)',
                    color: selectedRequestId === req.requestId ? 'white' : 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    border: '1px solid var(--border)'
                  }}
                >
                  <Users size={16} />
                  <span>{selectedRequestId === req.requestId ? 'Hide Matches' : 'Find Donors'}</span>
                </button>
              </div>
            </div>

            {/* Smart Matching Drawer */}
            {selectedRequestId === req.requestId && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                    ⚡ Intelligent Serverless Matcher Results
                  </h4>
                  {matches && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {matches.totalCompatibleDonorsFound} compatible donors within 50 km
                    </span>
                  )}
                </div>

                {loadingMatches ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Computing geospatial proximity and blood group compatibility matrix...
                  </div>
                ) : matches?.matches?.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                    {matches.matches.map((donor) => (
                      <div
                        key={donor.donorId}
                        style={{
                          background: 'var(--surface-alt)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {donor.name}
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>
                              ({donor.bloodType})
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {donor.distanceKm ? `${donor.distanceKm} km away` : 'Within area'} &bull; Match: {donor.matchScore}%
                          </div>
                        </div>

                        <button
                          style={{
                            background: '#22c55e',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.35rem 0.65rem',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <CheckCircle size={13} />
                          <span>Dispatch</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No immediate donors found within radius. Emergency alert dispatched to SNS subscriber network.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

