'use client';

import { useState } from 'react';
import Link from 'next/link';
import PrototypeHeader from '../components/prototype/PrototypeHeader';
import PrototypeFooter from '../components/prototype/PrototypeFooter';
import Toast, { showToast } from '../components/prototype/Toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    showToast('✓ Message sent! The TrueSpace team will contact you shortly.');
  };

  return (
    <>
      <PrototypeHeader />
      <Toast />

      <div className="phead">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / <span>Contact</span>
          </div>
          <h1>Contact TrueSpace Property</h1>
          <p>Get in touch with our Dhaka team for verification assistance, listing support, or feedback.</p>
        </div>
      </div>

      <div className="wrap" style={{ padding: '40px 20px', maxWidth: '960px' }}>
        <div className="grid2">
          <div className="fcard">
            {sent ? (
              <div className="ok">
                <div className="tick">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h3>Thank you for reaching out</h3>
                <p>We have received your message and will respond within 24 hours.</p>
                <button type="button" className="btn btn-g btn-sm" onClick={() => setSent(false)}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ margin: '0 0 16px', color: 'var(--navy)' }}>Send us a message</h3>

                <div className="fl" style={{ marginBottom: '14px' }}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arif Hossain"
                  />
                </div>

                <div className="fl" style={{ marginBottom: '14px' }}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="fl" style={{ marginBottom: '14px' }}>
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                  />
                </div>

                <div className="fl" style={{ marginBottom: '18px' }}>
                  <label>Your Message / Question</label>
                  <textarea
                    required
                    rows={4}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Tell us what you need help with..."
                  />
                </div>

                <button type="submit" className="btn btn-o" style={{ width: '100%' }}>
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>

          <div>
            <div className="fcard" style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 14px', color: 'var(--navy)' }}>Dhaka Headquarters</h3>
              <p style={{ color: 'var(--ink)', lineHeight: '1.7', margin: '0 0 16px' }}>
                TrueSpace Property Limited<br />
                Road 11, Banani<br />
                Dhaka 1213, Bangladesh
              </p>
              <div style={{ display: 'grid', gap: '8px', fontSize: '14px', color: 'var(--mut)' }}>
                <div>📧 support@truespaceproperty.com</div>
                <div>📞 +880 1700-000000 (Mon–Fri, 9am–6pm)</div>
                <div>🕒 Document verification team: 24/7 review queue</div>
              </div>
            </div>

            <div className="note">
              <b>Owner Verification Support:</b> Need help verifying your ownership papers or getting the Verified Owner badge? You can also upload your dolil and NID directly in your <Link href="/dashboard?role=owner&tab=verify" style={{ color: 'var(--orange)', textDecoration: 'underline' }}>Seller Dashboard</Link>.
            </div>
          </div>
        </div>
      </div>

      <PrototypeFooter />
    </>
  );
}
