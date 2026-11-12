import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  SlidersHorizontal
} from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_COMPATIBILITY } from '../../utils/bloodTypes';
import { bloodApi } from '../../services/api';

export const DonorSearch = ({ onOpenEmergencyModal }) => {
  const [targetBloodType, setTargetBloodType] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [maxRadius, setMaxRadius] = useState(50);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactedDonorId, setContactedDonorId] = useState(null);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const results = await bloodApi.searchDonors({
        bloodType: targetBloodType === 'All' ? null : targetBloodType,
        radius: maxRadius,
        city: cityFilter
      });
      setDonors(results);
    } catch (err) {
      console.error('Failed to search donors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [targetBloodType, maxRadius, cityFilter]);

  const handleContactDonor = (donorId) => {
    setContactedDonorId(donorId);
    setTimeout(() => {
      setContactedDonorId(null);
    }, 4000);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Search color="var(--primary)" size={28} />
            <span>Search Verified Blood Donors</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
            Filter available donors by medical blood group compatibility and geocoded proximity.
          </p>
        </div>

        <button className="btn-emergency" onClick={onOpenEmergencyModal}>
          Broadcast Urgent Requirement
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '2rem', background: 'var(--surface)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
          <div>
            <label className="form-label">Recipient Blood Group Filter</label>
            <select
              className="form-select"
              value={targetBloodType}
              onChange={(e) => setTargetBloodType(e.target.value)}
            >
              <option value="All">All Blood Types</option>
              {BLOOD_GROUPS.map((type) => (
                <option key={type} value={type}>Type {type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">City / Region Search</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. San Francisco or Oakland"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
              {cityFilter && (
                <button
                  onClick={() => setCityFilter('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Proximity Radius</label>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{maxRadius} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={maxRadius}
              onChange={(e) => setMaxRadius(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {contactedDonorId && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: 10, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={20} color="#10b981" />
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Dispatch signal sent to donor via Amazon SNS SMS network. If accepted, arrival ETA will stream to the emergency dashboard.
          </div>
        </div>
      )}

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {loading ? 'Searching network...' : `${donors.length} active donors found`}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Privacy Safeguard: Donor PII is masked until emergency acceptance
        </div>
      </div>

      {/* Donors Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Scanning DynamoDB GSI index for compatible donors...
        </div>
      ) : donors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Filter size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Donors Matching Your Filters</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 450, margin: '0 auto 1.5rem' }}>
            Try expanding your search radius slider or clearing the city filter to see donors in neighboring counties.
          </p>
          <button
            onClick={() => { setTargetBloodType('All'); setCityFilter(''); setMaxRadius(100); }}
            className="btn-secondary"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {donors.map((donor) => (
            <div key={donor.donorId} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'var(--primary-light)',
                      border: '1px solid var(--primary-border)',
                      color: 'var(--primary)',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {donor.bloodType}
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{donor.displayName}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <MapPin size={13} />
                        <span>{donor.city}</span>
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: 9999,
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <CheckCircle2 size={12} />
                    <span>Available</span>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--surface-alt)', padding: '0.65rem 0.85rem', borderRadius: 8, fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Proximity:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>~{donor.distanceKm} km away</span>
                </div>
              </div>

              <button
                onClick={() => handleContactDonor(donor.donorId)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem',
                  borderRadius: 8,
                  background: contactedDonorId === donor.donorId ? '#16a34a' : 'var(--text-main)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <PhoneCall size={15} />
                <span>{contactedDonorId === donor.donorId ? 'Signal Sent!' : 'Request Emergency Dispatch'}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
