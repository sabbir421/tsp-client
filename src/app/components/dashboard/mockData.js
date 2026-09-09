export const STATS = {
  totalProperties: 6,
  verified: 3,
  matched: 4,
  totalLeads: 18,
};

export const PROPERTIES = [
  {
    id: 1,
    title: '1650 sft Apartment in Bashundhara R/A',
    meta: 'Sale • 3 Bed • 3 Bath',
    price: '2.25 Cr',
    status: 'pending',
    statusLabel: 'Pending Approval',
    views: 124,
    leads: 5,
    color: '#dbeafe',
  },
  {
    id: 2,
    title: '2200 sft Duplex in Gulshan 2',
    meta: 'Sale • 4 Bed • 4 Bath',
    price: '3.80 Cr',
    status: 'verified',
    statusLabel: 'Verified',
    views: 287,
    leads: 12,
    color: '#dcfce7',
  },
  {
    id: 3,
    title: '1200 sft Flat in Dhanmondi',
    meta: 'Sale • 2 Bed • 2 Bath',
    price: '1.45 Cr',
    status: 'matched',
    statusLabel: 'Matched',
    views: 198,
    leads: 8,
    color: '#fef3c7',
  },
  {
    id: 4,
    title: '3500 sft Commercial Space in Motijheel',
    meta: 'Rent • Office • 2 Floor',
    price: '1.20 L/mo',
    status: 'verified',
    statusLabel: 'Verified',
    views: 76,
    leads: 3,
    color: '#f3e8ff',
  },
];

export const BUYER_REQUIREMENTS = [
  { id: 1, title: '3 Bed Apartment in Bashundhara', budget: 'Budget: 1.5 – 2 Cr', isNew: true },
  { id: 2, title: '2 Bed Flat in Dhanmondi', budget: 'Budget: 80 L – 1.2 Cr', isNew: true },
  { id: 3, title: 'Commercial Space in Gulshan', budget: 'Budget: 2 – 3 Cr', isNew: false },
];

export const SUGGESTIONS = [
  { id: 1, title: 'Gulshan 2 Duplex → Buyer #1042', status: 'matched', statusLabel: 'Matched' },
  { id: 2, title: 'Bashundhara Apt → Buyer #1087', status: 'review', statusLabel: 'Under Review' },
  { id: 3, title: 'Dhanmondi Flat → Buyer #1103', status: 'pending', statusLabel: 'Pending' },
];

export const LEADS = [
  { id: 1, name: 'Rahim Uddin', interest: 'Interested in Gulshan 2 Duplex', status: 'interested', statusLabel: 'Interested', initials: 'RU' },
  { id: 2, name: 'Sadia Rahman', interest: 'Site visit scheduled – Bashundhara', status: 'siteVisit', statusLabel: 'Site Visit', initials: 'SR' },
  { id: 3, name: 'Karim Hassan', interest: 'Interested in Dhanmondi Flat', status: 'interested', statusLabel: 'Interested', initials: 'KH' },
];

export const SITE_VISITS = [
  { id: 1, location: 'Gulshan 2 Duplex', meta: 'Tomorrow • 10:00 AM', type: 'Sale' },
  { id: 2, location: 'Bashundhara Apartment', meta: 'Jun 18 • 3:00 PM', type: 'Sale' },
  { id: 3, location: 'Dhanmondi Flat', meta: 'Jun 20 • 11:00 AM', type: 'Sale' },
];

export const PLAN = {
  name: 'Professional Plan',
  validUntil: 'Dec 31, 2026',
};
