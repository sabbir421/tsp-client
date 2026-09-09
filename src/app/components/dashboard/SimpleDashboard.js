'use client';

import { useSelector } from 'react-redux';
import { ROLE_OPTIONS } from '../../constants';
import styles from '../layout/dashboard.module.css';

export default function SimpleDashboard() {
  const { user } = useSelector((state) => state.auth);
  const roleLabel = ROLE_OPTIONS.find((r) => r.value === user?.role)?.label;

  return (
    <div className={styles.simpleDashboard}>
      <h1 className={styles.simpleTitle}>Welcome, {user?.fullName}!</h1>
      <p className={styles.simpleDesc}>
        Your {roleLabel} dashboard is coming soon. We&apos;re building features tailored to your needs.
      </p>
    </div>
  );
}
