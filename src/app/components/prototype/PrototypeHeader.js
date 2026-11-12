'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { getStore, clearSession, subscribeStore } from '../../utils/prototypeStore';
import { getActiveToken } from '../../utils/authStorage';
import { logoutAllPortals } from '../../store/slices/authSlice';
import { ROLES } from '../../utils/prototypeData';

const MOBILE_LINKS = [
  ['/', 'Home'],
  ['/discover', 'Discover properties'],
  ['/requirements', 'Buyer requirements'],
  ['/matches', 'Matches'],
  ['/how', 'How it works'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
];

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

  const closeMenu = () => setMobileOpen(false);

  // Close the drawer when the route changes (including back/forward)
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMobileOpen(false);
  }

  // While the drawer is open: lock page scroll, close on Escape, close if the screen grows to desktop
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
    const desktop = window.matchMedia('(min-width: 1021px)');
    const onResize = (e) => e.matches && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
    };
  }, [mobileOpen]);

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
            <img
              src="/logo-prototype.webp"
              alt=""
              aria-hidden="true"
              className="lg-mob"
              width={153}
              height={56}
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
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mnav"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="#1c2847" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / tablet drawer: always mounted so it can slide in and out */}
      <div className={`mdrawer-bg ${mobileOpen ? 'open' : ''}`} onClick={closeMenu} aria-hidden="true" />
      <nav
        id="mnav"
        className={`mdrawer ${mobileOpen ? 'open' : ''}`}
        aria-label="Main menu"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div className="mdrawer-head">
          <Link href="/" className="mdrawer-logo" onClick={closeMenu} aria-label="TrueSpace Property home">
            <img src="/logo-prototype.webp" alt="TrueSpace Property" width={132} height={48} />
          </Link>
          <button type="button" className="mdrawer-x" onClick={closeMenu} aria-label="Close menu">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {isLoggedIn && (
          <div className="mdrawer-user">
            <div className="av">{session?.name ? session.name[0] : 'U'}</div>
            <div>
              <b>{session.name || 'User'}</b>
              <small>{ROLES[session?.role]?.label || 'Member'}</small>
            </div>
          </div>
        )}

        <div className="mdrawer-links">
          {MOBILE_LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? 'on' : ''}
              aria-current={pathname === href ? 'page' : undefined}
              onClick={closeMenu}
            >
              {label}
              <span aria-hidden="true">›</span>
            </Link>
          ))}
        </div>

        <div className="mdrawer-foot">
          {isLoggedIn ? (
            <>
              <Link href={dashboardHref} className="btn btn-n" onClick={closeMenu}>
                {ctaLabel} · {ROLES[session?.role]?.label || 'Buyer'}
              </Link>
              <button
                type="button"
                className="mdrawer-out"
                onClick={() => {
                  closeMenu();
                  handleLogout();
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-n" onClick={closeMenu}>
                Log in
              </Link>
              <Link href="/signup" className="btn btn-g" onClick={closeMenu}>
                Create an account
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
