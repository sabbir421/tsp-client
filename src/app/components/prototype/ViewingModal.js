'use client';

import { useState } from 'react';
import { addViewingRequest } from '../../utils/prototypeStore';
import { showToast } from './Toast';

export default function ViewingModal({ property, isOpen, onClose, onBooked, user }) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [slot, setSlot] = useState('Morning (10:00 - 12:30)');
  const [mode, setMode] = useState('direct');
  const [people, setPeople] = useState('2');
  const [notes, setNotes] = useState('');

  if (!isOpen || !property) return null;

  const slots = [
    'Morning (10:00 - 12:30)',
    'Afternoon (2:00 - 4:30)',
    'Evening (5:00 - 7:00)',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const created = addViewingRequest({
      propId: property.id,
      date,
      slot,
      mode,
      people,
      notes,
    });

    onBooked?.({
      id: created.id,
      propId: property.id,
      date,
      slot,
      mode,
      people,
      notes,
      property,
    });

    showToast(`✓ Viewing requested for ${date}, ${slot}. Owner received your contact details.`);
    onClose();
  };

  return (
    <div className="modal open" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="mbox" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <button type="button" className="x" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h3 style={{ margin: '0 0 6px', color: 'var(--navy)' }}>Request a Private Site Visit</h3>
        <p style={{ color: 'var(--mut)', fontSize: '13.5px', margin: '0 0 16px' }}>
          {property.title} · {property.area}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="fl" style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
              Preferred Date <span style={{ color: 'var(--orange)' }}>*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)' }}
            />
          </div>

          <div className="fl" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
              Time Window
            </label>
            <div className="slots" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`slot ${slot === s ? 'on' : ''}`}
                  onClick={() => setSlot(s)}
                  style={{
                    padding: '8px 4px',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: slot === s ? '2px solid var(--orange)' : '1px solid var(--line)',
                    background: slot === s ? '#fff7ec' : '#fff',
                    color: slot === s ? 'var(--navy)' : 'var(--mut)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {s.split(' ')[0]}<br />
                  <small style={{ fontSize: '10px' }}>{s.split(' ')[1]}</small>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div className="fl">
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                Visitors
              </label>
              <select
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff' }}
              >
                <option value="1">1 Person</option>
                <option value="2">2 People (Couple / Family)</option>
                <option value="3">3 People</option>
                <option value="4">4+ People</option>
              </select>
            </div>
            <div className="fl">
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                Coordination Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff' }}
              >
                <option value="direct">Direct with Seller (Contact shared)</option>
                <option value="tsp">Through TrueSpace agent</option>
              </select>
            </div>
          </div>

          <div className="fl" style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
              Note for Seller (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Coming with family, will reach around 11:30 AM"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)' }}
            />
          </div>

          <div style={{ background: '#f6f7fb', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--navy)', marginBottom: '18px' }}>
            🔒 <b>Privacy Disclosure:</b> By booking this visit, your verified name and contact will be unlocked for the seller so they can confirm your appointment.
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-g btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-o btn-sm">
              Confirm Site Visit →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
