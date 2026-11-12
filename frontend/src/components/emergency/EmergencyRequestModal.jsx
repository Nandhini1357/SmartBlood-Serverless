import React, { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import { BLOOD_GROUPS, URGENCY_LEVELS } from '../../utils/bloodTypes';
import { bloodApi } from '../../services/api';

export const EmergencyRequestModal = ({ isOpen, onClose, onRequestCreated }) => {
  const [formData, setFormData] = useState({
    requesterName: '',
    hospitalName: '',
    bloodType: 'O-',
    unitsNeeded: 2,
    urgencyLevel: 'CRITICAL',
    city: 'San Francisco, CA',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle color="#dc2626" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Dispatch Emergency Blood Request</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Hospital / Healthcare Facility *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Metro Trauma Center"
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
              <label className="form-label">Units Needed (Pints) *</label>
              <input
                type="number"
                min="1"
                max="20"
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
              <label className="form-label">Requester Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Dr. Johnson / ER Nurse"
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
                placeholder="+1 (555) 000-0000"
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
              placeholder="e.g. San Francisco, CA"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid var(--border)', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-emergency"
              style={{ padding: '0.6rem 1.25rem' }}
            >
              <Send size={16} />
              <span>{submitting ? 'Broadcasting SNS Alert...' : 'Broadcast Emergency'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
