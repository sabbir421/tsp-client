'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '../components/auth/AuthLayout';
import { authApi } from '../utils/api';
import styles from '../components/auth/auth.module.css';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid reset link');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authApi.resetPassword({ token, newPassword });
      setMessage(res.message);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="This password reset link is invalid or has expired.">
        <p className={styles.footer}>
          <Link href="/forgot-password">Request a new reset link</Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password below.">
      {error && <div className={styles.error}>{error}</div>}
      {message && <div className={styles.success}>{message}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
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

        <div className={styles.inputGroup}>
          <label className={styles.label}>Confirm Password</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>🔒</span>
            <input
              className={styles.input}
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>

        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <p className={styles.footer}>
        <Link href="/login">Back to Sign In</Link>
      </p>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className={styles.page}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
