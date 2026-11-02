'use client';

import Link from 'next/link';
import PrototypeHeader from '../components/prototype/PrototypeHeader';
import PrototypeFooter from '../components/prototype/PrototypeFooter';

export default function HowMatchingWorksPage() {
  return (
    <>
      <PrototypeHeader />

      <div className="phead">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / <span>How matching works</span>
          </div>
          <h1>How TrueSpace Matching Works</h1>
          <p>
            Understanding our 100-point compatibility score, privacy controls, and direct connect workflow.
          </p>
        </div>
      </div>

      <div className="wrap" style={{ padding: '36px 20px', maxWidth: '860px' }}>
        <div className="fcard" style={{ marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--navy)', marginTop: 0 }}>The 100-Point Matching Algorithm</h2>
          <p style={{ color: 'var(--ink)', lineHeight: '1.7' }}>
            Traditional classified sites display lists of listings ranked by sponsored fees. TrueSpace evaluates every active Dhaka listing against your explicit requirement across 5 objective dimensions:
          </p>

          <div style={{ display: 'grid', gap: '16px', margin: '20px 0' }}>
            <div style={{ padding: '14px 18px', background: '#f6f7fb', borderRadius: '12px' }}>
              <b style={{ color: 'var(--navy)', fontSize: '15px' }}>1. Location & Neighbourhood (30 Points)</b>
              <p style={{ margin: '4px 0 0', color: 'var(--mut)', fontSize: '13.5px' }}>
                Full 30 points if the property is located in one of your selected sectors or areas. 12 points if it is within the same Dhaka municipal zone (e.g., Banani for a Gulshan search).
              </p>
            </div>

            <div style={{ padding: '14px 18px', background: '#f6f7fb', borderRadius: '12px' }}>
              <b style={{ color: 'var(--navy)', fontSize: '15px' }}>2. Target Budget Alignment (30 Points)</b>
              <p style={{ margin: '4px 0 0', color: 'var(--mut)', fontSize: '13.5px' }}>
                30 points if price falls squarely within your min–max range. 24 points if below minimum (saving you money). 15 points if within 10% negotiable tolerance.
              </p>
            </div>

            <div style={{ padding: '14px 18px', background: '#f6f7fb', borderRadius: '12px' }}>
              <b style={{ color: 'var(--navy)', fontSize: '15px' }}>3. Property Type Match (15 Points)</b>
              <p style={{ margin: '4px 0 0', color: 'var(--mut)', fontSize: '13.5px' }}>
                15 points when category matches exactly (Apartment, Duplex, Independent House, or Land Plot).
              </p>
            </div>

            <div style={{ padding: '14px 18px', background: '#f6f7fb', borderRadius: '12px' }}>
              <b style={{ color: 'var(--navy)', fontSize: '15px' }}>4. Bedroom Count (15 Points)</b>
              <p style={{ margin: '4px 0 0', color: 'var(--mut)', fontSize: '13.5px' }}>
                15 points if the property has at least the number of bedrooms specified. 7 points if exactly 1 bedroom fewer.
              </p>
            </div>

            <div style={{ padding: '14px 18px', background: '#f6f7fb', borderRadius: '12px' }}>
              <b style={{ color: 'var(--navy)', fontSize: '15px' }}>5. Minimum Square Footage (10 Points)</b>
              <p style={{ margin: '4px 0 0', color: 'var(--mut)', fontSize: '13.5px' }}>
                10 points when the property meets or exceeds your required living space.
              </p>
            </div>
          </div>

          <div className="note">
            Properties with a total score of <b>55% or higher</b> appear on your Match Results feed, sorted by highest compatibility.
          </div>
        </div>

        <div className="fcard">
          <h2 style={{ color: 'var(--navy)', marginTop: 0 }}>Privacy & Direct Unlock Protocol</h2>
          <p style={{ color: 'var(--ink)', lineHeight: '1.7' }}>
            We solve the single biggest problem with property portals in Bangladesh: unwanted spam.
          </p>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#46506b' }}>
            <li>Your mobile phone number is <b>never visible</b> to anyone on the public website.</li>
            <li>Property owners cannot view your phone number when submitting a property match.</li>
            <li>You only share your contact once you choose to <b>Accept</b> a match or schedule a private site viewing slot.</li>
            <li>If you decline a match, the owner is politely informed without revealing your identity.</li>
          </ul>

          <div style={{ marginTop: '24px' }}>
            <Link href="/requirement" className="btn btn-o">
              Post your requirement now →
            </Link>
          </div>
        </div>
      </div>

      <PrototypeFooter />
    </>
  );
}
