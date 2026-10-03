'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from '../components/auth/AuthLayout';
import { registerUser, clearError } from '../store/slices/authSlice';
import { authApi } from '../utils/api';
import { getSafeNextPath } from '../utils/navigation';
import styles from '../components/auth/auth.module.css';

const OTP_RESEND_INTERVAL = 60; // seconds

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { selectedRole, loading, error, isAuthenticated, isHydrated } = useSelector((state) => state.auth);
  const rawNext = searchParams.get('next');
  const nextPath = getSafeNextPath(rawNext, '/dashboard');

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    countryCode: '+880',
    email: '',
    otpCode: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [stepError, setStepError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Resend Timer State
  const [resendTimer, setResendTimer] = useState(0);

  const localRole = selectedRole || searchParams.get('role') || 'seller';

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isHydrated, nextPath, router]);

  // Countdown effect for OTP resend timer
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

  if (!isHydrated) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSendOtpStep = async (e) => {
    e.preventDefault();
    setStepError('');
    setSuccessMessage('');
    if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim()) {
      setStepError('Please enter your Name, Phone Number, and Email Address.');
      return;
    }

    setOtpLoading(true);
    try {
      await authApi.sendRegistrationOtp({
        phone: form.phone.trim(),
        countryCode: form.countryCode,
        email: form.email.trim(),
        role: localRole,
      });
      setOtpSent(true);
      setStep(2);
      setResendTimer(OTP_RESEND_INTERVAL);
    } catch (err) {
      setStepError(err.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || otpLoading) return;
    setStepError('');
    setSuccessMessage('');
    setOtpLoading(true);
    try {
      await authApi.sendRegistrationOtp({
        phone: form.phone.trim(),
        countryCode: form.countryCode,
        email: form.email.trim(),
        role: localRole,
      });
      setOtpSent(true);
      setResendTimer(OTP_RESEND_INTERVAL);
      setSuccessMessage('A new OTP has been sent to your phone number.');
    } catch (err) {
      setStepError(err.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setStepError('');
    setSuccessMessage('');
    if (!form.otpCode || form.otpCode.trim().length !== 6) {
      setStepError('Please enter a valid 6-digit OTP code');
      return;
    }
    dispatch(clearError());
    const res = await dispatch(
      registerUser({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        countryCode: form.countryCode,
        email: form.email.trim(),
        role: localRole,
        otpCode: form.otpCode.trim(),
      })
    );

    if (registerUser.fulfilled.match(res)) {
      router.replace(nextPath);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Create Account' : 'Verify Your Phone'}
      subtitle={
        step === 1
          ? 'Join TrueSpace Property today.'
          : `We've sent a 6-digit OTP code to ${form.countryCode} ${form.phone}`
      }
    >
      {(error || stepError) && <div className={styles.error}>{error || stepError}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}

      {step === 1 ? (
        <form className={styles.form} onSubmit={handleSendOtpStep}>
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

          <p className={styles.terms}>
            By creating an account, you agree to our{' '}
            <Link href="/terms">Terms of Service</Link> and{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <button type="submit" className={styles.primaryBtn} disabled={otpLoading}>
            {otpLoading ? 'Sending OTP...' : 'Send OTP & Proceed'}
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleFinalSubmit}>
          <div className={styles.illustration}>📱</div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Enter 6-Digit OTP Code</label>
            <input
              className={`${styles.input} ${styles.inputNoIcon}`}
              type="text"
              placeholder="e.g. 123456"
              value={form.otpCode}
              onChange={handleChange('otpCode')}
              maxLength={6}
              required
              autoFocus
            />
            {otpSent && (
              <p className={styles.otpHint}>
                Code sent to {form.countryCode} {form.phone}
              </p>
            )}
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Verify & Create Account'}
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleResendOtp}
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
            onClick={() => {
              setStep(1);
              setStepError('');
              setSuccessMessage('');
            }}
          >
            ← Edit Account Information
          </button>
        </form>
      )}

      <p className={styles.footer}>
        Already have an account? <Link href="/login">Sign In</Link>
      </p>
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageContent />
    </Suspense>
  );
}
