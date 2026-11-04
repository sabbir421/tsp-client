'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { getStore, clearSession, subscribeStore } from '../../utils/prototypeStore';
import { getActiveToken } from '../../utils/authStorage';
import { logoutAllPortals } from '../../store/slices/authSlice';
import { ROLES } from '../../utils/prototypeData';

export default function PrototypeHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [session, setSession] = useState({ role: null, name: '', email: '', isLoggedIn: false });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const { v3 } = getStore();
      if (v3?.session) {
        setSession({ ...v3.session, isLoggedIn: !!v3.session.isLoggedIn && !!getActiveToken() });
      }
    };
    update();
    return subscribeStore(update);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setRoleMenuOpen(false);
      }
    };
    if (roleMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [roleMenuOpen]);

  const handleLogout = () => {
    clearSession();
    dispatch(logoutAllPortals());
    setRoleMenuOpen(false);
    router.push('/');
  };

  const isDashboard = pathname?.startsWith('/dashboard');
  const isLoggedIn = !!session?.isLoggedIn;
  const dashboardHref = '/dashboard';
  const ctaLabel = 'My dashboard';

  return (
    <>
      <header className="top">
        <div className="wrap nav">
          <Link href="/" className="logo" aria-label="TrueSpace Property home">
            <img
              src="/logo-prototype.webp"
              alt="TrueSpace Property"
              className="lg-full"
              id="tslogo"
              width={153}
              height={56}
            />
            <img
              src="/mark-prototype.webp"
              alt="TrueSpace Property"
              className="lg-mark"
              width={48}
              height={48}
            />
          </Link>

          <nav className="links" id="links">
            <Link
              href="/discover"
              data-r="discover"
              className={pathname === '/discover' ? 'on' : ''}
            >
              Discover
            </Link>
            <Link
              href="/requirements"
              data-r="requirements"
              className={pathname === '/requirements' ? 'on' : ''}
            >
              Requirements
            </Link>
            <Link
              href="/about"
              data-r="about"
              className={pathname === '/about' ? 'on' : ''}
            >
              About
            </Link>
            <Link
              href="/contact"
              data-r="contact"
              className={pathname === '/contact' ? 'on' : ''}
            >
              Contact
            </Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            {!isLoggedIn && !isDashboard ? (
              <Link
                href="/login"
                className="btn btn-n btn-sm cta"
                style={{
                  backgroundColor: '#1c2847',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontWeight: '600',
                  fontSize: '14.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
              >
                Log in
              </Link>
            ) : (
              <>
                <Link href={dashboardHref} className="btn btn-n btn-sm cta">
                  {ctaLabel}
                </Link>

                {/* Quick Demo Role Switcher Dropdown (hidden on dashboard where sidebar has role switcher) */}
                {!isDashboard && (
                  <div style={{ position: 'relative' }} ref={roleMenuRef}>
                    <button
                      type="button"
                      className="btn btn-g btn-sm cta-role-badge"
                      onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                      aria-label="Account menu"
                      title="Account menu"
                      style={{ padding: '6px 10px', gap: '6px' }}
                    >
                      <div className="av" style={{ width: '24px', height: '24px', fontSize: '11px' }}>
                        {session?.name ? session.name[0] : 'U'}
                      </div>
                      <span className="role-label-text" style={{ fontSize: '13px', fontWeight: '600' }}>
                        {ROLES[session?.role]?.label || session?.name || 'Account'}
                      </span>
                      <span style={{ fontSize: '9px', opacity: 0.7 }}>▼</span>
                    </button>

                    {roleMenuOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 'calc(100% + 6px)',
                          background: '#fff',
                          borderRadius: '14px',
                          boxShadow: 'var(--sh)',
                          border: '1px solid var(--line)',
                          width: '240px',
                          padding: '8px',
                          zIndex: 100,
                        }}
                      >
                        <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', marginBottom: '6px' }}>
                          <b style={{ display: 'block', fontSize: '13.5px', color: 'var(--navy)' }}>{session.name || 'User'}</b>
                          <small style={{ color: 'var(--mut)', fontSize: '11.5px', display: 'block' }}>{session.phone || session.email || ''}</small>
                          <span className="tag" style={{ marginTop: '6px', fontSize: '11px', display: 'inline-block' }}>
                            {ROLES[session.role]?.label || 'Member'}
                          </span>
                        </div>
                        <Link
                          href={dashboardHref}
                          className="btn btn-l btn-sm"
                          style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', fontSize: '13px', textDecoration: 'none' }}
                          onClick={() => setRoleMenuOpen(false)}
                        >
                          Open Dashboard
                        </Link>
                        <div style={{ borderTop: '1px solid var(--line)', marginTop: '6px', paddingTop: '6px' }}>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="btn btn-l btn-sm"
                            style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 10px', fontSize: '13px', color: '#dc2626' }}
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              className="burger"
              id="burger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <svg width="26" height="26" viewBox="0 0 24 24">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="#1c2847" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mnav open" id="mnav">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link href="/discover" onClick={() => setMobileOpen(false)}>
              Discover properties
            </Link>
            <Link href="/requirements" onClick={() => setMobileOpen(false)}>
              Buyer requirements
            </Link>
            <Link href="/matches" onClick={() => setMobileOpen(false)}>
              Matches
            </Link>
            <Link href="/how" onClick={() => setMobileOpen(false)}>
              How it works
            </Link>
            <Link href="/about" onClick={() => setMobileOpen(false)}>
              About
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  className="btn btn-n"
                  style={{ marginTop: '12px' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {ctaLabel} · {ROLES[session?.role]?.label || 'Buyer'}
                </Link>
                <button
                  type="button"
                  style={{ display: 'block', width: '100%', padding: '11px 4px', fontSize: '13px', color: '#dc2626', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                >
                  Sign out ({session.name || 'User'})
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn btn-n"
                  style={{ marginTop: '12px', backgroundColor: '#1c2847', color: '#fff' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  style={{ display: 'block', padding: '11px 4px', fontSize: '13px', color: 'var(--navy)', textAlign: 'center', fontWeight: '600' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Create an account
                </Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}
