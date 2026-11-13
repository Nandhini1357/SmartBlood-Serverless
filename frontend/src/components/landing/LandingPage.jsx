import React, { useState } from 'react';
import {
  Heart,
  AlertTriangle,
  Users,
  Search,
  Activity,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Building2,
  MapPin
} from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_COMPATIBILITY, DONOR_CAN_DONATE_TO } from '../../utils/bloodTypes';

export const LandingPage = ({ onNavigate, onOpenEmergencyModal }) => {
  const [selectedBloodType, setSelectedBloodType] = useState('O-');

  const compatibleDonors = BLOOD_COMPATIBILITY[selectedBloodType] || [];
  const canGiveTo = DONOR_CAN_DONATE_TO[selectedBloodType] || [];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        padding: '4.5rem 0',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Subtle radial glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.25) 0%, rgba(220, 38, 38, 0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '0.35rem 0.85rem', borderRadius: 9999, fontSize: '0.82rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            <span className="pulse-indicator" />
            <span style={{ color: '#fca5a5' }}>AWS Serverless Architecture &bull; Sub-Second Emergency Match</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, maxWidth: '850px', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Every Second Counts. <br />
            <span style={{ color: '#ef4444' }}>Intelligent Serverless</span> Blood Matching.
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#94a3b8', maxWidth: '680px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            SmartBlood connects critical hospital trauma emergencies directly to compatible, verified nearby donors within seconds using AWS Lambda, Amazon DynamoDB, and Amazon SNS.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn-emergency" onClick={onOpenEmergencyModal} style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              <AlertTriangle size={20} />
              <span>Broadcast Emergency Request</span>
            </button>

            <button
              onClick={() => onNavigate('search')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '0.85rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backdropFilter: 'blur(4px)'
              }}
            >
              <Search size={18} />
              <span>Find Donors Nearby</span>
            </button>

            <button
              onClick={() => onNavigate('donor')}
              style={{
                color: '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '0.85rem 1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Heart size={18} color="#ef4444" />
              <span>Become a Registered Donor</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Network Live Stats (Simulated Demonstration Metrics) */}
      <section style={{ transform: 'translateY(-2rem)', zIndex: 10, position: 'relative' }}>
        <div className="container">
          <div style={{ textAlign: 'right', marginBottom: '0.4rem', fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
            * Simulated Demonstration Metrics for AWS Weekend Challenge Review
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            background: 'var(--surface)',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Donors Network
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                4,820+
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>&bull; Verified & GPS Geocoded</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Avg Emergency Match Time
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
                &lt; 3.8s
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Haversine Distance Scored
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Partner Healthcare Centers
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                85 Hospitals
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Trauma & Emergency Care
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cloud Compute Cost
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                $0.00 / Idle
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                100% AWS Serverless
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Medical Compatibility Matrix */}
      <section style={{ padding: '3.5rem 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 2.5rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Biological Compatibility Engine
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.5rem' }}>
              Interactive Blood Compatibility Lookup
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Select a recipient blood type to see which donor groups can safely save their life.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {BLOOD_GROUPS.map((type) => {
              const isSelected = type === selectedBloodType;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedBloodType(type)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--primary)' : 'var(--surface-alt)',
                    color: isSelected ? 'white' : 'var(--text-main)',
                    boxShadow: isSelected ? '0 4px 12px rgba(220, 38, 38, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
            <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#047857' }}>
                <CheckCircle2 size={20} />
                <span>Compatible Donors for Recipient ({selectedBloodType})</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Patients with <strong>{selectedBloodType}</strong> can safely receive red blood cells from:
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {compatibleDonors.map((type) => (
                  <span
                    key={type}
                    style={{
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '1rem'
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <Heart size={20} />
                <span>Who Can A ({selectedBloodType}) Donor Help?</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Donors with <strong>{selectedBloodType}</strong> can give life-saving blood to:
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {canGiveTo.map((type) => (
                  <span
                    key={type}
                    style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary-dark)',
                      border: '1px solid var(--primary-border)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '1rem'
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section style={{ padding: '4.5rem 0', background: 'var(--surface-alt)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 3rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Zero Pipeline, Infinite Scale
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.75rem' }}>
              How SmartBlood Works In An Emergency
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Powered by AWS Serverless architecture to eliminate manual phone tag and human delays when blood is urgently needed.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                1
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Emergency Broadcast</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Hospital ER staff posts an urgent request specifying blood type, unit count, and hospital location via Amazon API Gateway.
              </p>
            </div>

            <div className="card" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                2
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Zap size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Serverless Matching</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                AWS Lambda queries DynamoDB, cross-references compatibility matrices, and computes Haversine distances to rank available nearby donors.
              </p>
            </div>

            <div className="card" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                3
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Instant SNS Alerts</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Amazon SNS broadcasts filtered push and SMS notifications strictly to verified, compatible donors within driving range.
              </p>
            </div>

            <div className="card" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                4
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pledged ETA & Arrival</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Donors accept directly in one tap with an estimated arrival time, allowing hospital trauma teams to prepare transfusions with certainty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '4rem 0', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to Help Save Lives in Your Community?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Register your blood type once and receive emergency alerts only when a life nearby depends on you.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-emergency" onClick={() => onNavigate('donor')} style={{ padding: '0.85rem 1.75rem' }}>
              <Heart size={18} />
              <span>Join As A Blood Donor</span>
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('hospital')} style={{ padding: '0.85rem 1.75rem' }}>
              <Building2 size={18} />
              <span>Hospital Blood Bank Portal</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

