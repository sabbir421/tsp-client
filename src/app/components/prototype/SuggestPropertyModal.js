'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { propertyApi, matchApi } from '../../utils/api';
import { money, locTxt } from '../../utils/prototypeData';
import { showToast } from './Toast';

export default function SuggestPropertyModal({ requirement, isOpen, onClose, onSuccess }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropId, setSelectedPropId] = useState('');
  const [sellerNote, setSellerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !requirement) return;

    let mounted = true;
    setLoading(true);

    propertyApi
      .getMine()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setProperties(list);
        const approved = list.filter((p) => p.status === 'verified' || p.status === 'approved' || p.verified === true);
        if (approved.length > 0) {
          setSelectedPropId(String(approved[0].id));
        }
      })
      .catch(() => {
        if (mounted) setProperties([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, requirement]);

  if (!isOpen || !requirement) return null;

  const ok = properties.filter((p) => p.status === 'verified' || p.status === 'approved' || p.verified === true);
  const wait = properties.filter((p) => !(p.status === 'verified' || p.status === 'approved' || p.verified === true));

  const reqTitle =
    requirement.title ||
    `${requirement.bedrooms ? `${requirement.bedrooms}-bed ` : ''}${
      requirement.subType || requirement.type || 'Property'
    } to ${requirement.purpose || 'buy'}`;
  const reqLoc =
    requirement.sector ||
    requirement.area ||
    (requirement.areas ? requirement.areas.map(locTxt).join(', ') : 'Dhaka');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPropId) {
      showToast('Please select an approved property');
      return;
    }

    setSubmitting(true);
    try {
      await matchApi.send({
        requirementId: requirement.id,
        propertyId: Number(selectedPropId),
        sellerNote: sellerNote.trim(),
      });
      showToast('✓ Suggestion sent. It is now in the buyer’s dashboard');
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Could not send suggestion'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal open" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="mbox" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <button type="button" className="x" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h3 style={{ margin: '0 0 6px', color: 'var(--navy)' }}>Suggest Property</h3>
        <p style={{ color: 'var(--mut)', margin: '0 0 14px', fontSize: '13.5px' }}>
          For REQ-{requirement.id} · {reqTitle} · {reqLoc}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--mut)', fontSize: '13.5px' }}>
            Checking your approved properties...
          </div>
        ) : !ok.length ? (
          <div>
            <p style={{ color: 'var(--mut)', fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px' }}>
              You have no admin-approved property yet. A property must be approved by TrueSpace before it can be suggested.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link className="btn btn-o" href="/list" onClick={onClose}>
                Submit a property
              </Link>
              <Link className="btn btn-g" href="/dashboard?role=owner" onClick={onClose}>
                My dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="jfl" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13.5px', marginBottom: '6px' }}>
                Your approved property
              </label>
              <select
                value={selectedPropId}
                onChange={(e) => setSelectedPropId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: '#fff',
                  fontSize: '13.5px',
                }}
              >
                {ok.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} · {money(p.price, p.purpose)}
                  </option>
                ))}
              </select>
              {wait.length > 0 && (
                <small style={{ color: 'var(--mut)', display: 'block', marginTop: '6px', fontSize: '12px' }}>
                  {wait.length} of your properties {wait.length === 1 ? 'is' : 'are'} not approved yet, so{' '}
                  {wait.length === 1 ? 'it' : 'they'} can&apos;t be suggested.
                </small>
              )}
            </div>

            <div className="jfl" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                Private note to buyer (optional)
              </label>
              <textarea
                placeholder="e.g. My apartment is 2 minutes walk from the metro station, ready for immediate possession."
                rows={2}
                value={sellerNote}
                onChange={(e) => setSellerNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  fontSize: '13px',
                }}
              />
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--mut)', lineHeight: 1.5, margin: '0 0 16px' }}>
              It goes straight to the buyer’s dashboard. The buyer will see your phone and email when they request a site
              visit; their contact stays private until they share it.
            </p>

            <button
              className="btn btn-o wide"
              type="submit"
              disabled={submitting}
              style={{ width: '100%', padding: '10px' }}
            >
              {submitting ? 'Sending...' : 'Send suggestion'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

