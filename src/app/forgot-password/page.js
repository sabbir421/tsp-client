'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from '../components/auth/AuthLayout';
import { clearSelectedRole } from '../store/slices/authSlice';
import { authApi } from '../utils/api';
import { ROLE_OPTIONS } from '../constants';
import styles from '../components/auth/auth.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedRole, isHydrated } = useSelector((state) => state.auth);

  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (!selectedRole) {
      router.replace('/role-select');
    }
  }, [isHydrated, selectedRole, router]);

  const roleLabel = ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label;

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await authApi.forgotPassword({ identifier, role: selectedRole });
      setMessage(res.message);
      if (res.data?.resetLink) {
        setMessage(`${res.message} (Dev link: ${res.data.resetLink})`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.sendResetOtp({ identifier, role: selectedRole });
      setOtpSent(true);
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetWithOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.resetPasswordOtp({
        identifier,
        otpCode,
        newPassword,
        role: selectedRole,
      });
      setMessage(res.message);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = () => {
    dispatch(clearSelectedRole());
    router.push('/role-select');
  };

  if (!isHydrated || !selectedRole) return null;

  return (
    <AuthLayout title="Forgot Password?" subtitle="No worries! We'll help you reset it.">
      <div className={styles.illustration}>🔐</div>

      <div className={styles.selectedRoleBadge}>
        {roleLabel}
        <button type="button" className={styles.changeRole} onClick={handleChangeRole}>
          Change
        </button>
      </div>

      <p className={styles.subtitle} style={{ marginBottom: 20 }}>
        Enter your email or phone number. Reset via SMS OTP, or request a reset link.
      </p>

      {error && <div className={styles.error}>{error}</div>}
      {message && <div className={styles.success}>{message}</div>}

      {!otpMode ? (
        <form className={styles.form} onSubmit={handleSendResetLink}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email or Phone Number</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>👤</span>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className={styles.divider}>OR</div>

          <button type="button" className={styles.secondaryBtn} onClick={() => setOtpMode(true)}>
            Reset via phone OTP
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleResetWithOtp}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email or Phone Number</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>👤</span>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.otpRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Enter OTP</label>
              <input
                className={`${styles.input} ${styles.inputNoIcon}`}
                type="text"
                placeholder="6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <button
              type="button"
              className={styles.sendOtpBtn}
              onClick={handleSendOtp}
              disabled={loading || !identifier}
            >
              {otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>New Password</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                className={styles.input}
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <button type="button" className={styles.secondaryBtn} onClick={() => setOtpMode(false)}>
            Back to Reset Link
          </button>
        </form>
      )}

      <p className={styles.footer}>
        <Link href="/login">Back to Sign In</Link>
      </p>
    </AuthLayout>
  );
}
