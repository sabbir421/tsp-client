'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from '../components/auth/AuthLayout';
import RoleSelector from '../components/auth/RoleSelector';
import { registerUser, clearError, setSelectedRole, clearSelectedRole } from '../store/slices/authSlice';
import { authApi } from '../utils/api';
import { ROLE_OPTIONS } from '../constants';
import { buildRoleSelectHref, getSafeNextPath } from '../utils/navigation';
import styles from '../components/auth/auth.module.css';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { selectedRole, loading, error, isAuthenticated, isHydrated } = useSelector((state) => state.auth);
  const nextPath = getSafeNextPath(searchParams.get('next'), '/dashboard');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    countryCode: '+880',
    email: '',
    password: '',
    otpCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [localRole, setLocalRole] = useState(selectedRole || searchParams.get('role'));

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated) {
      router.push(nextPath);
    }
  }, [isAuthenticated, isHydrated, nextPath, router]);

  if (!isHydrated) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleRoleSelect = (role) => {
    setLocalRole(role);
    dispatch(setSelectedRole(role));
  };

  const handleSendOtp = async () => {
    if (!form.phone || !localRole) {
      alert('Please fill phone number and select account type first');
      return;
    }
    setOtpLoading(true);
    try {
      await authApi.sendRegistrationOtp({
        phone: form.phone,
        countryCode: form.countryCode,
        email: form.email,
        role: localRole,
      });
      setOtpSent(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localRole) {
      alert('Please select an account type');
      return;
    }
    dispatch(clearError());
    await dispatch(
      registerUser({
        fullName: form.fullName,
        phone: form.phone,
        countryCode: form.countryCode,
        email: form.email,
        password: form.password,
        role: localRole,
        otpCode: form.otpCode,
      })
    );
  };

  const handleChangeRole = () => {
    dispatch(clearSelectedRole());
    router.push(buildRoleSelectHref(nextPath));
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join TrueSpace Property today.">
      {selectedRole && (
        <div className={styles.selectedRoleBadge}>
          {ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label}
          <button type="button" className={styles.changeRole} onClick={handleChangeRole}>
            Change
          </button>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <RoleSelector selectedRole={localRole} onSelect={handleRoleSelect} />

        <div className={styles.inputGroup}>
          <label className={styles.label}>Full Name</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>👤</span>
            <input
              className={styles.input}
              type="text"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange('fullName')}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Phone Number</label>
          <div className={styles.phoneRow}>
            <select
              className={styles.countryCode}
              value={form.countryCode}
              onChange={handleChange('countryCode')}
            >
              <option value="+880">+880</option>
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
            </select>
            <div className={`${styles.inputWrap} ${styles.phoneInput}`}>
              <span className={styles.inputIcon}>📱</span>
              <input
                className={styles.input}
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={handleChange('phone')}
                required
              />
            </div>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Email Address</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>✉️</span>
            <input
              className={styles.input}
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange('email')}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Password</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>🔒</span>
            <input
              className={styles.input}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange('password')}
              required
              minLength={6}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Verify Your Phone</label>
          <div className={styles.otpRow}>
            <div className={styles.inputGroup}>
              <input
                className={`${styles.input} ${styles.inputNoIcon}`}
                type="text"
                placeholder="Enter OTP"
                value={form.otpCode}
                onChange={handleChange('otpCode')}
                maxLength={6}
                required
              />
            </div>
            <button
              type="button"
              className={styles.sendOtpBtn}
              onClick={handleSendOtp}
              disabled={otpLoading}
            >
              {otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </div>
          {otpSent && (
            <p className={styles.otpHint}>
              We&apos;ve sent a 6-digit code to {form.countryCode} {form.phone}
            </p>
          )}
        </div>

        <p className={styles.terms}>
          By creating an account, you agree to our{' '}
          <Link href="/terms">Terms of Service</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className={styles.footer}>
        Already have an account? <Link href="/login">Sign In</Link>
      </p>
    </AuthLayout>
  );
}
