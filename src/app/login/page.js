'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from '../components/auth/AuthLayout';
import { loginUser, loginWithOtp, clearError, clearSelectedRole } from '../store/slices/authSlice';
import { authApi } from '../utils/api';
import { ROLE_OPTIONS } from '../constants';
import { buildRoleSelectHref, getSafeNextPath } from '../utils/navigation';
import styles from '../components/auth/auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { selectedRole, loading, error, isAuthenticated, isHydrated } = useSelector((state) => state.auth);
  const nextPath = getSafeNextPath(searchParams.get('next'), '/dashboard');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (!selectedRole) {
      router.replace('/role-select');
    }
  }, [isHydrated, selectedRole, router]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(nextPath);
    }
  }, [isAuthenticated, nextPath, router]);

  const roleLabel = ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label;

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(loginUser({ identifier, password, role: selectedRole }));
  };

  const handleSendOtp = async () => {
    if (!identifier) return;
    setOtpLoading(true);
    try {
      await authApi.sendLoginOtp({ identifier, role: selectedRole });
      setOtpSent(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(loginWithOtp({ identifier, otpCode, role: selectedRole }));
  };

  const handleChangeRole = () => {
    dispatch(clearSelectedRole());
    router.push(buildRoleSelectHref(nextPath));
  };

  if (!isHydrated || !selectedRole) return null;

  return (
    <AuthLayout title="Welcome back!" subtitle="Sign in to continue to your account.">
      <div className={styles.selectedRoleBadge}>
        {roleLabel}
        <button type="button" className={styles.changeRole} onClick={handleChangeRole}>
          Change
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {!otpMode ? (
        <form className={styles.form} onSubmit={handleLogin}>
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

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link href="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className={styles.divider}>OR</div>

          <button type="button" className={styles.secondaryBtn} onClick={() => setOtpMode(true)}>
            Login with phone OTP
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleOtpLogin}>
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

          {otpSent && (
            <p className={styles.otpHint}>We&apos;ve sent a 6-digit code to your registered phone.</p>
          )}

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
              disabled={otpLoading || !identifier}
            >
              {otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Verifying...' : 'Sign In with OTP'}
          </button>

          <button type="button" className={styles.secondaryBtn} onClick={() => setOtpMode(false)}>
            Back to Password Login
          </button>
        </form>
      )}

      <p className={styles.footer}>
        Don&apos;t have an account? <Link href="/signup">Register Now</Link>
      </p>
    </AuthLayout>
  );
}
