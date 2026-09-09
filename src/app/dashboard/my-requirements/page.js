import { Suspense } from 'react';
import MyRequirementsPage from '../../components/dashboard/MyRequirementsPage';

function LoadingFallback() {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading your requirements...
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MyRequirementsPage />
    </Suspense>
  );
}
