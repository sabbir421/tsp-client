'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile } from '../../store/slices/authSlice';
import { isSellerAgent } from '../../utils/roles';
import common from './pageCommon.module.css';
import styles from './profile.module.css';

const ROLE_LABELS = {
  buyer_tenant: 'Buyer / Tenant',
  seller_agent: 'Seller / Agent / Developer',
  bachelor_poster: 'Bachelor Poster',
};

const COUNTRY_CODES = ['+880', '+91', '+1', '+44', '+971', '+966'];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, selectedRole, loading } = useSelector((state) => state.auth);
  const sellerView = isSellerAgent(user, selectedRole);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+880',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await dispatch(fetchProfile()).unwrap();
      } catch {
        // keep existing user from store
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      countryCode: user.countryCode || '+880',
    });
  }, [user]);

  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await dispatch(
        updateProfile({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          countryCode: form.countryCode.trim() || '+880',
        })
      ).unwrap();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded && !user) {
    return (
      <div className={common.loading}>
        <div className={common.spinner} />
        Loading profile...
      </div>
    );
  }

  return (
    <div>
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>My Profile</h1>
          <p className={common.pageSubtitle}>
            View and update your account details used across the {sellerView ? 'seller' : 'buyer'} portal.
          </p>
        </div>
      </div>

      {error && <div className={common.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.profileLayout}>
        <aside className={styles.summaryCard}>
          <div className={styles.avatar}>{initials}</div>
          <h2 className={styles.summaryName}>{user?.fullName || 'User'}</h2>
          <p className={styles.summaryRole}>
            {ROLE_LABELS[user?.role] || ROLE_LABELS[selectedRole] || 'Account'}
          </p>
          <div className={styles.badgeRow}>
            <span className={`${common.badge} ${user?.isPhoneVerified ? common.badgeSuccess : common.badgeWarning}`}>
              {user?.isPhoneVerified ? 'Phone Verified' : 'Phone Unverified'}
            </span>
            <span className={`${common.badge} ${user?.isEmailVerified ? common.badgeSuccess : common.badgeWarning}`}>
              {user?.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
            </span>
            <span className={`${common.badge} ${user?.isActive !== false ? common.badgeInfo : common.badgeDanger}`}>
              {user?.isActive !== false ? 'Active' : 'Inactive'}
            </span>
          </div>
        </aside>

        <form className={styles.formCard} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Profile Information</h2>
            <p className={styles.formSubtitle}>
              Keep your contact details up to date so matches and site visits can reach you.
            </p>
          </div>

          <div className={styles.formBody}>
            <div className={styles.fieldGrid}>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  className={styles.input}
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="role">Account Type</label>
                <input
                  id="role"
                  className={`${styles.input} ${styles.inputReadonly}`}
                  value={ROLE_LABELS[user?.role] || '—'}
                  readOnly
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="phone">Phone</label>
                <div className={styles.phoneRow}>
                  <select
                    name="countryCode"
                    className={styles.select}
                    value={form.countryCode}
                    onChange={handleChange}
                  >
                    {COUNTRY_CODES.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  <input
                    id="phone"
                    name="phone"
                    className={styles.input}
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Phone Status</span>
                <span className={styles.metaValue}>
                  {user?.isPhoneVerified ? 'Verified' : 'Not verified'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Email Status</span>
                <span className={styles.metaValue}>
                  {user?.isEmailVerified ? 'Verified' : 'Not verified'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Account Status</span>
                <span className={styles.metaValue}>
                  {user?.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Member Since</span>
                <span className={styles.metaValue}>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-BD', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.formFooter}>
            <button
              type="submit"
              className={common.primaryBtn}
              disabled={saving || loading}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
