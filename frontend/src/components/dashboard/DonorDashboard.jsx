import React, { useState } from 'react';
import { UserCheck, Heart, MapPin, Phone, Bell, ShieldCheck } from 'lucide-react';
import { BLOOD_GROUPS } from '../../utils/bloodTypes';
import { bloodApi } from '../../services/api';

export const DonorDashboard = () => {
  const [donorForm, setDonorForm] = useState({
    name: 'Jane Foster',
    email: 'jane.foster@example.com',
    phone: '+1 (555) 321-9988',
    bloodType: 'O-',
    city: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    isAvailable: true
  });
  const [registered, setRegistered] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bloodApi.registerDonor(donorForm);
      setRegistered(true);
    } catch (err) {
      console.error('Registration error', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart color="#dc2626" fill="#dc2626" size={24} />
              <span>Donor Registration & Availability</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Join the SmartBlood immediate response network powered by AWS Lambda & DynamoDB
            </p>
          </div>
        </div>

        {registered && (
          <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={20} />
            <div>
              <strong>Registration confirmed!</strong> You will receive SMS alerts via Amazon SNS when a critical blood request matches your blood type in your area.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={donorForm.name}
                onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Type</label>
              <select
                className="form-select"
                value={donorForm.bloodType}
                onChange={(e) => setDonorForm({ ...donorForm, bloodType: e.target.value })}
              >
                {BLOOD_GROUPS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address (Cognito Verified)</label>
              <input
                type="email"
                required
                className="form-input"
                value={donorForm.email}
                onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (SNS SMS Alerts)</label>
              <input
                type="tel"
                required
                className="form-input"
                value={donorForm.phone}
                onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">City / Current Location</label>
            <input
              type="text"
              required
              className="form-input"
              value={donorForm.city}
              onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--surface-alt)', borderRadius: 8, marginTop: '1rem' }}>
            <input
              type="checkbox"
              id="availCheckbox"
              style={{ width: 18, height: 18 }}
              checked={donorForm.isAvailable}
              onChange={(e) => setDonorForm({ ...donorForm, isAvailable: e.target.checked })}
            />
            <label htmlFor="availCheckbox" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              I am currently available to donate blood immediately in emergency situations
            </label>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: 'var(--primary)',
                color: 'white',
                fontWeight: 700,
                padding: '0.75rem 1.5rem',
                borderRadius: 8
              }}
            >
              {saving ? 'Saving...' : 'Save Donor Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
