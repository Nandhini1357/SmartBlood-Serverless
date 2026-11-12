import React, { useState, useEffect } from 'react';
import {
  Building2,
  Package,
  Activity,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  Users,
  Clock,
  Navigation,
  RefreshCw,
  Phone
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { BLOOD_GROUPS } from '../../utils/bloodTypes';
import { bloodApi } from '../../services/api';

export const HospitalDashboard = ({ requests, onOpenEmergencyModal, onRefreshRequests }) => {
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [selectedRequestForResponses, setSelectedRequestForResponses] = useState(null);
  const [updatingType, setUpdatingType] = useState(null);
  const [inventoryToast, setInventoryToast] = useState(null);

  const fetchInventory = async () => {
    setLoadingInventory(true);
    try {
      const items = await bloodApi.getBankInventory('main-blood-bank');
      setInventory(items);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustUnits = async (bloodType, currentUnits, delta) => {
    const newUnits = Math.max(0, currentUnits + delta);
    setUpdatingType(bloodType);
    try {
      const updated = await bloodApi.updateBankInventory('main-blood-bank', {
        bloodType,
        unitsAvailable: newUnits
      });
      setInventory((prev) =>
        prev.map((item) => (item.bloodType === bloodType ? { ...item, unitsAvailable: newUnits, status: updated.status } : item))
      );
      setInventoryToast(`Updated ${bloodType} inventory to ${newUnits} pint(s).`);
      setTimeout(() => setInventoryToast(null), 3500);
    } catch (err) {
      console.error('Failed to update units', err);
    } finally {
      setUpdatingType(null);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 color="var(--primary)" size={28} />
            <span>Hospital Blood Bank Telemetry & Dispatch</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
            Monitor real-time blood reserves, broadcast urgent shortages, and track incoming donor arrival ETAs.
          </p>
        </div>

        <button className="btn-emergency" onClick={onOpenEmergencyModal}>
          <AlertTriangle size={18} />
          <span>Broadcast Emergency Shortage</span>
        </button>
      </div>

      {inventoryToast && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.85rem 1rem', borderRadius: 10, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle size={18} color="#10b981" />
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{inventoryToast}</div>
        </div>
      )}

      {/* SECTION 1: INVENTORY MANAGEMENT */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} color="var(--primary)" />
              <span>Blood Unit Inventory Reserves</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              DynamoDB Single-Table inventory records with threshold tracking
            </p>
          </div>

          <button onClick={fetchInventory} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
            <RefreshCw size={14} />
            <span>Refresh Inventory</span>
          </button>
        </div>

        {loadingInventory ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading inventory reserves...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {inventory.map((item) => {
              const isCrit = item.status === 'Critical' || item.unitsAvailable <= 3;
              const isLow = !isCrit && (item.status === 'Low' || item.unitsAvailable <= 6);
              const isUpdating = updatingType === item.bloodType;

              return (
                <div
                  key={item.bloodType}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    border: isCrit ? '2px solid #fca5a5' : isLow ? '1px solid #fdba74' : '1px solid var(--border)',
                    background: isCrit ? '#fffafb' : 'var(--surface)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {item.bloodType}
                    </span>

                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 6,
                      background: isCrit ? '#fee2e2' : isLow ? '#ffedd5' : '#ecfdf5',
                      color: isCrit ? '#b91c1c' : isLow ? '#c2410c' : '#047857',
                      border: `1px solid ${isCrit ? '#fca5a5' : isLow ? '#fed7aa' : '#a7f3d0'}`
                    }}>
                      {isCrit ? 'Critical Stock' : isLow ? 'Low Reserve' : 'Optimal'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>
                        {item.unitsAvailable}
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.25rem' }}>pints</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Min Safe: {item.minSafeUnits || 6}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleAdjustUnits(item.bloodType, item.unitsAvailable, -1)}
                        disabled={isUpdating || item.unitsAvailable <= 0}
                        title="Deduct 1 unit"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'var(--surface-subtle)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Minus size={14} />
                      </button>

                      <button
                        onClick={() => handleAdjustUnits(item.bloodType, item.unitsAvailable, 1)}
                        disabled={isUpdating}
                        title="Add 1 unit"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          border: '1px solid var(--primary-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: ACTIVE HOSPITAL REQUESTS & DONOR RESPONSE TRACKER */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--primary)" />
              <span>Active Requests & Inbound Responders</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Hospital emergency blood requirements and real-time donor arrival pledges
            </p>
          </div>

          <button onClick={onRefreshRequests} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
            <RefreshCw size={14} />
            <span>Refresh Requests</span>
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No emergency requests recorded.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.map((req) => (
              <div key={req.requestId} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--primary-border)'
                    }}>
                      {req.bloodType}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{req.hospitalName}</h3>
                        <StatusBadge urgency={req.urgencyLevel} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, background: '#f1f5f9', color: '#475569' }}>
                          Status: {req.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Units needed: <strong>{req.unitsNeeded}</strong> &bull; Contact: {req.contactPhone} &bull; Requester: {req.requesterName}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRequestForResponses(req)}
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.95rem' }}
                  >
                    <Users size={15} />
                    <span>View Responders ({req.responsesCount || 0})</span>
                  </button>
                </div>

                {/* Responses Pill preview */}
                {req.responses && req.responses.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Inbound Donors:
                    </span>
                    {req.responses.map((resp, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.75rem',
                          background: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 6,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Navigation size={12} color="#16a34a" />
                        <strong>{resp.donorName}</strong> &bull; ETA {resp.etaMinutes} mins &bull; {resp.status}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: VIEW ALL RESPONSES FOR A REQUEST */}
      {selectedRequestForResponses && (
        <div className="modal-overlay" onClick={() => setSelectedRequestForResponses(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users color="var(--primary)" size={22} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Inbound Donors & ETA Telemetry</h3>
              </div>
              <button onClick={() => setSelectedRequestForResponses(null)} style={{ color: 'var(--text-muted)' }}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{selectedRequestForResponses.hospitalName}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Request ID: {selectedRequestForResponses.requestId} &bull; Type: <strong>{selectedRequestForResponses.bloodType}</strong> ({selectedRequestForResponses.unitsNeeded} units)
                </div>
              </div>

              {!selectedRequestForResponses.responses || selectedRequestForResponses.responses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No donor responses recorded yet. Amazon SNS alerts are broadcasting to registered local donors.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedRequestForResponses.responses.map((resp, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle size={15} color="#16a34a" />
                          <span>{resp.donorName}</span>
                          <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: 4, background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                            {resp.status}
                          </span>
                        </div>
                        {resp.notes && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Notes: "{resp.notes}"
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {resp.etaMinutes}m
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated ETA</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
