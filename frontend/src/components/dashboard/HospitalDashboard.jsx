import React from 'react';
import { Building2, Package, Activity, ArrowUpRight } from 'lucide-react';

export const HospitalDashboard = ({ onOpenEmergencyModal }) => {
  const inventory = [
    { type: 'O-', units: 3, status: 'Critical' },
    { type: 'O+', units: 14, status: 'Normal' },
    { type: 'A-', units: 4, status: 'Low' },
    { type: 'A+', units: 18, status: 'Optimal' },
    { type: 'B-', units: 2, status: 'Critical' },
    { type: 'B+', units: 11, status: 'Normal' },
    { type: 'AB-', units: 1, status: 'Critical' },
    { type: 'AB+', units: 9, status: 'Normal' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hospital Blood Bank Telemetry</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Real-time blood reserves monitored by DynamoDB Single Table Design
          </p>
        </div>
        <button className="btn-emergency" onClick={onOpenEmergencyModal}>
          Broadcast Urgent Requirement
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {inventory.map((item) => {
          const isCrit = item.status === 'Critical';
          const isLow = item.status === 'Low';
          return (
            <div
              key={item.type}
              className="card"
              style={{
                borderColor: isCrit ? '#fca5a5' : 'var(--border)',
                background: isCrit ? '#fffafb' : 'var(--surface)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {item.type}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 4,
                    background: isCrit ? '#fee2e2' : isLow ? '#fef3c7' : '#ecfdf5',
                    color: isCrit ? '#b91c1c' : isLow ? '#b45309' : '#047857'
                  }}
                >
                  {item.status}
                </span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {item.units} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>units</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
