'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authApi } from '../../utils/api';
import { getActiveToken } from '../../utils/authStorage';
import { buildAuthHref } from '../../utils/navigation';

const AuthUserContext = createContext(null);

export const useAuthUser = () => useContext(AuthUserContext);

const messageStyle = { minHeight: '40vh', display: 'grid', placeItems: 'center', color: '#64748b', padding: '24px', textAlign: 'center' };

/** Renders children only after the server has confirmed the session and its role. */
export default function RequireAuth({ requiredRole, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [failure, setFailure] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const returnUrl = `${pathname}${window.location.search}`;
    const toLogin = () => router.replace(buildAuthHref('/login', returnUrl, requiredRole));

    if (!getActiveToken()) {
      toLogin();
      return undefined;
    }

    authApi
      .getProfile()
      .then((res) => {
        if (!active) return;
        if (requiredRole && res.data?.role !== requiredRole) {
          toLogin();
          return;
        }
        setUser(res.data);
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) {
          toLogin();
          return;
        }
        setFailure(err.message || 'Could not verify your session.');
      });

    return () => {
      active = false;
    };
  }, [pathname, requiredRole, router, attempt]);

  if (failure) {
    return (
      <div style={messageStyle}>
        <div>
          <p>{failure}</p>
          <button type="button" className="btn btn-o btn-sm" onClick={() => {
              setFailure('');
              setAttempt((n) => n + 1);
            }}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!user || (requiredRole && user.role !== requiredRole)) {
    return <div style={messageStyle}>Checking your account…</div>;
  }

  return <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>;
}
