import React, { useState } from 'react';
import { X, CheckCircle, Clock, Heart, AlertCircle, Navigation } from 'lucide-react';
import { bloodApi } from '../../services/api';

export const DonorResponseModal = ({ isOpen, request, onClose, onResponseSubmitted }) => {
  const [donorName, setDonorName] = useState('Marcus Vance');
  const [status, setStatus] = useState('ACCEPTED');
  const [etaMinutes, setEtaMinutes] = useState(20);
  const [notes, setNotes] = useState('Driving private vehicle via highway');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const responseData = await bloodApi.respondToRequest(request.requestId, {
        donorId: `d-user-${Date.now()}`,
        donorName,
        status,
        etaMinutes: Number(etaMinutes),
        notes
      });
      onResponseSubmitted(responseData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Heart color="var(--primary)" fill="var(--primary)" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Pledge Emergency Blood Donation</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* Request Recap */}
          <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>
              Dispatching to Healthcare Facility:
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '0.2rem' }}>
              {request.hospitalName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
              Required Blood: <strong>Type {request.bloodType}</strong> &bull; Need: <strong>{request.unitsNeeded} pint(s)</strong> &bull; Location: {request.city}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Full Name (Registered Donor) *</label>
            <input
              type="text"
              required
              className="form-input"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Response Commitment *</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ACCEPTED">ACCEPTED - In transit now</option>
              <option value="PLEDGED">PLEDGED - Arriving within 1 hour</option>
              <option value="DECLINED">DECLINED - Cannot donate right now</option>
            </select>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Estimated Arrival Time (ETA) *</label>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{etaMinutes} Minutes</span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={etaMinutes}
              onChange={(e) => setEtaMinutes(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
              {[15, 20, 30, 45, 60].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setEtaMinutes(mins)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.55rem',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: etaMinutes === mins ? 'var(--primary)' : 'var(--surface-subtle)',
                    color: etaMinutes === mins ? 'white' : 'var(--text-main)',
                    fontWeight: 700
                  }}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Transit / Coordination Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Taking subway / Driving with hazard lights"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.65rem 1.15rem', borderRadius: 8, border: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-emergency"
              style={{ padding: '0.65rem 1.35rem', fontSize: '0.9rem' }}
            >
              <CheckCircle size={16} />
              <span>{submitting ? 'Confirming with Hospital...' : 'Submit ETA to ER'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
