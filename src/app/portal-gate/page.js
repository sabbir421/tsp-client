'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { activateRoleSession } from '../store/slices/authSlice';
import { hasPortalToken } from '../utils/authStorage';
import { buildRoleSelectHref, getSafeNextPath } from '../utils/navigation';

function PortalGateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const role = searchParams.get('role');
    const nextPath = getSafeNextPath(searchParams.get('next'), '/dashboard');

    if (!role) {
      router.replace(buildRoleSelectHref(nextPath));
      return;
    }

    if (hasPortalToken(role)) {
      dispatch(activateRoleSession(role));
      router.replace(nextPath);
      return;
    }

    router.replace(buildRoleSelectHref(nextPath, role));
  }, [dispatch, router, searchParams]);

  return (
    <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center', color: '#64748b' }}>
      Opening portal…
    </div>
  );
}

export default function PortalGatePage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center', color: '#64748b' }}>
          Opening portal…
        </div>
      }
    >
      <PortalGateContent />
    </Suspense>
  );
}
