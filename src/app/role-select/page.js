'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import AuthLayout from '../components/auth/AuthLayout';
import RoleSelector from '../components/auth/RoleSelector';
import { setSelectedRole } from '../store/slices/authSlice';
import { buildAuthHref, getSafeNextPath } from '../utils/navigation';
import styles from '../components/auth/auth.module.css';

function RoleSelectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const roleFromQuery = searchParams.get('role');
  const [selectedRole, setLocalRole] = useState(roleFromQuery || null);
  const nextPath = getSafeNextPath(searchParams.get('next'), '/dashboard');

  const continueTo = (basePath) => {
    if (!selectedRole) return;
    dispatch(setSelectedRole(selectedRole));
    router.push(buildAuthHref(basePath, nextPath, selectedRole));
  };

  return (
    <AuthLayout
      title="Welcome to TrueSpace Property"
      subtitle="Select your account type to continue to the right portal"
    >
      <RoleSelector
        selectedRole={selectedRole}
        onSelect={setLocalRole}
        title="I am a..."
      />

      <div className={styles.form} style={{ marginTop: 20 }}>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={!selectedRole}
          onClick={() => continueTo('/login')}
        >
          Sign In
        </button>
        <button
          type="button"
          className={styles.secondaryBtn}
          disabled={!selectedRole}
          onClick={() => continueTo('/signup')}
        >
          Create Account
        </button>
      </div>
    </AuthLayout>
  );
}

export default function RoleSelectPage() {
  return (
    <Suspense fallback={null}>
      <RoleSelectPageContent />
    </Suspense>
  );
}
