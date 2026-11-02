'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import PrototypeHeader from '../components/prototype/PrototypeHeader';
import PrototypeFooter from '../components/prototype/PrototypeFooter';
import { getStore, setSessionRole, subscribeStore } from '../utils/prototypeStore';
import { ROLES, ROLE_FEATS } from '../utils/prototypeData';

export default function RolePage() {
  const router = useRouter();
  const [session, setSession] = useState({ role: 'buyer', name: 'Nusrat Jahan' });

  useEffect(() => {
    const update = () => {
      const { v3 } = getStore();
      if (v3?.session) setSession(v3.session);
    };
    update();
    return subscribeStore(update);
  }, []);

  const handlePick = (roleKey) => {
    setSessionRole(roleKey);
    if (roleKey === 'admin') {
      router.push('/dashboard?role=admin');
    } else {
      router.push(`/dashboard?role=${roleKey}`);
    }
  };

  const roleKeys = ['buyer', 'owner', 'agent'];

  return (
    <>
      <PrototypeHeader />
      <main>
        <div className="phead">
          <div className="wrap">
            <div className="crumb">
              <Link href="/">Home</Link> / <Link href="/login">Log in</Link> / Account Portals
            </div>
            <h1>Select Your Portal</h1>
            <p>
              Explore TrueSpace tailored to your property requirements. Switch portals anytime.
            </p>
          </div>
        </div>

        <div className="wrap rolegrid" style={{ marginTop: '28px', marginBottom: '28px' }}>
          {roleKeys.map((r) => {
            const roleInfo = ROLES[r] || {};
            const feats = ROLE_FEATS[r] || [];
            const isCurrent = session.role === r;

            return (
              <div key={r} className={`rcard ${r}`}>
                <div className="ric">
                  {r === 'buyer' ? '👤' : r === 'owner' ? '🔑' : '🤝'}
                </div>
                <h3>{roleInfo.label}</h3>
                <p>{roleInfo.desc}</p>
                <ul>
                  {feats.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
                <small>
                  Signs in as <b>{roleInfo.name}</b>
                </small>
                <button
                  type="button"
                  className={`btn ${r === 'admin' ? 'btn-n' : 'btn-o'} wide`}
                  style={{ width: '100%', marginTop: '14px' }}
                  onClick={() => handlePick(r)}
                >
                  {isCurrent ? 'Continue' : 'Enter'} as {roleInfo.label}
                </button>
                {isCurrent && <span className="tag g cur" style={{ marginTop: '8px' }}>Current role</span>}
              </div>
            );
          })}
        </div>

        <div className="wrap" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p className="alt tsx-admin-link">
            <button
              type="button"
              onClick={() => handlePick('admin')}
              style={{ background: 'none', border: 'none', color: 'var(--navy)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
            >
              TrueSpace team: admin sign-in →
            </button>
          </p>
        </div>
      </main>
      <PrototypeFooter />
    </>
  );
}
