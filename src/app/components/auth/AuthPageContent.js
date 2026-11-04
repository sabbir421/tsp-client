'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setSessionRole } from '../../utils/prototypeStore';
import { authApi } from '../../utils/api';
import { setAuth } from '../../store/slices/authSlice';
import { getSafeNextPath } from '../../utils/navigation';
import { USER_ROLES } from '../../constants';

const RESEND_INTERVAL = 60;
const SELLER_SIDE_ROLES = ['owner', 'rentgiver', 'agent', 'company', 'seller', USER_ROLES.SELLER_AGENT];
const IDENTITY_IDS = ['buyer', 'tenant', 'rentgiver', 'owner', 'agent', 'company'];

export default function AuthPageContent({ initialTab = 'login' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const queryTab = searchParams.get('tab');
  const [tab, setTab] = useState(queryTab === 'signup' ? 'signup' : initialTab);
  const queryRole = searchParams.get('role');
  const returnUrl = getSafeNextPath(searchParams.get('returnUrl') || searchParams.get('next'), '');

  // Login states
  // accountType: 'buyer' (Client Portal) or 'owner' (Seller Portal)
  const [loginAccountType, setLoginAccountType] = useState(SELLER_SIDE_ROLES.includes(queryRole) ? 'owner' : 'buyer');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginRemember, setLoginRemember] = useState(true);
  const [loginOtpStep, setLoginOtpStep] = useState(1);
  const [loginOtp, setLoginOtp] = useState('');
  const [loginTimer, setLoginTimer] = useState(0);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Signup states
  // identity options: 'buyer', 'tenant', 'rentgiver', 'owner', 'agent', 'company' (NO 'seller')
  const [suIdentity, setSuIdentity] = useState(() => {
    if (IDENTITY_IDS.includes(queryRole)) return queryRole;
    return SELLER_SIDE_ROLES.includes(queryRole) ? 'owner' : 'buyer';
  });
  const [suFullName, setSuFullName] = useState('');
  const [suCompany, setSuCompany] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suAgreed, setSuAgreed] = useState(true);
  const [suOtpStep, setSuOtpStep] = useState(1);
  const [suOtp, setSuOtp] = useState('');
  const [suTimer, setSuTimer] = useState(0);
  const [suLoading, setSuLoading] = useState(false);
  const [suError, setSuError] = useState('');
  const [suSuccess, setSuSuccess] = useState('');

  // Countdown timer for Login OTP
  useEffect(() => {
    let t = null;
    if (loginTimer > 0) {
      t = setInterval(() => setLoginTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(t);
  }, [loginTimer]);

  // Countdown timer for Signup OTP
  useEffect(() => {
    let t = null;
    if (suTimer > 0) {
      t = setInterval(() => setSuTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(t);
  }, [suTimer]);

  const handleSwitchTab = (newTab) => {
    setTab(newTab);
    setLoginError('');
    setLoginSuccess('');
    setSuError('');
    setSuSuccess('');
    // Optionally reflect in URL without full refresh
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('tab');
      const query = params.toString();
      const path = newTab === 'signup' ? '/signup' : '/login';
      window.history.replaceState(null, '', query ? `${path}?${query}` : path);
    }
  };

  /* ------------------- LOGIN FLOW ------------------- */
  const handleSendLoginOtp = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    const trimmed = loginPhone.trim();
    if (!trimmed) {
      setLoginError('Please enter your mobile number or email');
      return;
    }

    setLoginLoading(true);
    const backendRole = loginAccountType === 'buyer' ? USER_ROLES.BUYER_TENANT : USER_ROLES.SELLER_AGENT;

    try {
      // Try sending OTP through backend API
      const res = await authApi.sendLoginOtp({ identifier: trimmed, role: backendRole });
      const detected = res?.data?.detectedRole || res?.detectedRole;
      if (detected) {
        if (detected === USER_ROLES.SELLER_AGENT) {
          setLoginAccountType('owner');
        } else if (detected === USER_ROLES.BUYER_TENANT) {
          setLoginAccountType('buyer');
        }
      }
      setLoginSuccess('OTP has been sent to your registered mobile number.');
      setLoginOtpStep(2);
      setLoginTimer(RESEND_INTERVAL);
    } catch (err) {
      console.log('OTP send error:', err.message);
      setLoginError(err.message || 'Failed to send OTP');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    const trimmedCode = loginOtp.trim();
    if (!trimmedCode || trimmedCode.length !== 6) {
      setLoginError('Please enter a valid 6-digit OTP code');
      return;
    }

    setLoginLoading(true);
    const backendRole = loginAccountType === 'buyer' ? USER_ROLES.BUYER_TENANT : USER_ROLES.SELLER_AGENT;
    let authUser = null;
    let authToken = null;

    try {
      const res = await authApi.loginWithOtp({
        identifier: loginPhone.trim(),
        otpCode: trimmedCode,
        role: backendRole,
      });
      if (res?.data?.user) {
        authUser = res.data.user;
        authToken = res.data.token;
      }
    } catch (err) {
      console.log('Backend OTP error:', err.message);
      setLoginError(err.message || 'Invalid OTP code');
      setLoginLoading(false);
      return;
    }

    // Determine effective role: server user role wins if available
    const isSeller = authUser?.role === USER_ROLES.SELLER_AGENT || (!authUser && loginAccountType === 'owner');
    const sessionRole = isSeller ? 'owner' : 'buyer';
    const userName = authUser?.fullName || authUser?.name || (sessionRole === 'buyer' ? 'Buyer User' : 'Seller User');
    const userEmail = authUser?.email || '';

    setSessionRole(sessionRole, {
      name: userName,
      phone: loginPhone.trim(),
      email: userEmail,
      identity: sessionRole,
      isLoggedIn: true,
    });

    if (!authToken || !authUser) {
      setLoginError('Login failed. Please try again.');
      setLoginLoading(false);
      return;
    }
    dispatch(setAuth({ token: authToken, user: authUser }));

    setLoginLoading(false);
    router.push(returnUrl || '/dashboard');
  };

  /* ------------------- SIGNUP FLOW ------------------- */
  const handleSendSignupOtp = async (e) => {
    if (e) e.preventDefault();
    setSuError('');
    setSuSuccess('');

    if (!suFullName.trim()) {
      setSuError('Please enter your full name');
      return;
    }
    if (suIdentity === 'company' && !suCompany.trim()) {
      setSuError('Please enter your company name');
      return;
    }
    if (!suPhone.trim()) {
      setSuError('Please enter your mobile number');
      return;
    }
    if (!suAgreed) {
      setSuError('Please agree to the Terms and Privacy Policy to proceed');
      return;
    }

    setSuLoading(true);
    const isBuyerSide = suIdentity === 'buyer' || suIdentity === 'tenant';
    const backendRole = isBuyerSide ? USER_ROLES.BUYER_TENANT : USER_ROLES.SELLER_AGENT;

    try {
      await authApi.sendRegistrationOtp({
        phone: suPhone.trim(),
        countryCode: '+880',
        email: suEmail.trim() || undefined,
        role: backendRole,
      });
      setSuSuccess(`OTP has been sent to ${suPhone.trim()}.`);
      setSuOtpStep(2);
      setSuTimer(RESEND_INTERVAL);
    } catch (err) {
      setSuError(err.message || 'Failed to send OTP');
    } finally {
      setSuLoading(false);
    }
  };

  const handleVerifySignupOtp = async (e) => {
    if (e) e.preventDefault();
    setSuError('');
    setSuSuccess('');

    const trimmedCode = suOtp.trim();
    if (!trimmedCode || trimmedCode.length !== 6) {
      setSuError('Please enter a valid 6-digit OTP code');
      return;
    }

    setSuLoading(true);
    const isBuyerSide = suIdentity === 'buyer' || suIdentity === 'tenant';
    const backendRole = isBuyerSide ? USER_ROLES.BUYER_TENANT : USER_ROLES.SELLER_AGENT;
    let authUser = null;
    let authToken = null;

    try {
      const res = await authApi.register({
        fullName: suFullName.trim(),
        phone: suPhone.trim(),
        countryCode: '+880',
        email: suEmail.trim() || `${suPhone.replace(/\D/g, '')}@truespace.com`,
        role: backendRole,
        otpCode: trimmedCode,
      });
      if (res?.data?.user) {
        authUser = res.data.user;
        authToken = res.data.token;
      }
    } catch (err) {
      setSuError(err.message || 'Registration failed');
      setSuLoading(false);
      return;
    }

    if (!authToken || !authUser) {
      setSuError('Registration failed. Please try again.');
      setSuLoading(false);
      return;
    }

    // Determine target portal:
    // Tenant & Buyer -> Client Portal ('buyer')
    // Agent, Company, Rent Giver, Owner -> Seller Portal ('owner')
    const sessionRole = isBuyerSide ? 'buyer' : 'owner';

    setSessionRole(sessionRole, {
      name: suFullName.trim(),
      phone: suPhone.trim(),
      email: suEmail.trim() || `${suIdentity}.user@example.com`,
      identity: suIdentity,
      company: suCompany.trim(),
      isLoggedIn: true,
    });

    dispatch(setAuth({ token: authToken, user: authUser }));

    setSuLoading(false);
    router.push(returnUrl || '/dashboard');
  };

  // Identities for Create Account (SELLER EXCLUDED as instructed: "seller role ta dorkar nai")
  const identities = [
    {
      id: 'buyer',
      title: 'Buyer',
      desc: 'I want to buy a property',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      ),
      portal: 'client',
    },
    {
      id: 'tenant',
      title: 'Tenant',
      desc: 'I want to rent a home or space',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2l-2 2m-1-1l-3 3m5 5l-7 7H3v-7l7-7m7 7l3 3"/>
        </svg>
      ),
      portal: 'client',
    },
    {
      id: 'rentgiver',
      title: 'Rent Giver',
      desc: 'I want to rent out a property',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z"/><circle cx="12" cy="13" r="2"/>
        </svg>
      ),
      portal: 'seller',
    },
    {
      id: 'owner',
      title: 'Owner',
      desc: 'I own property to sell or rent out',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 22v-4h6v4M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01"/>
        </svg>
      ),
      portal: 'seller',
    },
    {
      id: 'agent',
      title: 'Agent',
      desc: 'I work for buyers, sellers or landlords',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      portal: 'seller',
    },
    {
      id: 'company',
      title: 'Company',
      desc: 'A developer, agency or business',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h6M9 13h6M9 17h6"/>
        </svg>
      ),
      portal: 'seller',
    },
  ];

  const selectedIdentity = identities.find((item) => item.id === suIdentity) || identities[0];
  const signupPortalLabel = selectedIdentity.portal === 'client' ? 'Buyer / Tenant portal' : 'Seller / Rent Giver portal';

  return (
    <div style={{ backgroundColor: '#f4f6fb', minHeight: 'calc(100vh - 68px)', padding: '36px 16px 56px' }}>
      <div className="auth" style={{ maxWidth: '1060px', margin: '0 auto' }}>
        {/* LEFT ASIDE */}
        <aside className="aside">
          <div>
            <img
              src="/logo-prototype.webp"
              alt="TrueSpace Property"
              style={{
                width: '148px',
                height: 'auto',
                backgroundColor: 'transparent',
                borderRadius: '0',
                marginBottom: '26px',
                display: 'block',
              }}
            />
            {tab === 'login' ? (
              <>
                <h2>Property matching that respects your privacy</h2>
                <ul>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f2961d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Post a requirement once, get verified matches</span>
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f2961d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Numbers stay hidden until both sides accept</span>
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f2961d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>0% commission during our launch period</span>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <h2>Tell us what you need once. We&apos;ll do the searching.</h2>
                <ul>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f2961d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Buyers and tenants post requirements for free</span>
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f2961d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Sellers and rent givers list free during our launch period</span>
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f2961d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Verified badge after a simple document check</span>
                  </li>
                </ul>
              </>
            )}
          </div>
          <div className="demoTag">
            Privacy-first · mobile OTP system
          </div>
        </aside>

        {/* RIGHT CARD */}
        <section className="acard">
          <div className="eyebrow">TRUESPACE ACCOUNT</div>
          <h1 style={{ marginBottom: '14px' }}>{tab === 'login' ? 'Welcome back' : 'Join TrueSpace'}</h1>

          {/* TWO-TAB TOGGLE (.jsw) */}
          <div className="jsw" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'login'}
              className={tab === 'login' ? 'on' : ''}
              onClick={() => handleSwitchTab('login')}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'signup'}
              className={tab === 'signup' ? 'on' : ''}
              onClick={() => handleSwitchTab('signup')}
            >
              Create account
            </button>
          </div>

          {/* ===================== TAB 1: LOG IN ===================== */}
          {tab === 'login' && (
            <div>
              <p className="sub" style={{ marginBottom: '16px' }}>
                Choose your account type, then sign in.
              </p>

              {/* Account Type Selector Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                {/* Buyer / Tenant -> Client Portal */}
                <button
                  type="button"
                  onClick={() => setLoginAccountType('buyer')}
                  style={{
                    border: loginAccountType === 'buyer' ? '2px solid #f2961d' : '1.5px solid var(--line)',
                    backgroundColor: loginAccountType === 'buyer' ? '#fff9f2' : '#ffffff',
                    boxShadow: loginAccountType === 'buyer' ? '0 0 0 3px rgba(242, 150, 29, 0.15)' : 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#fef3e7',
                      color: '#f2961d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <b style={{ color: 'var(--navy)', fontSize: '15px', marginBottom: '3px', display: 'block' }}>
                    Buyer / Tenant
                  </b>
                  <small style={{ color: 'var(--mut)', fontSize: '12px' }}>
                    Buyer · Tenant
                  </small>
                </button>

                {/* Seller / Rent Giver -> Seller Portal */}
                <button
                  type="button"
                  onClick={() => setLoginAccountType('owner')}
                  style={{
                    border: loginAccountType === 'owner' ? '2px solid #f2961d' : '1.5px solid var(--line)',
                    backgroundColor: loginAccountType === 'owner' ? '#fff9f2' : '#ffffff',
                    boxShadow: loginAccountType === 'owner' ? '0 0 0 3px rgba(242, 150, 29, 0.15)' : 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#fef3e7',
                      color: '#f2961d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z"/><path d="M9 21v-7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7"/>
                    </svg>
                  </div>
                  <b style={{ color: 'var(--navy)', fontSize: '15px', marginBottom: '3px', display: 'block' }}>
                    Seller / Rent Giver
                  </b>
                  <small style={{ color: 'var(--mut)', fontSize: '12px' }}>
                    Rent Giver · Owner · Agent · Company
                  </small>
                </button>
              </div>

              {loginError && (
                <div className="note" style={{ color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', marginBottom: '14px', borderRadius: '8px', padding: '10px 14px', fontSize: '13.5px' }}>
                  {loginError}
                </div>
              )}
              {loginSuccess && (
                <div className="note" style={{ color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: '14px', borderRadius: '8px', padding: '10px 14px', fontSize: '13.5px' }}>
                  {loginSuccess}
                </div>
              )}

              {/* Login Step 1: Mobile Number Input */}
              {loginOtpStep === 1 ? (
                <form onSubmit={handleSendLoginOtp} noValidate>
                  <div className="frow one" style={{ marginBottom: '14px' }}>
                    <div className="fl">
                      <label htmlFor="loginPhone">Mobile number or email</label>
                      <input
                        type="text"
                        id="loginPhone"
                        placeholder={loginAccountType === 'buyer' ? '017XXXXXXXX or buyer@example.com' : '018XXXXXXXX or seller@example.com'}
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>

                  <label className="chk2" style={{ marginBottom: '18px' }}>
                    <input
                      type="checkbox"
                      checked={loginRemember}
                      onChange={(e) => setLoginRemember(e.target.checked)}
                    />
                    Keep me signed in on this device
                  </label>

                  <button
                    className="btn btn-o wide"
                    type="submit"
                    disabled={loginLoading}
                    style={{ width: '100%', height: '46px', fontSize: '15px', fontWeight: '700' }}
                  >
                    {loginLoading
                      ? 'Sending OTP...'
                      : `Log in as ${loginAccountType === 'buyer' ? 'Buyer / Tenant' : 'Seller / Rent Giver'}`}
                  </button>
                </form>
              ) : (
                /* Login Step 2: 6-Digit OTP Verification */
                <form onSubmit={handleVerifyLoginOtp} noValidate>
                  <div className="note" style={{ marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', fontSize: '13.5px', border: '1px solid var(--line)' }}>
                    A 6-digit verification code was sent to the mobile number registered for <b>{loginPhone}</b>
                  </div>

                  <div className="frow one" style={{ marginBottom: '14px' }}>
                    <div className="fl">
                      <label htmlFor="loginOtpCode">Enter 6-digit OTP code <span className="req">*</span></label>
                      <input
                        type="text"
                        id="loginOtpCode"
                        placeholder="e.g. 123456"
                        maxLength={6}
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                        autoFocus
                        style={{ fontSize: '18px', letterSpacing: '4px', textAlign: 'center', fontWeight: '700' }}
                      />
                    </div>
                  </div>

                  <button
                    className="btn btn-o wide"
                    type="submit"
                    disabled={loginLoading}
                    style={{ width: '100%', height: '46px', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}
                  >
                    {loginLoading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setLoginOtpStep(1)}
                      style={{ background: 'none', border: 'none', color: 'var(--navy)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                    >
                      ← Change mobile number
                    </button>

                    <button
                      type="button"
                      onClick={handleSendLoginOtp}
                      disabled={loginTimer > 0 || loginLoading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: loginTimer > 0 ? 'var(--mut)' : 'var(--orange2)',
                        cursor: loginTimer > 0 ? 'default' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}
                    >
                      {loginTimer > 0 ? `Resend OTP (${loginTimer}s)` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}

              <p className="alt" style={{ marginTop: '22px' }}>
                New to TrueSpace?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchTab('signup')}
                  style={{ background: 'none', border: 'none', color: 'var(--orange2)', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                >
                  Create an account
                </button>
              </p>

              <p className="fine" style={{ marginTop: '16px' }}>
                Your information is kept secure and private. Never share your verification code with anyone.
              </p>
            </div>
          )}

          {/* ===================== TAB 2: CREATE ACCOUNT ===================== */}
          {tab === 'signup' && (
            <div>
              <h2 style={{ fontSize: '20px', color: 'var(--navy)', margin: '0 0 4px', fontWeight: '700' }}>
                Who are you registering as?
              </h2>
              <p className="sub" style={{ marginBottom: '16px' }}>
                Choose one (required). It shows on your profile and decides which portal you get.
              </p>

              {/* 6 Identity Selection Cards Grid (Seller is omitted!) */}
              <div
                className="rpick tsx-idp"
                role="radiogroup"
                aria-label="Your identity"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '8px',
                  marginBottom: '18px',
                }}
              >
                {identities.map((item) => {
                  const isSelected = suIdentity === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSuIdentity(item.id)}
                      className={isSelected ? 'on' : ''}
                      style={{
                        textAlign: 'left',
                        border: isSelected ? '2px solid #f2961d' : '1.5px solid var(--line)',
                        backgroundColor: isSelected ? '#fff9f2' : '#ffffff',
                        boxShadow: isSelected ? '0 0 0 3px rgba(242, 150, 29, 0.15)' : 'none',
                        borderRadius: '12px',
                        padding: '12px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        minHeight: '76px',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#f2961d' }}>{item.icon}</span>
                        <b style={{ color: 'var(--navy)', fontSize: '13.5px' }}>{item.title}</b>
                      </div>
                      <small style={{ color: 'var(--mut)', fontSize: '11.5px', lineHeight: '1.25' }}>
                        {item.desc}
                      </small>
                    </button>
                  );
                })}
              </div>

              <div className="regrole" aria-live="polite">
                <span>Registering as</span>
                <b>{selectedIdentity.title}</b>
                <small>{signupPortalLabel}</small>
              </div>

              {suError && (
                <div className="note" style={{ color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', marginBottom: '14px', borderRadius: '8px', padding: '10px 14px', fontSize: '13.5px' }}>
                  {suError}
                </div>
              )}
              {suSuccess && (
                <div className="note" style={{ color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: '14px', borderRadius: '8px', padding: '10px 14px', fontSize: '13.5px' }}>
                  {suSuccess}
                </div>
              )}

              {/* Signup Step 1: Details Input */}
              {suOtpStep === 1 ? (
                <form onSubmit={handleSendSignupOtp} noValidate>
                  <div className="frow one" style={{ marginBottom: '12px' }}>
                    <div className="fl">
                      <label htmlFor="suName">Full name <span className="req">*</span></label>
                      <input
                        type="text"
                        id="suName"
                        placeholder="e.g. Nusrat Jahan"
                        value={suFullName}
                        onChange={(e) => setSuFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Company/Agency name row if agent or company */}
                  {(suIdentity === 'company' || suIdentity === 'agent') && (
                    <div className="frow one" style={{ marginBottom: '12px' }}>
                      <div className="fl">
                        <label htmlFor="suCo">
                          {suIdentity === 'agent' ? 'Agency / company name (optional)' : 'Company name'} <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          id="suCo"
                          placeholder={suIdentity === 'agent' ? 'e.g. Prime Realty Ltd.' : 'e.g. Northline Developers Ltd.'}
                          value={suCompany}
                          onChange={(e) => setSuCompany(e.target.value)}
                          required={suIdentity === 'company'}
                        />
                      </div>
                    </div>
                  )}

                  <div className="frow" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div className="fl">
                      <label htmlFor="suMob">Mobile number <span className="req">*</span></label>
                      <input
                        type="tel"
                        id="suMob"
                        placeholder="01XXXXXXXXX"
                        value={suPhone}
                        onChange={(e) => setSuPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="fl">
                      <label htmlFor="suEmail">Email <span className="opt">(optional)</span></label>
                      <input
                        type="email"
                        id="suEmail"
                        placeholder="you@example.com"
                        value={suEmail}
                        onChange={(e) => setSuEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <label className="chk2" style={{ marginBottom: '18px' }}>
                    <input
                      type="checkbox"
                      id="suTerms"
                      checked={suAgreed}
                      onChange={(e) => setSuAgreed(e.target.checked)}
                    />
                    I agree to the Terms and Privacy Policy
                  </label>

                  <button
                    className="btn btn-o wide"
                    type="submit"
                    disabled={suLoading}
                    style={{ width: '100%', height: '46px', fontSize: '15px', fontWeight: '700' }}
                  >
                    {suLoading ? 'Sending OTP...' : `Register as ${selectedIdentity.title}`}
                  </button>
                </form>
              ) : (
                /* Signup Step 2: 6-Digit OTP Verification */
                <form onSubmit={handleVerifySignupOtp} noValidate>
                  <div className="note" style={{ marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', fontSize: '13.5px', border: '1px solid var(--line)' }}>
                    We&apos;ve sent a 6-digit OTP code to <b>{suPhone}</b>
                  </div>

                  <div className="frow one" style={{ marginBottom: '14px' }}>
                    <div className="fl">
                      <label htmlFor="suOtpCode">Enter 6-digit OTP code <span className="req">*</span></label>
                      <input
                        type="text"
                        id="suOtpCode"
                        placeholder="e.g. 123456"
                        maxLength={6}
                        value={suOtp}
                        onChange={(e) => setSuOtp(e.target.value.replace(/\D/g, ''))}
                        autoFocus
                        style={{ fontSize: '18px', letterSpacing: '4px', textAlign: 'center', fontWeight: '700' }}
                      />
                    </div>
                  </div>

                  <button
                    className="btn btn-o wide"
                    type="submit"
                    disabled={suLoading}
                    style={{ width: '100%', height: '46px', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}
                  >
                    {suLoading ? 'Creating Account...' : `Verify & Register as ${selectedIdentity.title}`}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSuOtpStep(1)}
                      style={{ background: 'none', border: 'none', color: 'var(--navy)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                    >
                      ← Edit details
                    </button>

                    <button
                      type="button"
                      onClick={handleSendSignupOtp}
                      disabled={suTimer > 0 || suLoading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: suTimer > 0 ? 'var(--mut)' : 'var(--orange2)',
                        cursor: suTimer > 0 ? 'default' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}
                    >
                      {suTimer > 0 ? `Resend OTP (${suTimer}s)` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}

              <p className="alt" style={{ marginTop: '20px' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchTab('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--orange2)', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                >
                  Log in
                </button>
              </p>

              <p className="fine" style={{ marginTop: '16px' }}>
                Admin accounts can&apos;t be created through sign-up: only the super admin adds team members. New accounts and verification documents stay Pending until the super admin approves them, and you can use TrueSpace normally meanwhile.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

