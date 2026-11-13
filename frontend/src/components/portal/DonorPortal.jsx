import React, { useState, useEffect } from 'react';
import {
  Heart,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { BLOOD_GROUPS, DONOR_CAN_DONATE_TO } from '../../utils/bloodTypes';
import { bloodApi } from '../../services/api';

const STORAGE_KEY = 'smartblood_active_donor';

export const DonorPortal = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodType: 'O-',
    city: '',
    latitude: 0,
    longitude: 0,
    isAvailable: true
  });

  const [activeDonor, setActiveDonor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load existing donor from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setActiveDonor(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load saved donor profile', e);
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const registered = await bloodApi.registerDonor(formData);
      setActiveDonor(registered);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registered));
      setStatusMessage('Registration complete! You are now enrolled in the emergency donor network.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!activeDonor) return;
    setToggling(true);
    setErrorMessage(null);

    const newStatus = !activeDonor.isAvailable;
    try {
      await bloodApi.updateDonorAvailability(activeDonor.donorId, newStatus);
      const updated = { ...activeDonor, isAvailable: newStatus };
      setActiveDonor(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setStatusMessage(
        newStatus
          ? 'Your status is now ACTIVE. You will receive urgent notifications for compatible nearby requests.'
          : 'Your status is now PAUSED. You will not receive emergency alerts until re-enabled.'
      );
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update availability');
    } finally {
      setToggling(false);
    }
  };

  const handleResetProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveDonor(null);
    setStatusMessage('Profile reset. You may register a new donor profile.');
  };

  const handleQuickCitySelect = (city, lat, lon) => {
    setFormData((prev) => ({
      ...prev,
      city,
      latitude: lat,
      longitude: lon
    }));
  };

  const recipients = activeDonor ? DONOR_CAN_DONATE_TO[activeDonor.bloodType] || [] : [];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Heart color="var(--primary)" fill="var(--primary)" size={28} />
          <span>Donor Portal & Readiness Control</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Manage your availability, geolocated alert radius, and review emergency responses.
        </p>
      </div>

      {statusMessage && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: 10, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle size={20} color="#10b981" />
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{statusMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '1rem', borderRadius: 10, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="#dc2626" />
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{errorMessage}</div>
        </div>
      )}

      {/* ACTIVE DONOR PROFILE VIEW */}
      {activeDonor ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Bar */}
          <div className="card" style={{
            background: activeDonor.isAvailable ? '#f0fdf4' : '#f8fafc',
            border: activeDonor.isAvailable ? '2px solid #86efac' : '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: activeDonor.isAvailable ? '#16a34a' : '#94a3b8'
                  }} />
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: activeDonor.isAvailable ? '#15803d' : 'var(--text-muted)' }}>
                    {activeDonor.isAvailable ? 'Available for Emergency Dispatch' : 'Currently Unavailable / Paused'}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {activeDonor.isAvailable
                    ? 'You are active in the DynamoDB GSI index. Hospitals with matching blood emergencies in your area can reach you.'
                    : 'Emergency matching is paused for your profile. Toggle on when you are ready to donate.'}
                </p>
              </div>

              <button
                onClick={handleToggleAvailability}
                disabled={toggling}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  background: activeDonor.isAvailable ? '#dc2626' : '#16a34a',
                  color: 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                {activeDonor.isAvailable ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                <span>{toggling ? 'Updating...' : activeDonor.isAvailable ? 'Pause My Status' : 'Set Available'}</span>
              </button>
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'var(--primary-light)',
                  border: '2px solid var(--primary-border)',
                  color: 'var(--primary)',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {activeDonor.bloodType}
                </div>

                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{activeDonor.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} /> {activeDonor.city}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <ShieldCheck size={14} color="#16a34a" /> Verified Donor ID: {activeDonor.donorId.slice(0, 12)}...
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleResetProfile}
                style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
              >
                Switch / Register Different Donor
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Contact Phone (SNS Alerts)
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={14} color="var(--primary)" />
                  <span>{activeDonor.phone}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Email Address
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={14} color="var(--primary)" />
                  <span>{activeDonor.email}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  GPS Coordinates
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
                  {activeDonor.location?.latitude || activeDonor.latitude}, {activeDonor.location?.longitude || activeDonor.longitude}
                </div>
              </div>
            </div>

            {/* Recipients Help Badge */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface-alt)', borderRadius: 10 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Your Blood Group ({activeDonor.bloodType}) Can Save Patients With:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {recipients.map((type) => (
                  <span
                    key={type}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 6,
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: 'var(--primary)'
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* REGISTRATION FORM VIEW */
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Join the SmartBlood Emergency Network</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Enroll to receive immediate, targeted emergency SMS alerts when a compatible life is at risk nearby.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Marcus Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Blood Type *</label>
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Phone (Emergency SMS) *</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Primary City / Region *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. New Delhi, Mumbai, or Bengaluru"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-input"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-input"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="availCheck"
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                />
                <label htmlFor="availCheck" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                  Set my readiness status as available immediately upon registration
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="consentCheck"
                  required
                  defaultChecked
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)', marginTop: '0.15rem' }}
                />
                <label htmlFor="consentCheck" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--text-main)' }}>Emergency Notification Consent:</strong> I agree to receive urgent SMS notifications via Amazon SNS when a verified hospital in my region requests compatible blood. I understand I can pause or revoke alerts at any time via this portal.
                </label>
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-emergency"
                style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
              >
                <UserCheck size={18} />
                <span>{loading ? 'Registering with DynamoDB...' : 'Complete Donor Registration'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

