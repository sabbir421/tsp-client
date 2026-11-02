'use client';

import Link from 'next/link';
import PrototypeHeader from '../components/prototype/PrototypeHeader';
import PrototypeFooter from '../components/prototype/PrototypeFooter';

export default function AboutPage() {
  return (
    <>
      <PrototypeHeader />

      <div className="about-hero">
        <div className="wrap">
          <div className="eyebrow" style={{ color: 'var(--orange)' }}>About TrueSpace Property</div>
          <h1 style={{ fontSize: '38px', color: '#fff', margin: '10px 0' }}>Rebuilding Dhaka real estate on trust and privacy</h1>
          <p style={{ color: '#c3cbe0', fontSize: '17px', maxWidth: '720px' }}>
            We started TrueSpace Property with a simple conviction: Dhaka homebuyers, tenants, and honest property owners deserve a clean, spam-free marketplace.
          </p>
        </div>
      </div>

      <div className="wrap" style={{ padding: '40px 20px', maxWidth: '960px' }}>
        <div className="grid2" style={{ marginBottom: '32px' }}>
          <div className="fcard">
            <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>The Problem We Solve</h3>
            <p style={{ color: 'var(--ink)', lineHeight: '1.7' }}>
              Finding a flat in Dhaka traditionally requires calling dozens of numbers listed on street banners or noisy social media groups. You get dozens of unwanted calls from brokers pushing properties you never asked for, while genuine owners struggle to find verified buyers.
            </p>
          </div>

          <div className="fcard">
            <h3 style={{ color: 'var(--navy)', marginTop: 0 }}>The TrueSpace Solution</h3>
            <p style={{ color: 'var(--ink)', lineHeight: '1.7' }}>
              Requirement-first matching. Buyers specify what they want once. Owners and agents send verified properties that strictly match those constraints. Numbers stay hidden until both parties decide to connect.
            </p>
          </div>
        </div>

        <div className="fcard" style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--navy)', marginTop: 0 }}>Our Core Principles</h2>
          <div className="grid3" style={{ marginTop: '20px' }}>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
              <h4 style={{ margin: '0 0 6px', color: 'var(--navy)' }}>Privacy by Default</h4>
              <p style={{ color: 'var(--mut)', fontSize: '13.5px', margin: 0 }}>
                No public phone numbers. Zero unsolicited marketing.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
              <h4 style={{ margin: '0 0 6px', color: 'var(--navy)' }}>Document Validation</h4>
              <p style={{ color: 'var(--mut)', fontSize: '13.5px', margin: 0 }}>
                Every verified badge requires inspection of ownership dolil, mutation, and tax receipts.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
              <h4 style={{ margin: '0 0 6px', color: 'var(--navy)' }}>Zero Broker Commission</h4>
              <p style={{ color: 'var(--mut)', fontSize: '13.5px', margin: 0 }}>
                Direct peer-to-peer connection with 0% commission during our Dhaka pilot.
              </p>
            </div>
          </div>
        </div>

        <div className="bdopen">
          <div>
            <h3>Join our Dhaka community</h3>
            <p style={{ color: 'var(--mut)', margin: '4px 0 16px' }}>
              Whether you are looking to rent a 3-bed flat or list an apartment in Gulshan or Uttara, TrueSpace brings transparency to your search.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/requirement" className="btn btn-o">
                Post your requirement
              </Link>
              <Link href="/list" className="btn btn-n">
                List a property
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PrototypeFooter />
    </>
  );
}
