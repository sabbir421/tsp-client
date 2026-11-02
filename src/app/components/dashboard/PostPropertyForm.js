'use client';

import Link from 'next/link';
import ListPropertyWizard from './ListPropertyWizard';
import styles from './postProperty.module.css';

export default function PostPropertyForm() {
  return (
    <div style={{ padding: '24px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', color: 'var(--mut)', marginBottom: '4px' }}>
          <Link href="/dashboard?role=owner" style={{ color: 'var(--orange)', textDecoration: 'none' }}>
            Dashboard
          </Link>{' '}
          / List a Property
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--navy)', margin: 0 }}>
          List Your Property Privately
        </h1>
        <p style={{ color: 'var(--mut)', fontSize: '14px', margin: '4px 0 0' }}>
          9-step verified submission for Dhaka City properties. Photos and documents are securely uploaded to AWS S3.
        </p>
      </div>

      <ListPropertyWizard />
    </div>
  );
}
