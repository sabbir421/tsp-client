// TrueSpace Prototype Local & Session Store
import { PROPS, SAMPLE_REQ, ROLES } from './prototypeData';

const KEY = 'tsp_prototype_v1';
const AKEY = 'tsp_prototype_v3';

const blankV1 = () => ({
  reqs: [],
  listings: [],
  enq: [],
  visits: [],
  saved: [],
  decisions: {},
  contact: [],
  ownerDecisions: {},
});

const blankV3 = () => ({
  session: { role: 'buyer', name: '', email: '', isLoggedIn: false },
  profile: {},
  lst: {},
  oEnq: {},
  oView: {},
  docs: {
    nid: 'missing',
    deed: 'missing',
    tax: 'missing',
    util: 'missing',
    photo: 'missing',
  },
  reqState: {},
  adm: {
    users: {},
    props: {},
    verif: {},
    reports: {},
    posts: {},
    drafts: [],
  },
});

let listeners = [];

export function subscribeStore(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
}

export function getStore() {
  if (typeof window === 'undefined') return { v1: blankV1(), v3: blankV3() };
  let v1, v3;
  try {
    v1 = Object.assign(blankV1(), JSON.parse(localStorage.getItem(KEY) || '{}'));
    if (v1 && Array.isArray(v1.saved)) {
      v1.saved = v1.saved.filter((id) => id < 1000 || id > 1020);
    }
    if (v1) {
      v1.reqs = [];
    }
  } catch (e) {
    v1 = blankV1();
  }
  try {
    v3 = Object.assign(blankV3(), JSON.parse(localStorage.getItem(AKEY) || '{}'));
  } catch (e) {
    v3 = blankV3();
  }
  return { v1, v3 };
}

export function saveStore(v1, v3) {
  if (typeof window === 'undefined') return;
  try {
    if (v1) localStorage.setItem(KEY, JSON.stringify(v1));
    if (v3) localStorage.setItem(AKEY, JSON.stringify(v3));
    notify();
  } catch (e) {
    console.error('Storage error', e);
  }
}

export function toggleSaveProperty(propId) {
  const { v1, v3 } = getStore();
  const id = Number(propId);
  const idx = v1.saved.indexOf(id);
  let saved = false;
  if (idx > -1) {
    v1.saved.splice(idx, 1);
  } else {
    v1.saved.push(id);
    saved = true;
  }
  saveStore(v1, v3);
  return saved;
}

export function isPropertySaved(propId) {
  const { v1 } = getStore();
  return v1.saved.includes(Number(propId));
}

export function setMatchDecision(propId, decision) {
  const { v1, v3 } = getStore();
  if (decision === 'undo') {
    delete v1.decisions[propId];
  } else {
    v1.decisions[propId] = decision; // 'accepted' or 'declined'
  }
  saveStore(v1, v3);
}

export function addViewingRequest(visit) {
  const { v1, v3 } = getStore();
  const newVisit = {
    id: 'VIS-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
    ref: 'TSP-' + visit.propId,
    pid: visit.propId,
    date: visit.date,
    slot: visit.slot,
    mode: visit.mode || 'tsp',
    st: 'Requested',
    status: 'Awaiting owner',
    buyer: { name: v3.session?.name || 'Nusrat Jahan', phone: '01700000000' },
    created: Date.now(),
  };
  v1.visits.unshift(newVisit);
  saveStore(v1, v3);
  return newVisit;
}

export function setVisitStatus(visitId, status) {
  const { v1, v3 } = getStore();
  const visit = v1.visits.find((v) => v.id === visitId);
  if (visit) {
    visit.st = status;
    visit.status = status;
  }
  saveStore(v1, v3);
}

export function addListing(listing) {
  const { v1, v3 } = getStore();
  const id = 2000 + v1.listings.length + 1;
  const newL = {
    ...listing,
    id,
    views: 1,
    verified: false,
    status: 'pending',
    handover: 'Ready',
    days: 0,
    provider: 'Owner',
    hue: (id * 47) % 360,
  };
  v1.listings.unshift(newL);
  // In review by admin
  v3.adm.props[id] = 'pending';
  saveStore(v1, v3);
  return newL;
}

export function approveProperty(propId) {
  const { v1, v3 } = getStore();
  const listing = v1.listings.find((p) => String(p.id) === String(propId));
  if (listing) {
    listing.verified = true;
    listing.status = 'verified';
  }
  v3.adm.props[propId] = 'approved';
  saveStore(v1, v3);
}

export function isPropertyApproved(prop) {
  if (!prop) return false;
  const { v3 } = getStore();
  if (v3?.adm?.props?.[prop.id] === 'approved') return true;
  if (v3?.adm?.props?.[prop.id] === 'pending' || v3?.adm?.props?.[prop.id] === 'rejected') return false;
  return prop.status === 'verified' || prop.status === 'approved' || prop.verified === true;
}

export function addRequirement(req) {
  const { v1, v3 } = getStore();
  const id = 'REQ-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  const newR = {
    ...req,
    id,
    created: Date.now(),
  };
  v1.reqs.unshift(newR);
  saveStore(v1, v3);
  return newR;
}

export function setSessionRole(role, extra = {}) {
  const { v1, v3 } = getStore();
  const info = ROLES[role] || ROLES.buyer;
  v3.session = {
    role,
    name: extra.name || info.name,
    email: extra.email || info.email,
    phone: extra.phone || info.phone || '01712345678',
    identity: extra.identity || role,
    company: extra.company || '',
    isLoggedIn: true,
    at: Date.now(),
  };
  saveStore(v1, v3);
}

export function clearSession() {
  const { v1, v3 } = getStore();
  v3.session = {
    isLoggedIn: false,
    role: null,
    name: '',
    email: '',
    phone: '',
    identity: null,
    company: '',
  };
  saveStore(v1, v3);
}

export function getSession() {
  const { v3 } = getStore();
  return v3.session || { role: 'buyer', name: 'Nusrat Jahan', email: 'buyer@example.com' };
}

export function resetStore() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(AKEY);
    localStorage.removeItem('tsp_seller_v19');
    notify();
  } catch (e) {
    console.error('Storage error', e);
  }
}
