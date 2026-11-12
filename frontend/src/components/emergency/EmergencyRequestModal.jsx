import React, { useState } from 'react';
import { X, Send, AlertTriangle, Building2 } from 'lucide-react';
import { BLOOD_GROUPS, URGENCY_LEVELS } from '../../utils/bloodTypes';
import { bloodApi } from '../../services/api';

const HOSPITAL_PRESETS = [
  {
    name: 'San Francisco General Trauma Center',
    city: 'San Francisco, CA',
    lat: 37.7558,
    lon: -122.4047,
    phone: '+1 (555) 890-1234'
  },
  {
    name: 'Highland Hospital Acute Care',
    city: 'Oakland, CA',
    lat: 37.7997,
    lon: -122.2312,
    phone: '+1 (555) 789-5678'
  },
  {
    name: 'Stanford University Medical Center',
    city: 'Palo Alto, CA',
    lat: 37.4336,
    lon: -122.1742,
    phone: '+1 (555) 678-9012'
  }
];

export const EmergencyRequestModal = ({ isOpen, onClose, onRequestCreated }) => {
  const [formData, setFormData] = useState({
    requesterName: 'Dr. Sarah Adams',
    hospitalName: 'San Francisco General Trauma Center',
    bloodType: 'O-',
    unitsNeeded: 3,
    urgencyLevel: 'CRITICAL',
    city: 'San Francisco, CA',
    latitude: 37.7558,
    longitude: -122.4047,
    contactPhone: '+1 (555) 890-1234'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      hospitalName: preset.name,
      city: preset.city,
      latitude: preset.lat,
      longitude: preset.lon,
      contactPhone: preset.phone
    }));
  };

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

          {/* Presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Quick Hospital Presets:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              {HOSPITAL_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.55rem',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: formData.hospitalName === p.name ? 'var(--primary-light)' : 'var(--surface-subtle)',
                    color: formData.hospitalName === p.name ? 'var(--primary-dark)' : 'var(--text-main)',
                    fontWeight: formData.hospitalName === p.name ? 700 : 500
                  }}
                >
                  {p.name.split(' ')[0]} ({p.city.split(',')[0]})
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hospital / Healthcare Facility *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. San Francisco General Trauma"
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
              disabled={submitting}
              className="btn-emergency"
              style={{ padding: '0.65rem 1.35rem', fontSize: '0.9rem' }}
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
