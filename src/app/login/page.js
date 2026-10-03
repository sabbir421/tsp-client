'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from '../components/auth/AuthLayout';
import { loginUser, loginWithOtp, clearError, clearSelectedRole } from '../store/slices/authSlice';
import { authApi } from '../utils/api';
import { ROLE_OPTIONS } from '../constants';
import { buildRoleSelectHref, getSafeNextPath } from '../utils/navigation';
import styles from '../components/auth/auth.module.css';

const OTP_RESEND_INTERVAL = 60; // seconds

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { selectedRole, loading, error, isAuthenticated, isHydrated } = useSelector((state) => state.auth);
  const rawNext = searchParams.get('next');
  const nextPath = getSafeNextPath(rawNext, '/dashboard');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(1);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (!isHydrated) return;

    if (!selectedRole) {
      router.replace('/role-select');
    }
  }, [isHydrated, selectedRole, router]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, nextPath, router]);

  // Resend Timer Countdown Effect
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const roleLabel = ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label;

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const res = await dispatch(loginUser({ identifier, password, role: selectedRole }));
    if (loginUser.fulfilled.match(res)) {
      router.replace(nextPath);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!identifier) {
      setLocalError('Please enter your email or phone number first');
      return;
    }
    setLocalError('');
    setSuccessMessage('');
    setOtpLoading(true);
    try {
      await authApi.sendLoginOtp({ identifier, role: selectedRole });
      setOtpSent(true);
      setOtpStep(2);
      setResendTimer(OTP_RESEND_INTERVAL);
    } catch (err) {
      setLocalError(err.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendLoginOtp = async () => {
    if (resendTimer > 0 || otpLoading) return;
    setLocalError('');
    setSuccessMessage('');
    setOtpLoading(true);
    try {
      await authApi.sendLoginOtp({ identifier, role: selectedRole });
      setOtpSent(true);
      setResendTimer(OTP_RESEND_INTERVAL);
      setSuccessMessage('A new OTP has been sent successfully.');
    } catch (err) {
      setLocalError(err.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    if (!otpCode || otpCode.trim().length !== 6) {
      setLocalError('Please enter a valid 6-digit OTP code');
      return;
    }
    dispatch(clearError());
    const res = await dispatch(loginWithOtp({ identifier, otpCode: otpCode.trim(), role: selectedRole }));
    if (loginWithOtp.fulfilled.match(res)) {
      router.replace(nextPath);
    }
  };

  const handleChangeRole = () => {
    dispatch(clearSelectedRole());
    router.push(buildRoleSelectHref(nextPath));
  };

  if (!isHydrated || !selectedRole) return null;

  return (
    <AuthLayout
      title={otpMode && otpStep === 2 ? 'Verify Verification Code' : 'Welcome back!'}
      subtitle={
        otpMode && otpStep === 2
          ? `Enter the 6-digit code sent to ${identifier}`
          : 'Sign in to continue to your account.'
      }
    >
      <div className={styles.selectedRoleBadge}>
        {roleLabel}
        <button type="button" className={styles.changeRole} onClick={handleChangeRole}>
          Change
        </button>
      </div>

      {(error || localError) && <div className={styles.error}>{error || localError}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}

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

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => {
              setOtpMode(true);
              setOtpStep(1);
            }}
          >
            Login with phone OTP
          </button>
        </form>
      ) : otpStep === 1 ? (
        <form className={styles.form} onSubmit={handleSendOtp}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email or Phone Number</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>👤</span>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter registered email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={otpLoading}>
            {otpLoading ? 'Sending OTP...' : 'Send OTP & Proceed'}
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setOtpMode(false)}
          >
            Back to Password Login
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleOtpLogin}>
          <div className={styles.illustration}>📱</div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Enter 6-Digit OTP Code</label>
            <input
              className={`${styles.input} ${styles.inputNoIcon}`}
              type="text"
              placeholder="e.g. 123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              required
              autoFocus
            />
            {otpSent && (
              <p className={styles.otpHint}>Code sent to {identifier}</p>
            )}
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Sign In'}
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleResendLoginOtp}
            disabled={resendTimer > 0 || otpLoading}
          >
            {otpLoading
              ? 'Sending...'
              : resendTimer > 0
              ? `Resend OTP (${resendTimer}s)`
              : 'Resend OTP'}
          </button>

          <button
            type="button"
            className={styles.textLinkBtn}
            onClick={() => setOtpStep(1)}
          >
            ← Change Email / Phone
          </button>
        </form>
      )}

      <p className={styles.footer}>
        Don&apos;t have an account? <Link href="/signup">Register Now</Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
