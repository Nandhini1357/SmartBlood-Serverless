import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Phone,
  Clock,
  Droplet,
  Users,
  RefreshCw,
  Send,
  CheckCircle2,
  Navigation,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { DonorResponseModal } from './DonorResponseModal';
import { bloodApi } from '../../services/api';

export const EmergencyDashboard = ({ requests, onRefresh, onOpenEmergencyModal }) => {
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [matchesMap, setMatchesMap] = useState({});
  const [loadingMatchesId, setLoadingMatchesId] = useState(null);
  const [activeResponseRequest, setActiveResponseRequest] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  const handleToggleMatches = async (requestId) => {
    if (selectedRequestId === requestId) {
      setSelectedRequestId(null);
      return;
    }

    setSelectedRequestId(requestId);

    // If matches not cached, fetch them
    if (!matchesMap[requestId]) {
      setLoadingMatchesId(requestId);
      try {
        const data = await bloodApi.getMatches(requestId, 50);
        setMatchesMap((prev) => ({ ...prev, [requestId]: data }));
      } catch (err) {
        console.error('Failed to get matches for request', err);
      } finally {
        setLoadingMatchesId(null);
      }
    }
  };

  const handleResponseSubmitted = (responseData) => {
    setSuccessToast(`Thank you! Your donation response of ${responseData.status} (ETA: ${responseData.etaMinutes}m) has been recorded.`);
    onRefresh();
    setTimeout(() => {
      setSuccessToast(null);
    }, 6000);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="pulse-indicator" style={{ width: 12, height: 12 }} />
            <span>Emergency Blood Broadcast Feed</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
            Real-time critical requests awaiting compatible donor dispatch & ETA fulfillment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={onRefresh} className="btn-secondary" title="Refresh Live Data">
            <RefreshCw size={16} />
            <span>Refresh Feed</span>
          </button>
          <button className="btn-emergency" onClick={onOpenEmergencyModal}>
            <AlertTriangle size={18} />
            <span>Broadcast Request</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: 10, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={20} color="#10b981" />
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{successToast}</div>
        </div>
      )}

      {/* Requests Feed */}
      {requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Active Emergencies</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 420, margin: '0 auto' }}>
            All hospital blood requests in the network have been safely fulfilled.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {requests.map((req) => {
            const isExpanded = selectedRequestId === req.requestId;
            const matchData = matchesMap[req.requestId];
            const isLoadingMatches = loadingMatchesId === req.requestId;

            return (
              <div
                key={req.requestId}
                className="card"
                style={{
                  borderLeft: req.urgencyLevel === 'CRITICAL' ? '5px solid var(--danger)' : req.urgencyLevel === 'URGENT' ? '5px solid var(--warning)' : '5px solid var(--border)',
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  {/* Left: Blood Icon & Details */}
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    <div style={{
                      width: 58,
                      height: 58,
                      borderRadius: 14,
                      background: 'var(--primary-light)',
                      border: '2px solid var(--primary-border)',
                      color: 'var(--primary)',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {req.bloodType}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{req.hospitalName}</h2>
                        <StatusBadge urgency={req.urgencyLevel} />
                        {req.responsesCount > 0 && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.55rem', borderRadius: 9999, border: '1px solid #bbf7d0' }}>
                            {req.responsesCount} Donor(s) Responded
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={14} /> {req.city}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Droplet size={14} color="var(--primary)" /> <strong>{req.unitsNeeded} units</strong> required
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={14} /> {req.contactPhone}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={14} /> {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleToggleMatches(req.requestId)}
                      className="btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.55rem 0.95rem' }}
                    >
                      <Users size={16} />
                      <span>{isExpanded ? 'Hide Matches' : 'Matched Donors'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <button
                      onClick={() => setActiveResponseRequest(req)}
                      className="btn-emergency"
                      style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
                    >
                      <Send size={15} />
                      <span>Respond as Donor</span>
                    </button>
                  </div>
                </div>

                {/* Responses list preview if any exist */}
                {req.responses && req.responses.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Navigation size={13} />
                      <span>Active Responders In Transit:</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {req.responses.map((resp, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.75rem',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 6,
                            color: '#166534',
                            fontWeight: 600
                          }}
                        >
                          {resp.donorName}: {resp.status} (ETA: {resp.etaMinutes}m)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expanded Matches Drawer */}
                {isExpanded && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Sparkles size={16} />
                        <span>Intelligent Serverless Matching Engine Results</span>
                      </h3>
                      {matchData && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {matchData.totalCompatibleDonorsFound} compatible donors within {matchData.searchRadiusKm} km
                        </span>
                      )}
                    </div>

                    {isLoadingMatches ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Evaluating medical compatibility matrix and calculating Haversine distances...
                      </div>
                    ) : matchData?.matches?.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                        {matchData.matches.map((m) => (
                          <div
                            key={m.donorId}
                            style={{
                              background: 'var(--surface-alt)',
                              border: '1px solid var(--border)',
                              borderRadius: 10,
                              padding: '0.85rem 1rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                                {m.displayName}
                                <span style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}>
                                  ({m.bloodType})
                                </span>
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                {m.distanceKm ? `~${m.distanceKm} km away` : 'Within area'} &bull; Match Score: {m.matchScore}%
                              </div>
                            </div>

                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.25rem 0.5rem',
                              borderRadius: 6,
                              background: m.isExactMatch ? '#dcfce7' : '#e0f2fe',
                              color: m.isExactMatch ? '#15803d' : '#0369a1'
                            }}>
                              {m.isExactMatch ? 'Exact Match' : 'Compatible'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        No direct donors found in the immediate search radius. Amazon SNS alert broadcast is fanning out across neighboring emergency responder groups.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Response Modal */}
      <DonorResponseModal
        isOpen={Boolean(activeResponseRequest)}
        request={activeResponseRequest}
        onClose={() => setActiveResponseRequest(null)}
        onResponseSubmitted={handleResponseSubmitted}
      />
    </div>
  );
};
