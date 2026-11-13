import React, { useState } from 'react';
import { X, Lock, Building2, Mail, Key, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, signup, confirm, authError, clearError } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'confirm'
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [userRole, setUserRole] = useState('HOSPITAL_STAFF');
  const [confirmationCode, setConfirmationCode] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setLocalError(null);
    setSuccessMessage(null);
    clearError?.();
    onClose();
  };

  const mapErrorMessage = (err) => {
    const code = err.code || '';
    const msg = err.message || '';

    if (code === 'UserNotFoundException' || msg.includes('User does not exist')) {
      return 'No hospital staff account found with this email. Please register below.';
    }
    if (code === 'NotAuthorizedException' || msg.includes('Incorrect username or password')) {
      return 'Incorrect email or password. Please verify your credentials.';
    }
    if (code === 'UserNotConfirmedException' || msg.includes('User is not confirmed')) {
      setMode('confirm');
      return 'Account is not yet confirmed. Please enter the verification code sent to your email.';
    }
    if (code === 'UsernameExistsException' || msg.includes('User already exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (code === 'InvalidPasswordException' || msg.includes('Password did not conform')) {
      return 'Password does not meet Cognito complexity requirements (minimum 8 characters with numbers & symbols).';
    }
    if (code === 'CodeMismatchException') {
      return 'Invalid verification code. Please check your email inbox and try again.';
    }
    if (code === 'ExpiredCodeException') {
      return 'Verification code has expired. Please request a new code.';
    }
    if (code === 'InvalidParameterException' || msg.includes('Attributes did not conform')) {
      return 'Invalid attribute or field value. Please verify your inputs.';
    }
    return msg || 'Authentication request failed. Please check your credentials.';
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      await login(email, password);
      setSuccessMessage('Successfully authenticated with Amazon Cognito.');
      setTimeout(() => {
        handleClose();
      }, 700);
    } catch (err) {
      setLocalError(mapErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const hospitalSlug = facilityName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const res = await signup(email, password, {
        userRole,
        hospitalId: hospitalSlug || 'main-hospital',
        facilityName
      });

      if (res.userConfirmed) {
        setSuccessMessage('Account registered and confirmed. You can now sign in.');
        setMode('login');
      } else {
        setSuccessMessage('Account created! A confirmation code has been sent to your email.');
        setMode('confirm');
      }
    } catch (err) {
      setLocalError(mapErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      await confirm(email, confirmationCode);
      setSuccessMessage('Email verified successfully! You can now sign in.');
      setMode('login');
      setPassword('');
    } catch (err) {
      setLocalError(mapErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 color="var(--primary)" size={24} />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                {mode === 'login' && 'Hospital Staff Sign In'}
                {mode === 'register' && 'Register Hospital Account'}
                {mode === 'confirm' && 'Verify Cognito Account'}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Amazon Cognito User Pool &bull; ap-southeast-2
              </div>
            </div>
          </div>
          <button onClick={handleClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface-subtle)' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setLocalError(null); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderBottom: mode === 'login' ? '2px solid var(--primary)' : '2px solid transparent',
              background: mode === 'login' ? 'var(--surface)' : 'transparent',
              color: mode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: mode === 'login' ? 700 : 500,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setLocalError(null); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid var(--primary)' : '2px solid transparent',
              background: mode === 'register' ? 'var(--surface)' : 'transparent',
              color: mode === 'register' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: mode === 'register' ? 700 : 500,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Register Facility
          </button>
          <button
            type="button"
            onClick={() => { setMode('confirm'); setLocalError(null); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderBottom: mode === 'confirm' ? '2px solid var(--primary)' : '2px solid transparent',
              background: mode === 'confirm' ? 'var(--surface)' : 'transparent',
              color: mode === 'confirm' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: mode === 'confirm' ? 700 : 500,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Verify Code
          </button>
        </div>

        <div className="modal-body">
          {/* Security Banner */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.6rem 0.8rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--primary)" />
            <span>
              Secure JWT authentication via <strong>AWS Cognito User Pool</strong>. Protects emergency broadcasts and stock reserves.
            </span>
          </div>

          {/* Success banner */}
          {successMessage && (
            <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error banner */}
          {(localError || authError) && (
            <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.65rem 0.85rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  <strong>Admin Account:</strong> <code>admin@smartblood.org</code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@smartblood.org');
                    setPassword('SmartBlood2026!Staff');
                    setLocalError(null);
                  }}
                  style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary-border)',
                    borderRadius: 6,
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Auto-Fill
                </button>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={14} /> Hospital Staff Email *
                </label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="e.g. staff.officer@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Key size={14} /> Cognito Password *
                </label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
              >
                {loading ? 'Authenticating with AWS...' : 'Sign In as Hospital Staff'}
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Need a hospital staff account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setLocalError(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Register your facility
                </button>
              </div>
            </form>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={14} /> Hospital / Facility Name *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. AIIMS New Delhi or Apollo Hospitals"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={14} /> Official Hospital Email *
                </label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="e.g. staff.officer@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Key size={14} /> Password *
                  </label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Authorized Role</label>
                <select
                  className="form-select"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <option value="HOSPITAL_STAFF">Hospital Staff / Medical Officer</option>
                  <option value="BLOOD_BANK_MANAGER">Blood Bank Inventory Manager</option>
                  <option value="ADMIN">Facility Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
              >
                {loading ? 'Creating Cognito Account...' : 'Register Hospital Account'}
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setLocalError(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* MODE: CONFIRM CODE */}
          {mode === 'confirm' && (
            <form onSubmit={handleConfirmSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={14} /> Hospital Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="e.g. dr.adams@sfgeneral.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={14} /> 6-Digit Email Verification Code *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="123456"
                  maxLength={10}
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  style={{ letterSpacing: '0.2rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Check your email inbox for the verification code sent by AWS Cognito.
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
              >
                {loading ? 'Verifying with AWS...' : 'Verify Email & Complete Registration'}
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Have your password ready?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setLocalError(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

