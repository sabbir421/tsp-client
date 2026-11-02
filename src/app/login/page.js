'use client';

import { Suspense } from 'react';
import PrototypeHeader from '../components/prototype/PrototypeHeader';
import PrototypeFooter from '../components/prototype/PrototypeFooter';
import AuthPageContent from '../components/auth/AuthPageContent';

export default function LoginPage() {
  return (
    <>
      <PrototypeHeader />
      <main>
        <Suspense fallback={<div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: '#64748b' }}>Loading...</div>}>
          <AuthPageContent initialTab="login" />
        </Suspense>
      </main>
      <PrototypeFooter />
    </>
  );
}
