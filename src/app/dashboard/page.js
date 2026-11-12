'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PrototypeHeader from '../components/prototype/PrototypeHeader';
import PrototypeFooter from '../components/prototype/PrototypeFooter';
import PropertyCard from '../components/prototype/PropertyCard';
import ViewingModal from '../components/prototype/ViewingModal';
import Toast, { showToast } from '../components/prototype/Toast';
import {
  PROPS,
  SAMPLE_REQ,
  DOCS,
  DHAKA_ZONES,
  matchesFor,
  art,
  locTxt,
  money,
  comma,
} from '../utils/prototypeData';
import { authApi, propertyApi, matchApi, requirementApi, getUploadUrl } from '../utils/api';
import {
  getStore,
  saveStore,
  toggleSaveProperty,
  setMatchDecision,
  setVisitStatus,
  subscribeStore,
  resetStore,
  clearSession,
} from '../utils/prototypeStore';
import { useDispatch } from 'react-redux';
import { logoutAllPortals } from '../store/slices/authSlice';
import { useAuthUser } from '../components/auth/RequireAuth';
import { USER_ROLES } from '../constants';

const ICONS = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>
    </svg>
  ),
  list: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  ),
  cal: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .7 3.2 2.3 3.5 5"/>
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  tick: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5 9-10"/>
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>
    </svg>
  ),
  heart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>
    </svg>
  ),
  target: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>
    </svg>
  ),
  swap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 7h13l-3-3M17 17H4l3 3"/>
    </svg>
  ),
  out: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 4h4v16h-4M10 17l5-5-5-5M15 12H3"/>
    </svg>
  )
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  // The portal comes from the verified session, never from the URL
  const authUser = useAuthUser();
  const role = authUser?.role === USER_ROLES.BUYER_TENANT ? 'buyer' : 'owner';
  const [tab, setTab] = useState(searchParams.get('tab') || 'overview');

  // On phones the tab list is a horizontal strip: keep the active tab in view
  useEffect(() => {
    const active = document.querySelector('.dnav button.on');
    const nav = active?.closest('.dnav');
    if (active && nav && nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [tab]);
  
  const blankStore = {
    v1: { reqs: [], listings: [], enq: [], visits: [], saved: [], decisions: {}, contact: [], ownerDecisions: {} },
    v3: { session: { role: 'buyer', name: '', email: '', isLoggedIn: false }, profile: {}, lst: {}, oEnq: {}, oView: {}, docs: {}, reqState: {}, adm: {} }
  };
  const [store, setStore] = useState(blankStore);
  const [listingFilter, setListingFilter] = useState('all');
  const [viewingProp, setViewingProp] = useState(null);
  const [editingPriceProp, setEditingPriceProp] = useState(null);
  const [newPriceInput, setNewPriceInput] = useState('');

  const handleResetData = () => {
    resetStore();
    showToast('Data reset successfully');
  };

  // Prototype v39 additional dashboard states
  const [buyerSuggestions, setBuyerSuggestions] = useState([]);

  const [buyerBadges, setBuyerBadges] = useState({
    nid: 'missing',
    card: 'missing',
    trade: 'missing',
  });

  const [ownerSvSubTab, setOwnerSvSubTab] = useState('sug');
  const [ownerSvrFilter, setOwnerSvrFilter] = useState('all');
  const [ownerLeadFilter, setOwnerLeadFilter] = useState('all');
  const [ownerCalView, setOwnerCalView] = useState('week');
  const [proposingSvr, setProposingSvr] = useState(null);
  const [proposeDate, setProposeDate] = useState('2026-10-31');
  const [proposeTime, setProposeTime] = useState('11:00 AM');
  const [suggestModalReq, setSuggestModalReq] = useState(null);
  const [suggestSelectedPropId, setSuggestSelectedPropId] = useState('');
  const [suggestNote, setSuggestNote] = useState('');
  const [ownerSuggestions, setOwnerSuggestions] = useState([]);
  const [svrList, setSvrList] = useState([]);
  const [leadsList, setLeadsList] = useState([]);
  const [propertyBadges, setPropertyBadges] = useState({});

  const [currentUser, setCurrentUser] = useState(null);
  const [dbOwnerListings, setDbOwnerListings] = useState([]);
  const [sellerStats, setSellerStats] = useState({ total: 0, verified: 0, pending: 0, matched: 0, totalLeads: 0 });
  const [dbActiveReqs, setDbActiveReqs] = useState([]);

  const [dbBuyerReqs, setDbBuyerReqs] = useState([]);
  const [dbBuyerMatches, setDbBuyerMatches] = useState([]);
  const [dbBuyerVisits, setDbBuyerVisits] = useState([]);

  useEffect(() => {
    if (!searchParams.has('role')) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('role');
    const query = params.toString();
    router.replace(query ? `/dashboard?${query}` : '/dashboard');
  }, [searchParams, router]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const userRes = await authApi.getProfile().catch(() => null);
        if (!mounted) return;
        if (userRes?.data || userRes?.user) {
          setCurrentUser(userRes.data || userRes.user);
        } else {
          try {
            const stored = localStorage.getItem('user');
            if (stored) setCurrentUser(JSON.parse(stored));
          } catch (_) {}
        }

        if (role === 'owner') {
          const [propsRes, statsRes, visitsRes, reqsRes, matchesRes] = await Promise.all([
            propertyApi.getMine().catch(() => ({ data: [] })),
            propertyApi.getStats().catch(() => ({ data: { total: 0, verified: 0, pending: 0, matched: 0, totalLeads: 0 } })),
            matchApi.getSellerSiteVisits().catch(() => ({ data: [] })),
            matchApi.getRequirements().catch(() => ({ data: [] })),
            matchApi.getSellerMatches().catch(() => ({ data: [] })),
          ]);

          if (!mounted) return;

          const pList = Array.isArray(propsRes?.data) ? propsRes.data : Array.isArray(propsRes) ? propsRes : [];
          setDbOwnerListings(pList.map((p) => ({ ...p, mine: true })));

          const st = statsRes?.data || statsRes || {};
          setSellerStats({
            total: st.total || pList.length,
            verified: st.verified || pList.filter((p) => p.status === 'verified').length,
            pending: st.pending || pList.filter((p) => p.status === 'pending').length,
            matched: st.matched || 0,
            totalLeads: st.totalLeads || 0,
          });

          const vList = Array.isArray(visitsRes?.data) ? visitsRes.data : Array.isArray(visitsRes) ? visitsRes : [];
          const normalizedVisits = vList.map((v) => ({
            id: v.id,
            pid: v.propertyId,
            name: v.buyer?.fullName || v.buyer?.name || 'Buyer',
            phone: v.buyer?.phone || '',
            email: v.buyer?.email || '',
            date: v.visitDate,
            time: v.visitSlot,
            mode: v.visitMode || 'direct',
            people: v.visitPeople || 1,
            status: v.visitStatus || 'pending',
            newDate: v.proposedDate,
            newTime: v.proposedTime,
            req: v.requirementTitle || 'Viewing Request',
            reqAt: v.visitRequestedAt ? new Date(v.visitRequestedAt).toLocaleDateString() : 'Recent',
            history: [],
          }));
          setSvrList(normalizedVisits);

          const rList = Array.isArray(reqsRes?.data) ? reqsRes.data : Array.isArray(reqsRes) ? reqsRes : [];
          setDbActiveReqs(rList);

          const mList = Array.isArray(matchesRes?.data) ? matchesRes.data : Array.isArray(matchesRes) ? matchesRes : [];
          setOwnerSuggestions(
            mList.map((m) => ({
              id: m.id,
              rid: `REQ-${m.requirementId}`,
              pid: m.propertyId,
              at: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recently',
              status: m.status || 'sent',
            }))
          );

          const leads = normalizedVisits.map((v, idx) => ({
            id: `LD-${v.id || idx + 1}`,
            pid: v.pid,
            name: v.name,
            phone: v.phone,
            email: v.email,
            req: v.req,
            at: v.date,
            status: v.status === 'confirmed' ? 'Visit scheduled' : v.status === 'completed' ? 'Visit completed' : 'New',
            daysLeft: 30,
            expired: false,
          }));
          setLeadsList(leads);
        } else if (role === 'buyer') {
          const [bReqsRes, bMatchesRes, bVisitsRes] = await Promise.all([
            requirementApi.getMine().catch(() => ({ data: [] })),
            matchApi.getBuyerMatches().catch(() => ({ data: [] })),
            matchApi.getBuyerSiteVisits().catch(() => ({ data: [] })),
          ]);

          if (!mounted) return;

          const rList = Array.isArray(bReqsRes?.data) ? bReqsRes.data : Array.isArray(bReqsRes) ? bReqsRes : [];
          setDbBuyerReqs(rList);

          const mList = Array.isArray(bMatchesRes?.data) ? bMatchesRes.data : Array.isArray(bMatchesRes) ? bMatchesRes : [];
          setDbBuyerMatches(mList);

          const vList = Array.isArray(bVisitsRes?.data) ? bVisitsRes.data : Array.isArray(bVisitsRes) ? bVisitsRes : [];
          setDbBuyerVisits(vList);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [role]);

  useEffect(() => {
    const update = () => setStore(getStore());
    update();
    return subscribeStore(update);
  }, []);

  // Buyer data (strictly from DB)
  const buyerReqs = useMemo(() => {
    return dbBuyerReqs;
  }, [dbBuyerReqs]);

  const activeReq = buyerReqs[0] || null;
  const buyerMatches = useMemo(() => {
    return dbBuyerMatches;
  }, [dbBuyerMatches]);

  const savedProps = useMemo(() => {
    return (store.v1?.saved || []).map((id) => dbOwnerListings.find((p) => p.id === id)).filter(Boolean);
  }, [store.v1?.saved, dbOwnerListings]);

  const buyerVisits = useMemo(() => {
    return dbBuyerVisits;
  }, [dbBuyerVisits]);

  // Owner data (Live from DB)
  const ownerListings = useMemo(() => {
    return dbOwnerListings;
  }, [dbOwnerListings]);

  const allProps = useMemo(() => {
    return ownerListings;
  }, [ownerListings]);

  const ownerVisits = useMemo(() => {
    return svrList;
  }, [svrList]);

  // Verification progress
  const docStates = useMemo(() => {
    return DOCS.map((d) => ({
      ...d,
      status: store.v3.docs?.[d.k] || d.def || 'missing',
    }));
  }, [store.v3.docs]);

  const verifPercent = useMemo(() => {
    if (currentUser?.isVerified) return 100;
    const approved = docStates.filter((d) => d.status === 'approved').length;
    return Math.round((approved / docStates.length) * 100);
  }, [docStates, currentUser]);

  const handleDocUpload = (key) => {
    const { v1, v3 } = getStore();
    v3.docs = v3.docs || {};
    v3.docs[key] = 'approved';
    saveStore(v1, v3);
    showToast(`✓ Document uploaded and approved by TrueSpace verification.`);
  };

  const handlePriceUpdate = (e) => {
    e.preventDefault();
    if (!editingPriceProp || !newPriceInput) return;
    const { v1, v3 } = getStore();
    v3.lst = v3.lst || {};
    v3.lst[editingPriceProp.id] = {
      price: Number(newPriceInput),
    };
    saveStore(v1, v3);
    showToast(`✓ Price updated for TSP-${editingPriceProp.id}`);
    setEditingPriceProp(null);
  };

  const handleSvrConfirm = async (id) => {
    try {
      await matchApi.confirmSellerVisit(id).catch(() => {});
      setSvrList((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            const history = [...(r.history || []), { status: r.status, newDate: r.newDate, newTime: r.newTime }];
            return { ...r, status: 'confirmed', history };
          }
          return r;
        })
      );
      showToast('✓ Visit confirmed. It is now in your Viewing Calendar');
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to confirm'}`);
    }
  };

  const handleSvrDecline = (id) => {
    setSvrList((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const history = [...(r.history || []), { status: r.status, newDate: r.newDate, newTime: r.newTime }];
          return { ...r, status: 'declined', history };
        }
        return r;
      })
    );
    showToast('Visit request declined');
  };

  const handleSvrComplete = async (id) => {
    try {
      await matchApi.completeSellerVisit(id).catch(() => {});
      setSvrList((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            const history = [...(r.history || []), { status: r.status, newDate: r.newDate, newTime: r.newTime }];
            return { ...r, status: 'completed', history };
          }
          return r;
        })
      );
      showToast('✓ Visit marked as completed');
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to complete visit'}`);
    }
  };

  const handleSvrUndo = (id) => {
    setSvrList((prev) =>
      prev.map((r) => {
        if (r.id === id && r.history && r.history.length > 0) {
          const last = r.history[r.history.length - 1];
          const history = r.history.slice(0, -1);
          return { ...r, status: last.status, newDate: last.newDate, newTime: last.newTime, history };
        }
        return r;
      })
    );
    showToast('Last action undone');
  };

  const handleSvrProposeSubmit = async (e) => {
    e.preventDefault();
    if (!proposingSvr) return;
    try {
      await matchApi.proposeSellerTime(proposingSvr.id, { proposedDate: proposeDate, proposedTime: proposeTime }).catch(() => {});
      setSvrList((prev) =>
        prev.map((r) => {
          if (r.id === proposingSvr.id) {
            const history = [...(r.history || []), { status: r.status, newDate: r.newDate, newTime: r.newTime }];
            return { ...r, status: 'resched', newDate: proposeDate, newTime: proposeTime, history };
          }
          return r;
        })
      );
      showToast(`New time saved: ${proposeDate}, ${proposeTime}`);
      setProposingSvr(null);
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to propose time'}`);
    }
  };

  const handleOpenSuggestModal = (req) => {
    setSuggestModalReq(req);
    const approvedProps = ownerListings.filter((p) => p.status === 'verified' || p.status === 'approved' || p.verified === true);
    setSuggestSelectedPropId(approvedProps[0]?.id || '');
    setSuggestNote('');
  };

  const handleSendSuggestionSubmit = async (e) => {
    e.preventDefault();
    if (!suggestModalReq) return;
    const approvedProps = ownerListings.filter((p) => p.status === 'verified' || p.status === 'approved' || p.verified === true);

    const chosenProp = approvedProps.find((p) => String(p.id) === String(suggestSelectedPropId)) || approvedProps[0];
    if (!chosenProp) {
      showToast('⚠️ Selected property must be approved by admin before you can suggest it.');
      return;
    }

    try {
      await matchApi.send({
        requirementId: suggestModalReq.id,
        propertyId: chosenProp.id,
        sellerNote: suggestNote,
      });

      const newOwnerSug = {
        id: 'SG-' + Math.floor(100 + Math.random() * 900),
        rid: `REQ-${suggestModalReq.id}`,
        pid: chosenProp.id,
        at: 'Today',
        status: 'approved',
      };

      setOwnerSuggestions((prev) => [newOwnerSug, ...prev]);
      showToast(`✓ Property "${chosenProp.title}" suggested to buyer!`);
      setSuggestModalReq(null);
      setSuggestNote('');
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Could not send suggestion'}`);
    }
  };

  const handleLeadStatusChange = (id, newStatus) => {
    setLeadsList((prev) =>
      prev.map((l) => (l.id === id ? { ...l, prevStatus: l.status, status: newStatus } : l))
    );
    showToast(`Lead status: ${newStatus} (saved in this browser only)`);
  };

  const handleLeadUndo = (id) => {
    setLeadsList((prev) =>
      prev.map((l) => (l.id === id && l.prevStatus ? { ...l, status: l.prevStatus, prevStatus: undefined } : l))
    );
    showToast('Lead status reverted');
  };

  const handlePropertyBadgeToggle = (pid, badgeKey) => {
    setPropertyBadges((prev) => {
      const current = prev[pid] || {};
      const newStatus = current[badgeKey] === 'approved' ? 'missing' : 'pending';
      return {
        ...prev,
        [pid]: {
          ...current,
          [badgeKey]: newStatus,
        },
      };
    });
    showToast(`✓ Verification requested for TSP-${pid}. TrueSpace admin will review it.`);
  };

  return (
    <>
      <PrototypeHeader />
      <Toast />

      {/* PAGE HEADING */}
      <div className="phead">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / Dashboard / {role === 'owner' ? 'Seller / Rent Giver' : role === 'buyer' ? 'Buyer / Tenant' : 'Admin'}
          </div>
          <h1 style={{ margin: '4px 0 0' }}>
            {role === 'owner' ? 'Seller / Rent Giver' : role === 'buyer' ? 'Buyer / Tenant' : 'Admin'} dashboard
          </h1>
          <p>
            {role === 'owner'
              ? 'Manage your listings, site visit requests, viewing calendar, leads and verification.'
              : role === 'buyer'
              ? 'Post requirements, get verified matches, save homes and book viewings.'
              : 'Super admin portal for verifying listings, documents, and monitoring users.'}
          </p>
        </div>
      </div>

      <div className="wrap dash">
        {/* ===================== SIDEBAR NAVIGATION ===================== */}
        <aside className="dnav">
          <div className="who">
            <div className={`av ${role === 'owner' ? 'n' : ''}`}>
              {currentUser?.name
                ? currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                : role === 'buyer'
                ? 'BU'
                : role === 'owner'
                ? 'SE'
                : 'AD'}
            </div>
            <div>
              <b style={{ color: 'var(--navy)', fontSize: '14px', display: 'block' }}>
                {currentUser?.fullName || currentUser?.name || (role === 'buyer' ? 'Buyer / Tenant' : role === 'owner' ? 'Seller Account' : 'TrueSpace Admin')}
              </b>
              <small style={{ color: 'var(--mut)', fontSize: '12px' }}>
                {currentUser?.email || (role === 'buyer' ? 'Buyer / Tenant' : role === 'owner' ? 'Seller / Rent Giver' : 'Super Administrator')}
              </small>
            </div>
          </div>

          {/* BUYER TABS */}
          {role === 'buyer' && (
            <>
              <button
                type="button"
                className={tab === 'overview' ? 'on' : ''}
                onClick={() => setTab('overview')}
              >
                {ICONS.grid}
                <span>Overview</span>
              </button>
              <button
                type="button"
                className={tab === 'saved' ? 'on' : ''}
                onClick={() => setTab('saved')}
              >
                {ICONS.heart}
                <span>Saved properties</span>
                <em className="cnt">{savedProps.length}</em>
              </button>
              <button
                type="button"
                className={tab === 'reqs' ? 'on' : ''}
                onClick={() => setTab('reqs')}
              >
                {ICONS.list}
                <span>My requirements</span>
                <em className="cnt">{buyerReqs.length}</em>
              </button>
              <button
                type="button"
                className={tab === 'matches' ? 'on' : ''}
                onClick={() => setTab('matches')}
              >
                {ICONS.target}
                <span>Match results</span>
                <em className="cnt">{buyerMatches.length}</em>
              </button>
              <button
                type="button"
                className={tab === 'visits' ? 'on' : ''}
                onClick={() => setTab('visits')}
              >
                {ICONS.cal}
                <span>Viewing requests</span>
                <em className="cnt">{buyerVisits.length}</em>
              </button>
              <button
                type="button"
                className={tab === 'jsug' ? 'on' : ''}
                onClick={() => setTab('jsug')}
              >
                {ICONS.home}
                <span>Suggestions & visits</span>
                <em className="cnt">{buyerSuggestions.length}</em>
              </button>
              <button
                type="button"
                className={tab === 'jver' ? 'on' : ''}
                onClick={() => setTab('jver')}
              >
                {ICONS.check}
                <span>Identity Verification</span>
              </button>
              <button
                type="button"
                className={tab === 'profile' ? 'on' : ''}
                onClick={() => setTab('profile')}
              >
                {ICONS.user}
                <span>Profile Settings</span>
              </button>
            </>
          )}

          {/* OWNER / SELLER TABS (Exact 8 tabs from Prototype v39) */}
          {role === 'owner' && (
            <>
              <button
                type="button"
                className={tab === 'overview' ? 'on' : ''}
                onClick={() => setTab('overview')}
              >
                {ICONS.grid}
                <span>Overview</span>
              </button>
              <button
                type="button"
                className={tab === 'listings' ? 'on' : ''}
                onClick={() => setTab('listings')}
              >
                {ICONS.home}
                <span>My Listings</span>
                <em className="cnt">{ownerListings.length}</em>
              </button>
              <button
                type="button"
                className={tab === 'svr' ? 'on' : ''}
                onClick={() => setTab('svr')}
              >
                {ICONS.list}
                <span>Site Visit Requests</span>
                <em className="cnt">{svrList.filter((s) => s.status === 'pending').length}</em>
              </button>
              <button
                type="button"
                className={tab === 'cal' ? 'on' : ''}
                onClick={() => setTab('cal')}
              >
                {ICONS.cal}
                <span>Viewing Calendar</span>
                <em className="cnt">{svrList.filter((s) => s.status === 'confirmed').length}</em>
              </button>
              <button
                type="button"
                className={tab === 'leads' ? 'on' : ''}
                onClick={() => setTab('leads')}
              >
                {ICONS.users}
                <span>Lead Center</span>
                <em className="cnt">{sellerStats.totalLeads || leadsList.length}</em>
              </button>
              <button
                type="button"
                className={tab === 'verify' ? 'on' : ''}
                onClick={() => setTab('verify')}
              >
                {ICONS.check}
                <span>Verification</span>
                <em className="cnt">{currentUser?.isVerified ? '100%' : `${verifPercent}%`}</em>
              </button>
              <button
                type="button"
                className={tab === 'jpv' ? 'on' : ''}
                onClick={() => setTab('jpv')}
              >
                {ICONS.tick}
                <span>Property Badges</span>
              </button>
              <button
                type="button"
                className={tab === 'profile' ? 'on' : ''}
                onClick={() => setTab('profile')}
              >
                {ICONS.user}
                <span>Profile Settings</span>
              </button>
            </>
          )}


          {/* SHARED SIDEBAR ACTIONS (EXACT TO PROTOTYPE V39) */}
          <div className="dsep"></div>
          <button
            type="button"
            onClick={() => {
              clearSession();
              dispatch(logoutAllPortals());
              router.push('/login');
            }}
          >
            {ICONS.out}
            <span>Log out</span>
          </button>
          <button type="button" className="danger" onClick={handleResetData}>
            <span>Reset prototype data</span>
          </button>
        </aside>

        {/* ===================== MAIN CONTENT AREA ===================== */}
        <main className="dmain">
          {/* Top Identity Strip & Role Strip for Owner */}
          {role === 'owner' ? (
            <>
              <div className={`tsx-strip ${tab !== 'overview' ? 'off-tab' : ''}`} id="tsxStrip">
                <div>
                  <small>Your identity</small>
                  <b>{currentUser?.sellerType || 'Owner'}</b>
                </div>
                <div>
                  <small>Account</small>
                  <span className="tsx-c ok">Active</span>
                </div>
                <div className="grow">
                  <small>Verification</small>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <span className={`tsx-c ${currentUser?.isVerified ? 'ok' : 'none'}`}>
                      {currentUser?.isVerified ? '✓ Identity Verified' : 'NID · not submitted'}
                    </span>
                    <span className={`tsx-c ${currentUser?.phone ? 'ok' : 'none'}`}>
                      {currentUser?.phone ? `✓ Phone ${currentUser.phone}` : 'Phone unverified'}
                    </span>
                  </div>
                </div>
                <button type="button" className="btn btn-g btn-sm" onClick={() => setTab('verify')}>
                  Verification
                </button>
              </div>

              <div className={`jstrip ${tab !== 'overview' ? 'off-tab' : ''}`}>
                <span>
                  <b>Seller / Rent Giver:</b> submit a property for admin approval, then suggest it to buyer requirements.
                </span>
                <span className="acts" style={{ display: 'flex', gap: '8px' }}>
                  <Link className="btn btn-o btn-sm" href="/list">
                    Submit a property
                  </Link>
                  <Link className="btn btn-g btn-sm" href="/requirements">
                    Buyer requirements
                  </Link>
                </span>
              </div>
            </>
          ) : role === 'buyer' ? (
            <div className={`jstrip ${tab !== 'overview' ? 'off-tab' : ''}`}>
              <span>
                <b>Buyer / Tenant:</b> post your requirement. It is approved automatically and shown publicly without your contact details.
              </span>
              <span className="acts" style={{ display: 'flex', gap: '8px' }}>
                <Link className="btn btn-o btn-sm" href="/requirement">
                  Post Requirement
                </Link>
                <button
                  type="button"
                  className="btn btn-g btn-sm"
                  onClick={() => setTab('jsug')}
                >
                  Suggestions & visits
                </button>
              </span>
            </div>
          ) : null}

          {/* ================= BUYER PORTAL ================= */}
          {role === 'buyer' && (
            <>
              {/* TAB: OVERVIEW */}
              {tab === 'overview' && (
                <>
                  <div className="kpis">
                    <div className="kpi">
                      <b>{buyerReqs.length}</b>
                      <span>Active requirements</span>
                    </div>
                    <div className="kpi">
                      <b>{buyerMatches.length}</b>
                      <span>Scored matches</span>
                    </div>
                    <div className="kpi">
                      <b>{savedProps.length}</b>
                      <span>Shortlisted homes</span>
                    </div>
                    <div className="kpi">
                      <b>{buyerVisits.length}</b>
                      <span>Viewing requests</span>
                    </div>
                  </div>

                  <div className="list">
                    <h4>
                      <span>Top matches for your requirement</span>
                      <button type="button" className="btn btn-l btn-sm" onClick={() => setTab('matches')}>
                        See all ({buyerMatches.length}) →
                      </button>
                    </h4>

                    {buyerMatches.length > 0 ? (
                      buyerMatches.slice(0, 4).map((m) => {
                        const p = m.property || m.p || m;
                        const s = m.score || m.s || { total: m.matchScore || 95 };
                        const photoUrl = getUploadUrl(p.photos?.[0] || p.photo || m.image);
                        return (
                          <div key={p.id} className="li">
                            <div
                              className="th"
                              style={{
                                width: '56px',
                                height: '56px',
                                overflow: 'hidden',
                                borderRadius: '8px',
                                background: '#eef1f8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={p.title || ''}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div
                                  dangerouslySetInnerHTML={{ __html: art(p, 0) }}
                                  style={{ width: '100%', height: '100%' }}
                                />
                              )}
                            </div>
                            <div className="grow">
                              <Link href={`/property/${p.id}`} style={{ fontWeight: '600', color: 'var(--navy)' }}>
                                {p.title}
                              </Link>
                              <small style={{ color: 'var(--mut)' }}>
                                {locTxt(p.area)} · {money(p.price, p.purpose)} · {p.beds || p.bedrooms || 3} bed, {comma(p.size || p.sizeSqFt || 1200)} sqft
                              </small>
                              {m.requirementTitle && (
                                <small style={{ color: '#1e40af', fontWeight: 500, display: 'block', marginTop: '2px' }}>
                                  🎯 {m.requirementTitle}
                                </small>
                              )}
                            </div>
                            <span className="status st-acc">{s.total || m.matchScore || 95}% match</span>
                            <button
                              type="button"
                              className="btn btn-g btn-sm"
                              onClick={() =>
                                setViewingProp({
                                  ...p,
                                  matchId: m.id,
                                  requirementTitle: m.requirementTitle || m.requirement?.summary,
                                })
                              }
                            >
                              Book visit
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="li">
                        <div className="grow" style={{ color: 'var(--mut)', textAlign: 'center', padding: '16px' }}>
                          No matches yet. When properties match your search, they appear here.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="list">
                    <h4>Recent activity</h4>
                    {buyerVisits && buyerVisits.length > 0 ? (
                      buyerVisits.slice(0, 3).map((v, i) => (
                        <div key={i} className="li">
                          <div className="grow">
                            <b>Viewing requested for property #{v.pid || v.propertyId}</b>
                            <small>{v.date} · {v.time || v.slot || 'Pending slot'}</small>
                          </div>
                          <span className="status st-pend">Pending</span>
                        </div>
                      ))
                    ) : (
                      <div className="li">
                        <div className="grow" style={{ color: 'var(--mut)', textAlign: 'center', padding: '12px' }}>
                          No recent activity yet.
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB: SAVED PROPERTIES */}
              {tab === 'saved' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: 'var(--navy)' }}>Your saved properties ({savedProps.length})</h3>
                    <Link href="/discover" className="btn btn-g btn-sm">
                      Discover more →
                    </Link>
                  </div>

                  {savedProps.length > 0 ? (
                    <div className="grid2">
                      {savedProps.map((p) => (
                        <PropertyCard key={p.id} property={p} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty">
                      <h3>No saved properties yet</h3>
                      <p style={{ margin: '8px 0 16px' }}>Click the ♡ heart icon on any property to save it to your shortlist.</p>
                      <Link href="/discover" className="btn btn-o btn-sm">
                        Browse Dhaka properties
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* TAB: MY REQUIREMENTS */}
              {tab === 'reqs' && (
                <div className="list">
                  <h4>
                    <span>My requirements</span>
                    <Link href="/requirement" className="btn btn-o btn-sm">
                      + Post new requirement
                    </Link>
                  </h4>

                  {buyerReqs.length > 0 ? (
                    buyerReqs.map((r) => (
                      <div key={r.id} className="li" style={{ padding: '16px 20px' }}>
                        <div className="grow">
                          <b>{r.id}</b> · {r.purpose === 'Rent' ? 'Rent' : 'Buy'} {r.type}
                          <small style={{ color: 'var(--mut)', margin: '4px 0', display: 'block' }}>
                            📍 {(r.areas || []).map(locTxt).join(' / ')} · {r.budgetDisplay || (r.maxBudget ? `Max ৳${Number(r.maxBudget).toLocaleString()}` : 'Budget on request')}
                          </small>
                          <small style={{ color: 'var(--mut)' }}>
                            Timeframe: {r.timeline || 'Within 3 months'}
                          </small>
                        </div>
                        <span className="status st-acc">{r.statusLabel || 'Active & matching'}</span>
                        <button
                          type="button"
                          className="btn btn-g btn-sm"
                          onClick={() => setTab('matches')}
                        >
                          View matches →
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--mut)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                      <h4 style={{ color: 'var(--navy)', margin: '0 0 6px' }}>No Active Requirements Found</h4>
                      <p style={{ fontSize: '13.5px', margin: '0 0 16px' }}>
                        You haven&apos;t posted any property requirement yet. Post what you are looking for to receive verified owner suggestions.
                      </p>
                      <Link href="/requirement" className="btn btn-o btn-sm">
                        + Post Your Requirement
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: MATCH RESULTS */}
              {tab === 'matches' && (
                <div>
                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--navy)' }}>
                        Match Results &amp; Suggestions ({buyerMatches.length})
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--mut)' }}>
                        Properties suggested by owners directly matched to your buyer requirements.
                      </p>
                    </div>
                    <Link href="/requirement" className="btn btn-g btn-sm">
                      + Post Another Requirement
                    </Link>
                  </div>

                  {buyerMatches.length > 0 ? (
                    buyerMatches.map((m) => {
                      const p = m.property || m.p || m;
                      const s = m.score || m.s || { total: m.matchScore || 95, reasons: [] };
                      const photoUrl = getUploadUrl(p.photos?.[0] || p.photo || m.image);
                      const seller = m.seller || {};
                      const reqLabel = m.requirementTitle || (m.requirement ? m.requirement.summary || `${m.requirement.title} in ${m.requirement.location}` : `REQ-${m.requirementId}`);

                      return (
                        <div
                          key={m.id || p.id}
                          className="card mcard"
                          style={{
                            marginBottom: '16px',
                            display: 'flex',
                            gap: '18px',
                            padding: '16px 20px',
                            borderRadius: '14px',
                            border: '1px solid var(--line)',
                            background: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          }}
                        >
                          {/* Property Photo */}
                          <Link
                            href={`/property/${p.id}`}
                            className="pimg"
                            style={{
                              position: 'relative',
                              width: '210px',
                              minHeight: '160px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              background: '#f1f5f9',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={p.title || 'Property photo'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                dangerouslySetInnerHTML={{ __html: art(p, 0) }}
                                style={{ width: '100%', height: '100%' }}
                              />
                            )}
                          </Link>

                          {/* Property & Requirement Info */}
                          <div className="mc" style={{ flex: 1, minWidth: 0 }}>
                            {/* Requirement Badge (Crucial Fix) */}
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                marginBottom: '8px',
                              }}
                            >
                              <span>🎯 Matched for:</span>
                              <span>{reqLabel}</span>
                            </div>

                            <div className="price" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy)' }}>
                              {money(p.price, p.purpose)}
                            </div>

                            <Link
                              href={`/property/${p.id}`}
                              className="ptitle"
                              style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--navy)', display: 'block', margin: '4px 0 2px', textDecoration: 'none' }}
                            >
                              {p.title}
                            </Link>

                            <div className="loc" style={{ margin: '2px 0 8px', fontSize: '13px', color: 'var(--mut)' }}>
                              📍 {locTxt(p.area || p.address)} {p.bedrooms ? `· ${p.bedrooms} Beds` : ''} {p.sizeSqFt ? `· ${comma(p.sizeSqFt)} sqft` : ''}
                            </div>

                            {/* Direct Owner Contact Box (Unlock Contact Removed) */}
                            <div
                              style={{
                                background: '#fafbfc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '10px 14px',
                                marginTop: '10px',
                                fontSize: '12.5px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>
                                  👤 Owner: {seller.fullName || p.ownerName || 'Direct Property Owner'}
                                </span>
                                <span style={{ fontSize: '11px', color: '#15803d', background: '#dcfce7', padding: '1px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                  ✓ Verified Contact
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                                {(seller.phone || p.contactNumber) && (
                                  <a
                                    href={`tel:${seller.phone || p.contactNumber}`}
                                    style={{
                                      color: 'var(--gold, #d97706)',
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    📞 {seller.phone || p.contactNumber}
                                  </a>
                                )}
                                {seller.email && (
                                  <a
                                    href={`mailto:${seller.email}`}
                                    style={{
                                      color: '#2563eb',
                                      fontWeight: 600,
                                      textDecoration: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    ✉️ {seller.email}
                                  </a>
                                )}
                              </div>

                              {m.sellerNote && (
                                <div
                                  style={{
                                    marginTop: '8px',
                                    padding: '6px 10px',
                                    background: '#fff',
                                    borderRadius: '6px',
                                    borderLeft: '3px solid var(--gold, #d97706)',
                                    color: '#475569',
                                    fontSize: '12px',
                                    fontStyle: 'italic',
                                  }}
                                >
                                  💬 <b>Owner&apos;s Note:</b> &ldquo;{m.sellerNote}&rdquo;
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Match Score & Actions */}
                          <div
                            className="mside"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '130px',
                              paddingLeft: '14px',
                              borderLeft: '1px solid #f1f5f9',
                              gap: '8px',
                            }}
                          >
                            <b style={{ fontSize: '24px', color: 'var(--navy)', lineHeight: 1 }}>{s.total || m.matchScore || 95}%</b>
                            <small style={{ color: 'var(--mut)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Match Score</small>

                            <button
                              type="button"
                              className="btn btn-o btn-sm"
                              style={{ width: '100%', marginTop: '6px' }}
                              onClick={() =>
                                setViewingProp({
                                  ...p,
                                  matchId: m.id,
                                  requirementTitle: reqLabel,
                                })
                              }
                            >
                              📅 Book Visit
                            </button>

                            <Link
                              href={`/property/${p.id}`}
                              className="btn btn-g btn-sm"
                              style={{ width: '100%', textAlign: 'center' }}
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--mut)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
                      <h4 style={{ color: 'var(--navy)', margin: '0 0 6px' }}>No Property Matches Yet</h4>
                      <p style={{ fontSize: '13.5px', margin: '0 0 16px' }}>
                        When property owners suggest verified properties matching your requirements, they will appear here with direct contact details.
                      </p>
                      <Link href="/browse/properties" className="btn btn-g btn-sm">
                        Browse Available Properties →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: VIEWING REQUESTS */}
              {tab === 'visits' && (
                <div>
                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, color: 'var(--navy)' }}>
                        Scheduled Site Visits &amp; Viewing Requests ({buyerVisits.length})
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--mut)' }}>
                        Track your viewing appointments and direct owner visit confirmations.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-g btn-sm"
                      onClick={() => setTab('matches')}
                    >
                      Browse Match Results →
                    </button>
                  </div>

                  {buyerVisits.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {buyerVisits.map((v) => {
                        const p = v.property || {};
                        const seller = v.seller || {};
                        const pImg = getUploadUrl(p.photo || p.photos?.[0]);
                        const isConfirmed = v.visitStatus === 'confirmed';

                        return (
                          <div
                            key={v.id}
                            className="card"
                            style={{
                              padding: '16px 20px',
                              display: 'flex',
                              gap: '18px',
                              alignItems: 'flex-start',
                              borderRadius: '14px',
                              border: '1px solid var(--line)',
                              background: '#fff',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                            }}
                          >
                            {/* Property Thumbnail */}
                            <Link
                              href={`/property/${p.id || v.propertyId}`}
                              style={{
                                width: '130px',
                                height: '100px',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                background: '#f1f5f9',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {pImg ? (
                                <img
                                  src={pImg}
                                  alt={p.title || 'Property'}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <span style={{ fontSize: '28px' }}>🏢</span>
                              )}
                            </Link>

                            {/* Details */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                                <div>
                                  <Link
                                    href={`/property/${p.id || v.propertyId}`}
                                    style={{
                                      fontSize: '16px',
                                      fontWeight: 700,
                                      color: 'var(--navy)',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    {p.title || `Property #${v.propertyId}`}
                                  </Link>
                                  <div style={{ fontSize: '13px', color: 'var(--mut)', marginTop: '2px' }}>
                                    📍 {p.area || p.address || 'Dhaka'} {p.priceDisplay ? `· ${p.priceDisplay}` : ''}
                                  </div>
                                </div>

                                <span
                                  className={`status ${isConfirmed ? 'st-acc' : 'st-pend'}`}
                                  style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px' }}
                                >
                                  {isConfirmed ? '✓ Confirmed by Owner' : '⏳ Awaiting Owner Confirmation'}
                                </span>
                              </div>

                              {/* Requirement reference */}
                              {v.requirementTitle && (
                                <div style={{ fontSize: '12px', color: '#1e40af', marginTop: '6px', fontWeight: 600 }}>
                                  🎯 Matched for: {v.requirementTitle}
                                </div>
                              )}

                              {/* Visit appointment timing */}
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '16px',
                                  marginTop: '10px',
                                  padding: '8px 12px',
                                  background: '#f8fafc',
                                  borderRadius: '8px',
                                  fontSize: '12.5px',
                                }}
                              >
                                <div>
                                  <span style={{ color: 'var(--mut)', display: 'block', fontSize: '11px' }}>Preferred Date</span>
                                  <b style={{ color: 'var(--navy)' }}>📅 {v.visitDate || v.date || 'To be scheduled'}</b>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--mut)', display: 'block', fontSize: '11px' }}>Time Slot</span>
                                  <b style={{ color: 'var(--navy)' }}>⏰ {v.visitSlot || v.slot || 'Morning (10:00 - 12:30)'}</b>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--mut)', display: 'block', fontSize: '11px' }}>Mode</span>
                                  <b style={{ color: 'var(--navy)' }}>
                                    {v.visitMode === 'tsp' ? '🛡️ Through TrueSpace' : '🤝 Direct visit'}
                                  </b>
                                </div>
                              </div>

                              {/* Direct Owner Contact Card */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '16px',
                                  flexWrap: 'wrap',
                                  marginTop: '10px',
                                  fontSize: '12.5px',
                                }}
                              >
                                <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                                  Owner: {seller.fullName || p.ownerName || 'Property Owner'}
                                </span>
                                {(seller.phone || p.contactNumber) && (
                                  <a
                                    href={`tel:${seller.phone || p.contactNumber}`}
                                    style={{
                                      color: 'var(--gold, #d97706)',
                                      fontWeight: 600,
                                      textDecoration: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    📞 {seller.phone || p.contactNumber}
                                  </a>
                                )}
                                {seller.email && (
                                  <a
                                    href={`mailto:${seller.email}`}
                                    style={{
                                      color: '#2563eb',
                                      fontWeight: 500,
                                      textDecoration: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    ✉️ {seller.email}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--mut)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                      <h4 style={{ color: 'var(--navy)', margin: '0 0 6px' }}>No Viewing Visits Scheduled Yet</h4>
                      <p style={{ fontSize: '13.5px', margin: '0 0 16px' }}>
                        When you request a visit on any matched property, your appointment details will appear here.
                      </p>
                      <button
                        type="button"
                        className="btn btn-o btn-sm"
                        onClick={() => setTab('matches')}
                      >
                        View Matched Properties →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: SUGGESTIONS & VISITS (Prototype v39 jsug) */}
              {tab === 'jsug' && (
                <>
                  <div className="list">
                    <h4>
                      <span>My requirements</span>
                      <Link className="btn btn-o btn-sm" href="/requirement">
                        + Post Requirement
                      </Link>
                    </h4>
                    {buyerReqs.length > 0 ? (
                      buyerReqs.map((r) => (
                        <div key={r.id} className="li">
                          <div className="grow">
                            <b>
                              {r.beds ? `${r.beds}-bed ` : ''}
                              {r.type} to {r.purpose === 'Rent' ? 'rent' : 'buy'} · {r.id}
                            </b>
                            <small>
                              {(r.areas || []).map(locTxt).join(' / ')} ·{' '}
                              {r.purpose === 'Rent'
                                ? `৳${Number(r.minBudget).toLocaleString()} – ৳${Number(r.maxBudget).toLocaleString()}/mo`
                                : `৳${(r.minBudget / 10000000).toFixed(2)} Cr – ৳${(r.maxBudget / 10000000).toFixed(2)} Cr`}
                            </small>
                            <small style={{ color: 'var(--mut)' }}>
                              Public on the requirements board. Sellers can suggest properties.
                            </small>
                          </div>
                          <span className="status st-acc">Approved · Public</span>
                        </div>
                      ))
                    ) : (
                      <div className="li">
                        <div className="grow">
                          You have not posted a requirement yet.{' '}
                          <Link href="/requirement" className="lnk2">
                            Post one now →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="list">
                    <h4>
                      <span>Suggested properties</span>
                      <small className="hs" style={{ color: 'var(--mut)', fontWeight: 400 }}>
                        from sellers &amp; rent givers
                      </small>
                    </h4>
                    {buyerSuggestions.length > 0 ? (
                      buyerSuggestions.map((g) => (
                        <div
                          key={g.id}
                          className="jcard"
                          style={{
                            padding: '16px',
                            border: '1px solid var(--line)',
                            borderRadius: '14px',
                            marginBottom: '14px',
                            background: '#fff',
                          }}
                        >
                          <div
                            className="jrow"
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              flexWrap: 'wrap',
                              gap: '8px',
                            }}
                          >
                            <div>
                              <Link
                                href={`/property/${g.pid}`}
                                style={{ fontWeight: 700, fontSize: '15px', color: 'var(--navy)' }}
                              >
                                {g.title}
                              </Link>
                              <div style={{ fontSize: '12.5px', color: 'var(--mut)', marginTop: '2px' }}>
                                {g.area} · ৳{Number(g.price).toLocaleString()} · Suggested by {g.by} for your requirement
                              </div>
                            </div>
                            <span className="status st-new">New Suggestion</span>
                          </div>

                          <div style={{ margin: '8px 0', fontSize: '12px' }}>
                            <span className="jb">✓ Verified Photos</span>
                            <span className="jb">✓ Title Deed Checked</span>
                          </div>

                          {g.visitRequested ? (
                            <div
                              style={{
                                background: '#e7f6ee',
                                borderRadius: '10px',
                                padding: '10px 14px',
                                fontSize: '13px',
                                color: '#14794b',
                              }}
                            >
                              <b>Visit scheduled:</b>{' '}
                              {g.visitRequested.mode === 'direct'
                                ? 'Direct with seller (Contact shared)'
                                : 'Through TrueSpace (Contact private)'}{' '}
                              · {g.visitRequested.date}, {g.visitRequested.slot}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                              <button
                                type="button"
                                className="btn btn-o btn-sm"
                                onClick={() => {
                                  setViewingProp({
                                    id: g.pid,
                                    title: g.title,
                                    area: g.area,
                                    price: g.price,
                                    purpose: g.purpose,
                                    suggestionId: g.id,
                                    mode: 'direct',
                                  });
                                }}
                              >
                                Request visit directly
                              </button>
                              <button
                                type="button"
                                className="btn btn-n btn-sm"
                                onClick={() => {
                                  setViewingProp({
                                    id: g.pid,
                                    title: g.title,
                                    area: g.area,
                                    price: g.price,
                                    purpose: g.purpose,
                                    suggestionId: g.id,
                                    mode: 'tsp',
                                  });
                                }}
                              >
                                Request visit through TSP
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="li">
                        <div className="grow" style={{ color: 'var(--mut)' }}>
                          No suggested properties yet. When an owner suggests a property for your requirement, it appears here.
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB: IDENTITY VERIFICATION (Prototype v39 jver) */}
              {tab === 'jver' && (
                <div className="fcard">
                  <h3 style={{ margin: '0 0 6px', color: 'var(--navy)' }}>Buyer &amp; Tenant Verification</h3>
                  <p style={{ color: 'var(--mut)', fontSize: '13.5px', margin: '0 0 20px' }}>
                    All verification is optional. Earning verified badges increases trust with sellers and unlocks immediate priority visit scheduling.
                  </p>

                  <div style={{ display: 'grid', gap: '14px' }}>
                    {[
                      {
                        k: 'nid',
                        name: 'NID Verified',
                        desc: 'National ID card (front and back smart card OCR)',
                        price: 'Free',
                      },
                      {
                        k: 'card',
                        name: 'Business Card Verified',
                        desc: 'Verified employment, official email or company badge',
                        price: 'Free',
                      },
                      {
                        k: 'trade',
                        name: 'Trade License Verified',
                        desc: 'Trade license for corporate, commercial or retail tenant entities',
                        price: 'Free',
                      },
                    ].map((b) => {
                      const st = buyerBadges[b.k];
                      return (
                        <div
                          key={b.k}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px 18px',
                            border: '1.5px solid var(--line)',
                            borderRadius: '12px',
                            background: st === 'approved' ? '#f0fdf4' : '#fff',
                          }}
                        >
                          <div>
                            <b style={{ color: 'var(--navy)', fontSize: '14.5px' }}>{b.name}</b>
                            <small style={{ display: 'block', color: 'var(--mut)' }}>{b.desc}</small>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span
                              className={`status ${
                                st === 'approved' ? 'st-acc' : st === 'pending' ? 'st-pend' : 'st-dec'
                              }`}
                            >
                              {st === 'approved' ? '✓ Verified' : st === 'pending' ? 'Under Review' : 'Unverified'}
                            </span>
                            {st !== 'approved' && st !== 'pending' && (
                              <button
                                type="button"
                                className="btn btn-g btn-sm"
                                onClick={() => {
                                  setBuyerBadges((prev) => ({ ...prev, [b.k]: 'pending' }));
                                  showToast('✓ Submitted for verification. TrueSpace admin will review it.');
                                }}
                              >
                                Request badge
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: PROFILE */}
              {tab === 'profile' && (
                <div className="fcard">
                  <h3 style={{ margin: '0 0 16px', color: 'var(--navy)' }}>Profile settings</h3>
                  <div className="frow">
                    <div className="fl">
                      <label>Full Name</label>
                      <input type="text" defaultValue={currentUser?.fullName || currentUser?.name || ''} />
                    </div>
                    <div className="fl">
                      <label>Email Address</label>
                      <input type="email" defaultValue={currentUser?.email || ''} />
                    </div>
                  </div>
                  <div className="frow">
                    <div className="fl">
                      <label>Phone Number (Private)</label>
                      <input type="tel" defaultValue={currentUser?.phone || ''} />
                    </div>
                    <div className="fl">
                      <label>Preferred City</label>
                      <input type="text" defaultValue={currentUser?.city || 'Dhaka City'} disabled />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-o btn-sm"
                    onClick={() => showToast('✓ Profile updated successfully')}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </>
          )}

          {/* ================= OWNER PORTAL ================= */}
          {role === 'owner' && (
            <>
              {/* TAB: OVERVIEW (EXACT PROTOTYPE V39 VISUAL REPLICA) */}
              {tab === 'overview' && (
                <>
                  <div className="kpis">
                    <div className="kpi">
                      <b>{sellerStats.total || ownerListings.length}</b>
                      <span>Active listings</span>
                    </div>
                    <div className="kpi">
                      <b>{svrList.filter((s) => s.status === 'pending').length}</b>
                      <span>Visit requests to confirm</span>
                    </div>
                    <div className="kpi">
                      <b>{svrList.filter((s) => s.status === 'confirmed').length}</b>
                      <span>Upcoming confirmed visits</span>
                    </div>
                    <div className="kpi">
                      <b>{sellerStats.totalLeads || leadsList.length}</b>
                      <span>Open leads</span>
                    </div>
                  </div>

                  {/* VERIFICATION CARD */}
                  <div className="sec vcard">
                    <div className="vhead">
                      <div className="ric">
                        {ICONS.check}
                      </div>
                      <div className="grow">
                        <h3 style={{ margin: 0 }}>
                          {currentUser?.isVerified ? 'Seller Identity Verified' : 'Verification status'}
                        </h3>
                        <small style={{ color: 'var(--mut)' }}>
                          {currentUser?.isVerified ? '100% verified · Approved by TrueSpace admin' : `${verifPercent}% complete · Documents needed`}
                        </small>
                      </div>
                      <button type="button" className="btn btn-g btn-sm" onClick={() => setTab('verify')}>
                        View details
                      </button>
                    </div>
                    <div className="prog">
                      <i style={{ width: currentUser?.isVerified ? '100%' : `${verifPercent}%` }}></i>
                    </div>
                    <div className="vtrack">
                      <div className="d"><b>✓</b>Account</div>
                      <div className={currentUser?.isVerified ? 'd' : 'c'}><b>2</b>Identity</div>
                      <div className={ownerListings.length > 0 ? 'd' : ''}><b>3</b>Ownership</div>
                      <div><b>4</b>Documents</div>
                      <div className={currentUser?.isVerified ? 'd' : ''}><b>5</b>Verified</div>
                    </div>
                  </div>

                  {/* LIST 1: SITE VISIT REQUESTS WAITING FOR YOU */}
                  <div className="list">
                    <h4>
                      <span>Site visit requests waiting for you</span>
                      <button type="button" className="btn btn-l btn-sm" onClick={() => setTab('svr')}>
                        Manage →
                      </button>
                    </h4>
                    {svrList.filter((s) => s.status === 'pending').length > 0 ? (
                      svrList.filter((s) => s.status === 'pending').map((r) => {
                        const prop = allProps.find((p) => p.id === r.pid);
                        return (
                          <div key={r.id} className="li">
                            {prop && (
                              <div
                                className="th"
                                dangerouslySetInnerHTML={{ __html: art(prop, 0) }}
                              />
                            )}
                            <div className="grow">
                              <span className="pident">
                                <Link href={`/property/${r.pid}`} className="pidl">
                                  TSP-{r.pid}
                                </Link>{' '}
                                <Link href={`/property/${r.pid}`} className="pnml">
                                  <b>{prop?.title || 'Dhaka Property'}</b>
                                </Link>
                              </span>
                              <small>{r.name} · {r.date}, {r.time}</small>
                            </div>
                            <span className="status st-pend">Awaiting confirmation</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="li">
                        <div className="grow" style={{ color: 'var(--mut)', textAlign: 'center', padding: '12px' }}>
                          No pending site visit requests.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LIST 2: NEXT CONFIRMED VISITS */}
                  <div className="list">
                    <h4>
                      <span>Next confirmed visits</span>
                      <button type="button" className="btn btn-l btn-sm" onClick={() => setTab('cal')}>
                        Open calendar →
                      </button>
                    </h4>
                    {svrList.filter((s) => s.status === 'confirmed').length > 0 ? (
                      svrList.filter((s) => s.status === 'confirmed').map((r) => {
                        const prop = allProps.find((p) => p.id === r.pid);
                        return (
                          <div key={r.id} className="li">
                            {prop && (
                              <div
                                className="th"
                                dangerouslySetInnerHTML={{ __html: art(prop, 0) }}
                              />
                            )}
                            <div className="grow">
                              <span className="pident">
                                <Link href={`/property/${r.pid}`} className="pidl">
                                  TSP-{r.pid}
                                </Link>{' '}
                                <Link href={`/property/${r.pid}`} className="pnml">
                                  <b>{prop?.title || 'Dhaka Property'}</b>
                                </Link>
                              </span>
                              <small>{r.name} · {r.date}, {r.time}</small>
                            </div>
                            <span className="status st-acc">Confirmed</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="li">
                        <div className="grow" style={{ color: 'var(--mut)', textAlign: 'center', padding: '12px' }}>
                          No confirmed visits scheduled yet.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LIST 3: LEAD CENTER */}
                  <div className="list">
                    <h4>
                      <span>Lead Center</span>
                      <button type="button" className="btn btn-l btn-sm" onClick={() => setTab('leads')}>
                        Open →
                      </button>
                    </h4>
                    {leadsList.length > 0 ? (
                      <div className="li">
                        <div className="grow xlsum" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          <span className="status st-new">Total Leads: {leadsList.length}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="li">
                        <div className="grow" style={{ color: 'var(--mut)', textAlign: 'center', padding: '12px' }}>
                          No active leads currently.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LIST 4: SUGGESTED PROPERTIES TO BUYER REQUIREMENTS */}
                  <div className="list">
                    <h4>
                      <span>
                        Your suggested properties <small className="hs">to buyer requirements</small>
                      </span>
                      <Link className="btn btn-l btn-sm" href="/requirements">
                        Browse requirements →
                      </Link>
                    </h4>
                    {ownerSuggestions.length > 0 ? (
                      ownerSuggestions.map((g) => {
                        const prop = allProps.find((p) => p.id === g.pid);
                        return (
                          <div key={g.id} className="li">
                            {prop && (
                              <div
                                className="th"
                                dangerouslySetInnerHTML={{ __html: art(prop, 0) }}
                              />
                            )}
                            <div className="grow">
                              <span className="pident">
                                <Link href={`/property/${g.pid}`} className="pidl">
                                  TSP-{g.pid}
                                </Link>{' '}
                                <Link href={`/property/${g.pid}`} className="pnml">
                                  <b>{prop?.title || 'Dhaka Property'}</b>
                                </Link>
                              </span>
                              <small>Suggested for {g.rid} · {g.at}</small>
                            </div>
                            <span className="status st-acc">Sent to buyer</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="li">
                        <div className="grow" style={{ color: 'var(--mut)', textAlign: 'center', padding: '12px' }}>
                          No properties suggested to buyer requirements yet.
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB: MY LISTINGS */}
              {tab === 'listings' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div className="chips">
                      {['all', 'active', 'review', 'sold'].map((f) => (
                        <button
                          key={f}
                          type="button"
                          className={`chip ${listingFilter === f ? 'on' : ''}`}
                          onClick={() => setListingFilter(f)}
                        >
                          {f === 'all' ? 'All Listings' : f === 'active' ? 'Active' : f === 'review' ? 'In Review' : 'Sold/Rented'}
                        </button>
                      ))}
                    </div>

                    <Link href="/list" className="btn btn-o btn-sm">
                      + List a property
                    </Link>
                  </div>

                  <div className="list">
                    {ownerListings.length > 0 ? (
                      ownerListings
                        .filter((p) => {
                          if (listingFilter === 'all') return true;
                          if (listingFilter === 'active') return p.status === 'verified' || p.status === 'approved';
                          if (listingFilter === 'review') return p.status === 'pending';
                          if (listingFilter === 'sold') return p.status === 'sold';
                          return true;
                        })
                        .map((p) => {
                          const overridePrice = store.v3.lst?.[p.id]?.price || p.price;
                          const isApproved = p.status === 'verified' || p.status === 'approved';

                          return (
                            <div key={p.id} className="li">
                              <div
                                className="th"
                                dangerouslySetInnerHTML={{ __html: art(p, 0) }}
                              />
                              <div className="grow">
                                <Link href={`/property/${p.id}`} style={{ fontWeight: '600', color: 'var(--navy)' }}>
                                  {p.title}
                                </Link>
                                <small style={{ color: 'var(--mut)' }}>
                                  📍 {locTxt(p.area || p.sector || 'Dhaka')} · <b>{money(overridePrice, p.purpose)}</b> · For {p.purpose || 'Sale'}
                                </small>
                                <small style={{ color: 'var(--mut)' }}>
                                  Views: {p.views || 0} · ID: TSP-{p.id}
                                </small>
                              </div>
                              <span className={`status ${isApproved ? 'st-acc' : p.status === 'rejected' ? 'st-dec' : 'st-pend'}`}>
                                {isApproved ? '✓ Verified · Live' : p.status === 'rejected' ? 'Rejected' : 'Pending verification'}
                              </span>
                              <button
                                type="button"
                                className="btn btn-g btn-sm"
                                onClick={() => {
                                  setEditingPriceProp(p);
                                  setNewPriceInput(overridePrice);
                                }}
                              >
                                Edit price
                              </button>
                            </div>
                          );
                        })
                    ) : (
                      <div className="li">
                        <div className="grow" style={{ color: 'var(--mut)', textAlign: 'center', padding: '36px 16px' }}>
                          <p style={{ margin: '0 0 12px' }}>You haven&apos;t listed any properties yet.</p>
                          <Link href="/list" className="btn btn-o btn-sm">
                            + List a property
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: SUGGESTIONS & VIEWINGS */}
              {tab === 'sv' && (
                <>
                  <div className="chips" style={{ marginBottom: '16px' }}>
                    <button
                      type="button"
                      className={`chip ${ownerSvSubTab === 'sug' ? 'on' : ''}`}
                      onClick={() => setOwnerSvSubTab('sug')}
                    >
                      Your suggested properties ({ownerSuggestions.length})
                    </button>
                    <button
                      type="button"
                      className={`chip ${ownerSvSubTab === 'vis' ? 'on' : ''}`}
                      onClick={() => setOwnerSvSubTab('vis')}
                    >
                      Viewing requests ({svrList.filter((s) => s.status === 'pending').length} waiting)
                    </button>
                  </div>

                  {ownerSvSubTab === 'sug' ? (
                    <div className="list">
                      <h4>
                        <span>Your suggested properties <small className="hs" style={{ color: 'var(--mut)', fontWeight: 400 }}>to buyer requirements</small></span>
                        <Link className="btn btn-l btn-sm" href="/requirements">
                          Browse requirements →
                        </Link>
                      </h4>
                      {ownerSuggestions.map((g) => {
                        const prop = allProps.find((p) => String(p.id) === String(g.pid));
                        return (
                          <div key={g.id} className="li">
                            {prop && (
                              <div
                                className="th"
                                dangerouslySetInnerHTML={{ __html: art(prop, 0) }}
                              />
                            )}
                            <div className="grow">
                              <b>TSP-{g.pid} · {prop?.title || 'Dhaka Property'}</b>
                              <small style={{ color: 'var(--mut)' }}>
                                Suggested for requirement <b>{g.rid}</b> · {g.at}
                              </small>
                            </div>
                            <span className={`status ${g.status === 'approved' ? 'st-acc' : 'st-pend'}`}>
                              {g.status === 'approved' ? 'Approved · Shown to buyer' : 'Pending admin review'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="list">
                      <h4>
                        <span>Site visit requests</span>
                        <button type="button" className="btn btn-l btn-sm" onClick={() => setTab('svr')}>
                          Open full manager ({svrList.length}) →
                        </button>
                      </h4>
                      {svrList.slice(0, 4).map((r) => {
                        const prop = allProps.find((p) => String(p.id) === String(r.pid));
                        return (
                          <div key={r.id} className="li">
                            {prop && (
                              <div
                                className="th"
                                dangerouslySetInnerHTML={{ __html: art(prop, 0) }}
                              />
                            )}
                            <div className="grow">
                              <b>{r.name}</b> · {r.date}, {r.time}
                              <small style={{ color: 'var(--mut)' }}>
                                TSP-{r.pid} · {prop?.title}
                              </small>
                            </div>
                            <span className={`status ${r.status === 'confirmed' ? 'st-acc' : r.status === 'completed' ? 'xst-done' : r.status === 'resched' ? 'xst-rs' : r.status === 'declined' ? 'st-dec' : 'st-pend'}`}>
                              {r.status === 'confirmed' ? 'Confirmed' : r.status === 'completed' ? 'Completed' : r.status === 'resched' ? 'New time proposed' : r.status === 'declined' ? 'Declined' : 'Awaiting confirmation'}
                            </span>
                            <button type="button" className="btn btn-g btn-sm" onClick={() => setTab('svr')}>
                              Manage →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* TAB: SITE VISIT REQUESTS (v19 Seller Dashboard) */}
              {tab === 'svr' && (
                <>
                  <h3 className="svh">Site Visit Requests</h3>
                  <p className="xintro">
                    See who wants to visit which property, when, and what they are looking for. Tap a property ID or name to check the exact property before you respond.
                  </p>

                  <div className="chips xchips" style={{ marginBottom: '16px' }}>
                    {[
                      ['all', 'All'],
                      ['pending', 'Awaiting confirmation'],
                      ['confirmed', 'Confirmed'],
                      ['resched', 'New time proposed'],
                      ['completed', 'Completed'],
                      ['declined', 'Declined'],
                    ].map(([key, label]) => {
                      const count = key === 'all' ? svrList.length : svrList.filter((s) => s.status === key).length;
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`chip ${ownerSvrFilter === key ? 'on' : ''}`}
                          onClick={() => setOwnerSvrFilter(key)}
                        >
                          {label} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {svrList
                    .filter((r) => ownerSvrFilter === 'all' || r.status === ownerSvrFilter)
                    .map((r) => {
                      const prop = allProps.find((p) => String(p.id) === String(r.pid));
                      const stLabels = {
                        pending: ['Awaiting confirmation', 'st-pend'],
                        confirmed: ['Confirmed', 'st-acc'],
                        resched: ['New time proposed', 'xst-rs'],
                        completed: ['Completed', 'xst-done'],
                        declined: ['Declined', 'st-dec'],
                      };
                      const [stTxtLabel, stCls] = stLabels[r.status] || ['Pending', 'st-pend'];

                      return (
                        <div key={r.id} className="xcard" style={{ marginBottom: '16px' }}>
                          <div className="xch">
                            <div>
                              <b>{r.id}</b>
                              <small className="xsub">Request received {r.reqAt}</small>
                            </div>
                            <span className={`status ${stCls}`}>{stTxtLabel}</span>
                          </div>

                          <div className="xprop">
                            {prop && (
                              <div
                                className="th"
                                dangerouslySetInnerHTML={{ __html: art(prop, 0) }}
                              />
                            )}
                            <div style={{ minWidth: 0 }}>
                              <b>TSP-{r.pid} · {prop?.title}</b>
                              <small className="xsub">
                                📍 {locTxt(prop?.area || 'Uttara, Dhaka')} · {money(prop?.price || 12000000, prop?.purpose || 'Sale')} · For {prop?.purpose || 'Sale'}
                              </small>
                            </div>
                          </div>

                          <div className="xgrid">
                            <div className="xf">
                              <small>{r.role === 'Tenant' ? 'Tenant name' : 'Buyer name'}</small>
                              <div>
                                {r.mode === 'tsp' ? (
                                  <span className="xpriv">Private (TSP-managed visit)</span>
                                ) : (
                                  <b>{r.name}</b>
                                )}
                              </div>
                            </div>

                            <div className="xf">
                              <small>Contact number</small>
                              <div>
                                {r.mode === 'tsp' ? (
                                  <span className="xpriv">🔒 Buyer contact private (Through TSP). Not shared with you.</span>
                                ) : (
                                  <b>{r.phone}</b>
                                )}
                              </div>
                            </div>

                            <div className="xf">
                              <small>Property ID &amp; name</small>
                              <div>
                                <Link href={`/property/${r.pid}`} className="pidl">
                                  TSP-{r.pid}
                                </Link>{' '}
                                · <span>{prop?.title}</span>
                              </div>
                            </div>

                            <div className="xf">
                              <small>Preferred date &amp; time</small>
                              <div>
                                <b>{r.date}</b>
                                <br />
                                <span>{r.time}</span>
                              </div>
                            </div>

                            {r.newDate && r.status !== 'pending' && (
                              <div className="xf">
                                <small>New time you proposed</small>
                                <div>
                                  <b>{r.newDate}</b>
                                  <br />
                                  <span>{r.newTime}</span>
                                </div>
                              </div>
                            )}

                            <div className="xf">
                              <small>Request date</small>
                              <div>{r.reqAt}</div>
                            </div>

                            <div className="xf">
                              <small>Status</small>
                              <div>
                                <span className={`status ${stCls}`}>{stTxtLabel}</span>
                              </div>
                            </div>

                            <div className="xf w">
                              <small>Requirement details</small>
                              <div>
                                {r.req}
                                {r.rid && <small className="xsub" style={{ display: 'block', marginTop: '2px' }}>Buyer requirement {r.rid}</small>}
                              </div>
                            </div>
                          </div>

                          {r.mode === 'tsp' ? (
                            <div className="xcons n">
                              🔒 Buyer contact private: this buyer / tenant chose Through TSP and has not shared their contact with you. TrueSpace coordinates the visit.
                            </div>
                          ) : (
                            <div className="xcons">
                              ✓ Buyer contact shared with seller: {r.name} chose a Direct visit on {r.reqAt} and agreed to share their name and number with you for this property. Shown on your dashboard for 30 days.
                            </div>
                          )}

                          <div className="xacts" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                            {(r.status === 'pending' || r.status === 'resched') && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-o btn-sm"
                                  onClick={() => handleSvrConfirm(r.id)}
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-g btn-sm"
                                  onClick={() => handleSvrDecline(r.id)}
                                >
                                  Decline
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-g btn-sm"
                                  onClick={() => {
                                    setProposingSvr(r);
                                    setProposeDate(r.date);
                                    setProposeTime('11:00 AM');
                                  }}
                                >
                                  Propose New Time
                                </button>
                              </>
                            )}

                            {r.status === 'confirmed' && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-o btn-sm"
                                  onClick={() => handleSvrComplete(r.id)}
                                >
                                  Mark as Completed
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-g btn-sm"
                                  onClick={() => {
                                    setProposingSvr(r);
                                    setProposeDate(r.date);
                                    setProposeTime('11:00 AM');
                                  }}
                                >
                                  Propose New Time
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-g btn-sm"
                                  onClick={() => handleSvrDecline(r.id)}
                                >
                                  Decline
                                </button>
                              </>
                            )}

                            {r.history && r.history.length > 0 && (
                              <button
                                type="button"
                                className="btn btn-l btn-sm"
                                onClick={() => handleSvrUndo(r.id)}
                              >
                                Undo
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  <p className="fine" style={{ color: 'var(--mut)', fontSize: '12.5px', marginTop: '16px' }}>
                    Prototype: Confirm, Decline, Propose New Time, Mark as Completed and Undo only change the status in this browser. No SMS, message or reply is sent, and this dashboard has no messaging. Confirmed visits appear in the Viewing Calendar.
                  </p>
                </>
              )}

              {/* TAB: VIEWING CALENDAR (v19 Seller Dashboard) */}
              {tab === 'cal' && (
                <>
                  <h3 className="svh">Viewing Calendar</h3>
                  <p className="xintro">
                    Your confirmed site visits at a glance. Confirm a request in Site Visit Requests and it appears here.
                  </p>

                  <div className="xcalbar">
                    <div className="chips" style={{ margin: 0 }}>
                      {[['day', 'Daily'], ['week', 'Weekly'], ['month', 'Monthly']].map(([v, label]) => (
                        <button
                          key={v}
                          type="button"
                          className={`chip ${ownerCalView === v ? 'on' : ''}`}
                          onClick={() => setOwnerCalView(v)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="xnav">
                      <button
                        type="button"
                        className="btn btn-g btn-sm"
                        onClick={() => showToast('Previous range')}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="btn btn-g btn-sm"
                        onClick={() => showToast('Viewing current schedule')}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        className="btn btn-g btn-sm"
                        onClick={() => showToast('Next range')}
                      >
                        ›
                      </button>
                    </div>
                    <b className="xct">Sun 25 Oct – Sat 31 Oct 2026</b>
                  </div>

                  <div className="xleg">
                    <span><i style={{ background: '#1f9d61' }} />Confirmed (upcoming visit)</span>
                    <span><i style={{ background: '#2c4a9a' }} />Completed</span>
                    <span>Awaiting confirmation, new time proposed and declined requests are not placed on the calendar.</span>
                  </div>

                  {/* WEEKLY VIEW */}
                  {ownerCalView === 'week' && (
                    <div className="xweek">
                      {[
                        { day: 'Sun', date: '25', fullDate: '2026-10-25', month: 'Oct' },
                        { day: 'Mon', date: '26', fullDate: '2026-10-26', month: 'Oct' },
                        { day: 'Tue', date: '27', fullDate: '2026-10-27', month: 'Oct', today: true },
                        { day: 'Wed', date: '28', fullDate: '2026-10-28', month: 'Oct' },
                        { day: 'Thu', date: '29', fullDate: '2026-10-29', month: 'Oct' },
                        { day: 'Fri', date: '30', fullDate: '2026-10-30', month: 'Oct' },
                        { day: 'Sat', date: '31', fullDate: '2026-10-31', month: 'Oct' },
                      ].map((col) => {
                        const dayVisits = svrList.filter(
                          (r) =>
                            (r.status === 'confirmed' || r.status === 'completed') &&
                            (r.newDate === col.fullDate || (!r.newDate && r.date === col.fullDate))
                        );

                        return (
                          <div key={col.day} className={`xwd ${col.today ? 'td' : ''}`}>
                            <button
                              type="button"
                              className="xwh"
                              onClick={() => setOwnerCalView('day')}
                            >
                              {col.day} <b>{col.date}</b> <span>{col.month}</span>
                            </button>

                            {dayVisits.length > 0 ? (
                              dayVisits.map((v) => {
                                const prop = allProps.find((p) => String(p.id) === String(v.pid));
                                return (
                                  <div
                                    key={v.id}
                                    className={`xev ${v.status === 'completed' ? 'x-completed' : ''}`}
                                  >
                                    <div className="xet">
                                      <span>{v.newTime || v.time.split('–')[0]}</span>
                                      <span className={`status ${v.status === 'completed' ? 'xst-done' : 'st-acc'}`}>
                                        {v.status === 'completed' ? 'Completed' : 'Confirmed'}
                                      </span>
                                    </div>
                                    <b>TSP-{v.pid}</b>
                                    <small>
                                      {v.id} · {v.name}
                                      {v.mode === 'direct' && v.phone && ` · ${v.phone}`}
                                    </small>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="xnone">No visits</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* DAILY VIEW */}
                  {ownerCalView === 'day' && (
                    <div className="xday">
                      <h4 style={{ margin: '0 0 12px', color: 'var(--navy)' }}>Wednesday 28 Oct 2026</h4>
                      {svrList
                        .filter((r) => r.status === 'confirmed' || r.status === 'completed')
                        .slice(0, 3)
                        .map((v) => {
                          const prop = allProps.find((p) => String(p.id) === String(v.pid));
                          return (
                            <div
                              key={v.id}
                              className={`xev ${v.status === 'completed' ? 'x-completed' : ''}`}
                              style={{ marginBottom: '12px' }}
                            >
                              <div className="xet">
                                <span>{v.date}, {v.newTime || v.time}</span>
                                <span className={`status ${v.status === 'completed' ? 'xst-done' : 'st-acc'}`}>
                                  {v.status === 'completed' ? 'Completed' : 'Confirmed'}
                                </span>
                              </div>
                              <b>TSP-{v.pid} · {prop?.title}</b>
                              <small>
                                {v.id} · Buyer: {v.name} · {v.mode === 'direct' ? v.phone : 'Through TSP'}
                              </small>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* MONTHLY VIEW */}
                  {ownerCalView === 'month' && (
                    <div className="xmonth">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
                        <div key={w} className="xmh">
                          {w}
                        </div>
                      ))}
                      {Array.from({ length: 35 }, (_, i) => {
                        const d = i - 3;
                        const isCurrentMonth = d >= 1 && d <= 31;
                        const dateNum = isCurrentMonth ? d : d <= 0 ? 30 + d : d - 31;
                        const isToday = d === 27;
                        const hasVisit = d === 28 || d === 30 || d === 31;

                        return (
                          <div
                            key={i}
                            className={`xmc ${!isCurrentMonth ? 'out' : ''} ${isToday ? 'td' : ''}`}
                            onClick={() => setOwnerCalView('day')}
                          >
                            <span className="xmn">{dateNum}</span>
                            {hasVisit && isCurrentMonth && (
                              <div className="xevm">
                                <b>{d === 28 ? '5:00 PM' : '11:00 AM'}</b> TSP-{d === 28 ? 1002 : 1001}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* UPCOMING CONFIRMED VISITS LIST */}
                  <div className="list" style={{ marginTop: '22px' }}>
                    <h4>
                      <span>
                        Upcoming confirmed visits{' '}
                        <small className="hs" style={{ color: 'var(--mut)', fontWeight: 400 }}>
                          ({svrList.filter((r) => r.status === 'confirmed').length})
                        </small>
                      </span>
                      {svrList.filter((r) => r.status === 'pending').length > 0 && (
                        <button
                          type="button"
                          className="btn btn-l btn-sm"
                          onClick={() => setTab('svr')}
                        >
                          {svrList.filter((r) => r.status === 'pending').length} request(s) waiting →
                        </button>
                      )}
                    </h4>

                    {svrList
                      .filter((r) => r.status === 'confirmed')
                      .map((r) => {
                        const prop = allProps.find((p) => String(p.id) === String(r.pid));
                        return (
                          <div key={r.id} className="li">
                            {prop && (
                              <div
                                className="th"
                                dangerouslySetInnerHTML={{ __html: art(prop, 0) }}
                              />
                            )}
                            <div className="grow">
                              <b>
                                {r.date} · {r.time}
                              </b>
                              <br />
                              <span>
                                TSP-{r.pid} · {prop?.title}
                              </span>
                              <small style={{ color: 'var(--mut)' }}>
                                {r.id} · {r.name} {r.mode === 'direct' && r.phone ? `(${r.phone})` : '(Through TSP)'}
                              </small>
                            </div>
                            <span className="status st-acc">Confirmed</span>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}

              {/* TAB: LEAD CENTER (v19 Seller Dashboard) */}
              {tab === 'leads' && (
                <>
                  <h3 className="svh">Lead Center</h3>
                  <p className="xintro">
                    Every buyer or tenant who showed interest in your properties, with the stage you have reached with them.
                  </p>

                  <div className="xpol">
                    <b>🔒 Lead privacy rule</b>
                    <ul>
                      <li>
                        <b>30 days on your dashboard:</b> a buyer&apos;s or tenant&apos;s name and number are shown here for 30 days from the request date. After that they are removed from your dashboard automatically; the lead, the property and the status stay.
                      </li>
                      <li>
                        <b>Admin records are permanent:</b> TrueSpace admin keeps the full lead record, including contact details and consent, for safety and dispute checks. The 30-day rule does not affect it.
                      </li>
                      <li>
                        <b>Consent first:</b> contact details only appear when the buyer or tenant agreed to share them with you. The consent and its date are shown on each lead.
                      </li>
                    </ul>
                  </div>

                  <div className="kpis x4" style={{ margin: '18px 0' }}>
                    <div className="kpi">
                      <b>{leadsList.length}</b>
                      <span>Total leads</span>
                    </div>
                    <div className="kpi">
                      <b>{leadsList.filter((l) => l.status === 'New').length}</b>
                      <span>New</span>
                    </div>
                    <div className="kpi">
                      <b>{leadsList.filter((l) => l.status === 'Visit scheduled').length}</b>
                      <span>Visit scheduled</span>
                    </div>
                    <div className="kpi">
                      <b>{leadsList.filter((l) => l.expired).length}</b>
                      <span>Details expired</span>
                    </div>
                  </div>

                  <div className="chips xchips" style={{ marginBottom: '16px' }}>
                    {[
                      'all',
                      'New',
                      'Contacted',
                      'Visit scheduled',
                      'Visit completed',
                      'Negotiating',
                      'Closed',
                      'Not interested',
                      'Not reachable',
                    ].map((s) => {
                      const count = s === 'all' ? leadsList.length : leadsList.filter((l) => l.status === s).length;
                      return (
                        <button
                          key={s}
                          type="button"
                          className={`chip ${ownerLeadFilter === s ? 'on' : ''}`}
                          onClick={() => setOwnerLeadFilter(s)}
                        >
                          {s === 'all' ? 'All' : s} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {leadsList
                    .filter((l) => ownerLeadFilter === 'all' || l.status === ownerLeadFilter)
                    .map((l) => {
                      const prop = allProps.find((p) => String(p.id) === String(l.pid));
                      const stClsMap = {
                        New: 'st-new',
                        Contacted: 'st-pend',
                        'Visit scheduled': 'st-acc',
                        'Visit completed': 'xst-done',
                        Negotiating: 'xst-rs',
                        Closed: 'st-acc',
                        'Not interested': 'st-dec',
                        'Not reachable': 'st-dec',
                      };

                      return (
                        <div key={l.id} className={`xcard ${l.expired ? 'exp' : ''}`} style={{ marginBottom: '16px' }}>
                          <div className="xch">
                            <div>
                              <b>{l.id}</b>
                              <small className="xsub">{l.src} · received {l.at}</small>
                            </div>
                            <span className={`status ${stClsMap[l.status] || 'st-pend'}`}>{l.status}</span>
                          </div>

                          <div className="xgrid">
                            <div className="xf">
                              <small>Buyer / tenant</small>
                              <div>{l.expired ? <span className="xpriv">Removed after 30 days</span> : <b>{l.name}</b>}</div>
                            </div>

                            <div className="xf">
                              <small>Contact number</small>
                              <div>{l.expired ? <span className="xpriv">Removed after 30 days</span> : <b>{l.phone}</b>}</div>
                            </div>

                            <div className="xf">
                              <small>Property ID &amp; name</small>
                              <div>
                                <Link href={`/property/${l.pid}`} className="pidl">
                                  TSP-{l.pid}
                                </Link>{' '}
                                · <span>{prop?.title || 'Dhaka Property'}</span>
                              </div>
                            </div>

                            <div className="xf">
                              <small>Personal details on your dashboard</small>
                              <div>
                                {l.expired ? (
                                  <span className="status st-dec">Expired (30-day rule)</span>
                                ) : (
                                  <span className="status st-pend">{l.daysLeft} days left</span>
                                )}
                              </div>
                            </div>

                            <div className="xf w">
                              <small>Requirement</small>
                              <div>{l.req}</div>
                            </div>
                          </div>

                          {l.expired ? (
                            <div className="xcons n">
                              Personal details were removed from your dashboard 30 days after the request. The lead, its property and its status stay. TrueSpace admin keeps the permanent record.
                            </div>
                          ) : (
                            <div className="xcons">
                              ✓ Consent recorded: {l.name} agreed on {l.at} to share their contact details with you for this property.
                            </div>
                          )}

                          <div className="xacts" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                            <label className="xsel" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13.5px' }}>
                              Lead status:
                              <select
                                value={l.status}
                                onChange={(e) => handleLeadStatusChange(l.id, e.target.value)}
                                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff' }}
                              >
                                {[
                                  'New',
                                  'Contacted',
                                  'Visit scheduled',
                                  'Visit completed',
                                  'Negotiating',
                                  'Closed',
                                  'Not interested',
                                  'Not reachable',
                                ].map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </label>

                            {l.prevStatus && (
                              <button
                                type="button"
                                className="btn btn-l btn-sm"
                                onClick={() => handleLeadUndo(l.id)}
                              >
                                Undo
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  <p className="fine" style={{ color: 'var(--mut)', fontSize: '12.5px', marginTop: '16px' }}>
                    Prototype: the lead status is saved only in this browser. There is no messaging or reply box; contact the buyer or tenant by phone outside the dashboard.
                  </p>
                </>
              )}

              {/* TAB: PROPOSE TO BUYER REQUIREMENTS */}
              {tab === 'propose' && (
                <div className="list">
                  <h4>
                    <span>Active buyer requirements in Dhaka ({dbActiveReqs.length})</span>
                    <small style={{ color: 'var(--mut)', fontWeight: 'normal' }}>
                      Verified requirements seeking properties
                    </small>
                  </h4>
                  {dbActiveReqs.length > 0 ? (
                    dbActiveReqs.map((r) => {
                      const isRent = String(r.purpose || '').toLowerCase().includes('rent');
                      const pType = r.subType || r.propertyType || r.category || 'Property';
                      const loc = r.location || r.sector || r.area || r.zone || r.city || 'Dhaka';
                      return (
                        <div key={r.id} className="li">
                          <div className="grow">
                            <b>
                              REQ-{r.id} · {r.title || (r.bedrooms ? `${r.bedrooms}-bed ${pType} to ${isRent ? 'rent' : 'buy'}` : `Requirement for ${pType}`)}
                            </b>
                            <small style={{ color: 'var(--mut)' }}>
                              📍 {loc} · Target budget: {r.budgetDisplay || (r.maxBudget ? money(r.maxBudget, isRent ? 'Rent' : 'Sale') : 'On request')}
                            </small>
                          </div>
                          <button
                            type="button"
                            className="btn btn-o btn-sm"
                            onClick={() => handleOpenSuggestModal(r)}
                          >
                            Suggest property →
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="li">
                      <div className="grow" style={{ color: 'var(--mut)', textAlign: 'center', padding: '36px 16px' }}>
                        No active buyer requirements found.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: VERIFICATION */}
              {tab === 'verify' && (
                <div className="fcard">
                  <h3 style={{ margin: '0 0 8px', color: 'var(--navy)' }}>Get Verified Owner Badge</h3>
                  <p style={{ color: 'var(--mut)', fontSize: '13.5px', margin: '0 0 20px' }}>
                    Upload your ownership papers. TrueSpace admin moderators verify documents within 24 hours.
                  </p>

                  <div style={{ display: 'grid', gap: '14px' }}>
                    {docStates.map((doc) => (
                      <div
                        key={doc.k}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 18px',
                          border: '1.5px solid var(--line)',
                          borderRadius: '12px',
                          background: doc.status === 'approved' ? '#f0fdf4' : '#fff',
                        }}
                      >
                        <div>
                          <b style={{ color: 'var(--navy)', fontSize: '14.5px' }}>{doc.n}</b>
                          <small style={{ display: 'block', color: 'var(--mut)' }}>{doc.d}</small>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span className={`status ${doc.status === 'approved' ? 'st-acc' : doc.status === 'review' ? 'st-pend' : 'st-dec'}`}>
                            {doc.status === 'approved' ? '✓ Approved' : doc.status === 'review' ? 'In Review' : 'Missing'}
                          </span>
                          {doc.status !== 'approved' && (
                            <button
                              type="button"
                              className="btn btn-g btn-sm"
                              onClick={() => handleDocUpload(doc.k)}
                            >
                              Upload doc
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: PROPERTY VERIFICATION BADGES (Prototype v39 jpv) */}
              {tab === 'jpv' && (
                <div className="list">
                  <h4>
                    <span>Property verification badges <small className="hs" style={{ color: 'var(--mut)', fontWeight: 400 }}>optional</small></span>
                  </h4>
                  <p style={{ color: 'var(--mut)', fontSize: '13.5px', margin: '6px 0 16px', padding: '0 16px' }}>
                    All verification is optional. Approved badges show on your property; with none, it shows “Unverified”. Prototype: no payment is taken and no file is stored.
                  </p>

                  {ownerListings.length > 0 ? (
                    ownerListings.map((prop) => {
                      const pid = prop.id;
                      const badges = propertyBadges[pid] || {};

                      const BADGE_CONFIG = [
                        { k: 'photo', name: 'Verified Photos', price: 'Free' },
                        { k: 'video', name: 'Walkthrough Video', price: 'Paid' },
                        { k: 'docs', name: 'Title Deed & Papers', price: 'Paid' },
                        { k: 'rajuk', name: 'RAJUK Approved Plan', price: 'Paid' },
                        { k: 'inspect', name: 'TSP Physical Inspection', price: 'Paid' },
                      ];

                      return (
                        <div key={pid} className="jcard" style={{ marginBottom: '18px' }}>
                          <div className="jrow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ minWidth: 0 }}>
                              <Link href={`/property/${pid}`} style={{ fontWeight: 700, fontSize: '15px', color: 'var(--navy)' }}>
                                TSP-{pid} · {prop?.title || 'Dhaka Property'}
                              </Link>
                              <small style={{ display: 'block', color: 'var(--mut)' }}>
                                📍 {locTxt(prop?.area || prop?.sector || 'Dhaka')} · {money(prop?.price || 0, prop?.purpose || 'Sale')} · {prop.status === 'verified' || prop.status === 'approved' ? '✓ Verified · Live' : 'Pending verification'}
                              </small>
                            </div>
                            <div>
                              {badges.photo === 'approved' && <span className="jb">✓ Photos</span>}
                              {badges.video === 'approved' && <span className="jb">✓ Video</span>}
                              {badges.docs === 'approved' && <span className="jb">✓ Documents</span>}
                              {badges.rajuk === 'approved' && <span className="jb">✓ RAJUK</span>}
                            </div>
                          </div>

                          <div className="jvc">
                            {BADGE_CONFIG.map((b) => {
                              const st = badges[b.k] || ((prop.status === 'verified' || prop.status === 'approved') && b.k === 'docs' ? 'approved' : 'missing');
                              return (
                                <div key={b.k}>
                                  <b>{b.name}</b>
                                  <small className={b.price === 'Free' ? 'jfree' : 'jpaid'}>{b.price}</small>
                                  {st === 'approved' ? (
                                    <span className="status st-acc" style={{ alignSelf: 'flex-start' }}>
                                      ✓ Verified
                                    </span>
                                  ) : st === 'pending' ? (
                                    <span className="status st-pend" style={{ alignSelf: 'flex-start' }}>
                                      Under Review
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn btn-g btn-sm"
                                      onClick={() => handlePropertyBadgeToggle(pid, b.k)}
                                    >
                                      Request {b.price === 'Paid' ? '(paid)' : ''}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="li">
                      <div className="grow" style={{ color: 'var(--mut)', textAlign: 'center', padding: '28px' }}>
                        No properties listed yet. List a property first to manage badges.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PROFILE */}
              {tab === 'profile' && (
                <div className="fcard">
                  <h3 style={{ margin: '0 0 16px', color: 'var(--navy)' }}>Seller Profile Settings</h3>
                  <div className="frow">
                    <div className="fl">
                      <label>Owner / Agent Name</label>
                      <input type="text" defaultValue={currentUser?.fullName || currentUser?.name || ''} />
                    </div>
                    <div className="fl">
                      <label>Agency or Company (Optional)</label>
                      <input type="text" defaultValue={currentUser?.companyName || currentUser?.sellerType || 'Individual Owner'} />
                    </div>
                  </div>
                  <div className="frow">
                    <div className="fl">
                      <label>Phone Number</label>
                      <input type="tel" defaultValue={currentUser?.phone || ''} />
                    </div>
                    <div className="fl">
                      <label>Primary Area</label>
                      <input type="text" defaultValue={currentUser?.city || 'Dhaka City'} />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-o btn-sm"
                    onClick={() => showToast('✓ Profile updated successfully')}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* PRICE EDIT MODAL */}
      {editingPriceProp && (
        <div className="modal open" onClick={() => setEditingPriceProp(null)}>
          <div className="mbox" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="x" onClick={() => setEditingPriceProp(null)}>
              ✕
            </button>
            <h3>Update Price for TSP-{editingPriceProp.id}</h3>
            <p style={{ color: 'var(--mut)', fontSize: '13px', margin: '4px 0 16px' }}>
              {editingPriceProp.title}
            </p>
            <form onSubmit={handlePriceUpdate}>
              <div className="fl" style={{ marginBottom: '16px' }}>
                <label>New Asking Price / Rent (৳)</label>
                <input
                  type="number"
                  required
                  value={newPriceInput}
                  onChange={(e) => setNewPriceInput(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-g btn-sm" onClick={() => setEditingPriceProp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-o btn-sm">
                  Save New Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROPOSE NEW TIME MODAL */}
      {proposingSvr && (
        <div
          className="modal open"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(28, 40, 71, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setProposingSvr(null)}
        >
          <div
            className="mbox"
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.24)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="x"
              onClick={() => setProposingSvr(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: 'var(--mut)',
              }}
            >
              ✕
            </button>
            <h3 style={{ margin: '0 0 8px', color: 'var(--navy)' }}>Propose New Time</h3>
            <p style={{ color: 'var(--mut)', margin: '0 0 16px', fontSize: '13.5px' }}>
              {proposingSvr.id} · TSP-{proposingSvr.pid}
              <br />
              Requested: {proposingSvr.date}, {proposingSvr.time}
            </p>

            <form onSubmit={handleSvrProposeSubmit}>
              <div className="frow" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="fl">
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    New date
                  </label>
                  <input
                    type="date"
                    value={proposeDate}
                    onChange={(e) => setProposeDate(e.target.value)}
                    min="2026-10-27"
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)' }}
                  />
                </div>
                <div className="fl">
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    New time
                  </label>
                  <select
                    value={proposeTime}
                    onChange={(e) => setProposeTime(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff' }}
                  >
                    {[
                      '10:00 AM',
                      '11:00 AM',
                      '12:00 PM',
                      '3:00 PM',
                      '4:00 PM',
                      '5:00 PM',
                      '6:00 PM',
                      '7:00 PM',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                <button type="submit" className="btn btn-o btn-sm">
                  Save new time
                </button>
                <button
                  type="button"
                  className="btn btn-g btn-sm"
                  onClick={() => setProposingSvr(null)}
                >
                  Cancel
                </button>
              </div>

              <p className="fine" style={{ color: 'var(--mut)', fontSize: '12px', marginTop: '14px', lineHeight: 1.4 }}>
                Prototype: the new time is saved as a status in this browser only. Nothing is sent to the buyer or tenant.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* VIEWING MODAL */}
      <ViewingModal
        property={viewingProp}
        isOpen={!!viewingProp}
        onClose={() => setViewingProp(null)}
        onBooked={async (bookData) => {
          if (viewingProp?.matchId) {
            try {
              await matchApi.requestViewing(viewingProp.matchId, {
                date: bookData.date,
                slot: bookData.slot,
                mode: bookData.mode || 'direct',
                people: bookData.people || 1,
                notes: bookData.notes || '',
              });

              // Remove from dbBuyerMatches list immediately
              setDbBuyerMatches((prev) => prev.filter((m) => m.id !== viewingProp.matchId));

              // Re-fetch site visits from server to populate Viewing Requests
              const visitsRes = await matchApi.getBuyerSiteVisits().catch(() => ({ data: [] }));
              const vList = Array.isArray(visitsRes?.data) ? visitsRes.data : Array.isArray(visitsRes) ? visitsRes : [];
              setDbBuyerVisits(vList);

              showToast('✓ Viewing visit requested! Moved to Viewing Requests.');
              setViewingProp(null);
              setTab('visits');
              return;
            } catch (err) {
              console.error('Error booking viewing:', err);
              showToast(err.message || 'Failed to submit viewing request');
            }
          }

          if (viewingProp?.suggestionId) {
            setBuyerSuggestions((prev) =>
              prev.map((s) =>
                s.id === viewingProp.suggestionId
                  ? {
                      ...s,
                      visitRequested: {
                        mode: bookData.mode || 'direct',
                        date: bookData.date,
                        slot: bookData.slot,
                      },
                    }
                  : s
              )
            );
          }
          const newSvr = {
            id: 'SVR-' + Math.floor(8100 + Math.random() * 900),
            pid: viewingProp.id,
            name: currentUser?.fullName || currentUser?.name || store.v3?.session?.name || 'Buyer',
            role: 'Buyer',
            phone: currentUser?.phone || store.v3?.session?.phone || '',
            email: currentUser?.email || store.v3?.session?.email || '',
            date: bookData.date,
            time: bookData.slot,
            rid: 'Viewing Request',
            req: `Site visit for ${viewingProp.title} (${bookData.people || 2} persons) · Notes: ${bookData.notes || 'None'}`,
            reqAt: 'Today',
            mode: bookData.mode || 'direct',
            status: 'pending',
            history: [],
          };
          setSvrList((prev) => [newSvr, ...prev]);
          setViewingProp(null);
          showToast('✓ Viewing visit requested!');
          setTab('visits');
        }}
      />

      {/* SUGGEST PROPERTY MODAL */}
      {suggestModalReq && (() => {
        const approvedProps = ownerListings.filter((p) => p.status === 'verified' || p.status === 'approved' || p.verified === true);

        return (
          <div className="modal open" onClick={() => setSuggestModalReq(null)} style={{ zIndex: 9999 }}>
            <div className="mbox" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <button
                type="button"
                className="x"
                onClick={() => setSuggestModalReq(null)}
                aria-label="Close"
              >
                ✕
              </button>
              <h3 style={{ margin: '0 0 6px', color: 'var(--navy)' }}>Suggest a Property to Buyer</h3>
              <p style={{ color: 'var(--mut)', fontSize: '13.5px', margin: '0 0 16px' }}>
                For {suggestModalReq.id} · {suggestModalReq.title || `${suggestModalReq.type} for ${suggestModalReq.purpose}`}
              </p>

              {approvedProps.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '14px 0' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                  <h4 style={{ color: 'var(--navy)', margin: '0 0 6px' }}>No Admin-Approved Property Available</h4>
                  <p style={{ color: 'var(--mut)', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px' }}>
                    When you list a property, it must first be reviewed and approved from the admin portal. Once approved, you can suggest it to any matching requirement.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <Link href="/list" className="btn btn-o btn-sm" onClick={() => setSuggestModalReq(null)}>
                      + List a Property
                    </Link>
                    <button
                      type="button"
                      className="btn btn-g btn-sm"
                      onClick={() => {
                        setSuggestModalReq(null);
                        setTab('listings');
                      }}
                    >
                      View Listings Status
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendSuggestionSubmit}>
                  <div className="fl" style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                      Select an approved property <span style={{ color: 'var(--ok)', fontSize: '12px' }}>({approvedProps.length} verified)</span>
                    </label>
                    <select
                      value={suggestSelectedPropId}
                      onChange={(e) => setSuggestSelectedPropId(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff' }}
                    >
                      {approvedProps.map((p) => (
                        <option key={p.id} value={p.id}>
                          ✓ TSP-{p.id} · {p.title} ({p.area} — {p.price ? `৳${Number(p.price).toLocaleString()}` : ''})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="fl" style={{ marginBottom: '18px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                      Note to buyer (optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. South-facing corner unit, 2 min from metro station, ready for handover."
                      value={suggestNote}
                      onChange={(e) => setSuggestNote(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-g btn-sm" onClick={() => setSuggestModalReq(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-o btn-sm">
                      Send Suggestion →
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        );
      })()}

      <PrototypeFooter />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="wrap" style={{ padding: '40px 0' }}>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
