'use client';

import Link from 'next/link';

export default function PrototypeFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div>
            <Link href="/" className="flogo" aria-label="TrueSpace Property home">
              <img src="/logo-prototype.webp" width="138" height="46" alt="TrueSpace Property" style={{ height: '46px', width: 'auto' }} />
            </Link>
            <p style={{ maxWidth: '320px', color: '#aab3cc', fontSize: '13.5px', marginTop: '10px' }}>
              Privacy-first property matching across Dhaka City. Post what you need and get scored matches from verified owners.
            </p>
          </div>

          <div>
            <h5>Neighbourhoods</h5>
            <Link href="/discover?q=Uttara">Uttara sectors</Link>
            <Link href="/discover?q=Gulshan">Gulshan & Banani</Link>
            <Link href="/discover?q=Dhanmondi">Dhanmondi</Link>
            <Link href="/discover?q=Bashundhara">Bashundhara R/A</Link>
            <Link href="/discover?q=Mirpur">Mirpur</Link>
          </div>

          <div>
            <h5>Portals</h5>
            <Link href="/dashboard?role=buyer">Buyer / Tenant Portal</Link>
            <Link href="/dashboard?role=owner">Seller / Owner Portal</Link>
            <Link href="/dashboard?role=admin">Admin Panel</Link>
            <Link href="/role-select">Account Type Selection</Link>
            <Link href="/login">Account Log in</Link>
          </div>

          <div>
            <h5>Platform</h5>
            <Link href="/how">How matching works</Link>
            <Link href="/about">About TrueSpace</Link>
            <Link href="/contact">Contact & support</Link>
            <Link href="/blog">Real estate blog</Link>
            <span style={{ display: 'block', marginTop: '10px', fontSize: '12.5px', color: 'var(--orange)' }}>
              Pilot · 0% commission
            </span>
          </div>
        </div>

        <div className="copy">
          © 2026 TrueSpace Property · Privacy-first property matching in Dhaka City. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
