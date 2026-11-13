import React, { useState } from 'react';
import { X, Send, AlertTriangle, Building2, ShieldAlert } from 'lucide-react';
import { BLOOD_GROUPS, URGENCY_LEVELS } from '../../utils/bloodTypes';
import { bloodApi, isMockMode } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const EmergencyRequestModal = ({ isOpen, onClose, onRequestCreated, onOpenAuthModal }) => {
  const { isAuthenticated, user } = useAuth();
  const mockActive = isMockMode();

  const [formData, setFormData] = useState({
    requesterName: '',
    hospitalName: user?.facilityName || '',
    bloodType: 'O-',
    unitsNeeded: 2,
    urgencyLevel: 'CRITICAL',
    city: '',
    latitude: 0,
    longitude: 0,
    contactPhone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const created = await bloodApi.createBloodRequest(formData);
      onRequestCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle color="var(--primary)" size={24} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Broadcast Emergency Blood Shortage</h3>
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

          {!mockActive && !isAuthenticated ? (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9a3412', fontSize: '0.83rem' }}>
                <ShieldAlert size={18} color="#c2410c" />
                <span>
                  <strong>Sign-In Required:</strong> Broadcasting to AWS SNS and DynamoDB requires a verified hospital staff Cognito token.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuthModal?.();
                }}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Sign In
              </button>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.6rem 0.8rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🔒</span>
              <span>
                <strong>Authenticated Action:</strong> Creating emergency dispatches is restricted to verified <strong>Hospital Personnel</strong> (Cognito JWT Protected).
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Hospital / Healthcare Facility *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. AIIMS New Delhi or Apollo Hospitals"
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Required Blood Type *</label>
              <select
                className="form-select"
                value={formData.bloodType}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
              >
                {BLOOD_GROUPS.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Units Needed (Units) *</label>
              <input
                type="number"
                min="1"
                max="50"
                required
                className="form-input"
                value={formData.unitsNeeded}
                onChange={(e) => setFormData({ ...formData, unitsNeeded: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Urgency Level *</label>
            <select
              className="form-select"
              value={formData.urgencyLevel}
              onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
            >
              {URGENCY_LEVELS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Requester Name / Title *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Dr. Sharma / Duty Medical Officer"
                value={formData.requesterName}
                onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Direct Contact Phone *</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">City / Region *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. New Delhi, DL or Mumbai, MH"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#9f1239' }}>
            ⚡ <strong>Serverless Trigger:</strong> Submitting will publish this event to the <code>SmartBlood-EmergencyAlerts</code> Amazon SNS topic and initiate real-time matching.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.65rem 1.15rem', borderRadius: 8, border: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (!mockActive && !isAuthenticated)}
              className="btn-emergency"
              style={{
                padding: '0.65rem 1.35rem',
                fontSize: '0.9rem',
                opacity: (!mockActive && !isAuthenticated) ? 0.6 : 1,
                cursor: (!mockActive && !isAuthenticated) ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={16} />
              <span>{submitting ? 'Broadcasting via SNS...' : 'Broadcast Emergency'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
