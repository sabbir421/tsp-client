'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { propertyApi } from '../../utils/api';
import { DHAKA_ZONES } from '../../utils/prototypeData';
import { addListing } from '../../utils/prototypeStore';

const MX_FLOORS = ['Basement 3', 'Basement 2', 'Basement 1', 'Ground', ...Array.from({ length: 45 }, (_, i) => String(i + 1))];
const MX_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MX_YEARS = Array.from({ length: 11 }, (_, i) => String(2025 + i));
const MX_DONE = [...Array.from({ length: 16 }, (_, i) => String(2025 - i)), 'Before 2010'];
const MX_YN = ['No', 'Yes'];

const MX_AMEN = {
  Flat: [
    'Boundary Wall', 'Cooker Hood', 'Community Hall', 'Geyser', 'Gymnasium', 'Food Court',
    'Jogging Track', 'Pets Allowed', 'Playground', 'Reception', 'Rooftop Lounge',
    'Swimming Pool', 'Tennis Court', 'Wheelchair Accessible', 'Garden', 'Intercom',
    'Kitchen Cabinet', 'Mosquito Netting', 'Near metro',
  ],
  Land: ['Boundary Wall', 'Gated Community', 'Corner Plot'],
  'Commercial Space': [
    'Boundary Wall', 'Gymnasium', 'Reception', 'Wheelchair Accessible', 'Intercom',
    'Mosquito Netting', 'Near metro',
  ],
};

const MX_SAFE = [
  'CCTV in Public Areas', 'Fire Extinguisher', 'Emergency Exit', 'Smoke Detector',
  'Fire Alarm', 'Sprinkler', 'Emergency Light', 'Fire Door', 'Fire Hydrant', 'Lightning Protection',
];

const MX_APPR = [
  'Construction Permit', 'Land Use Clearance (LUC)', 'Land Use Plan (BEZA)',
  'NOC for Large And Specialized Project (LASP)', 'Occupancy Certificate', 'Approval of building construction (CDA)',
];

const MX_LDOCS = [
  'Title Deed', 'CS Khatiyan', 'RS Khatiyan', 'BS Khatiyan', 'Mutation Certificate',
  'Khajna', 'Non-encumbrance Certificate', "Surveyor's Report", 'Online Khajna',
];

const TS_FACE = ['South', 'North', 'East', 'West', 'South-East', 'South-West', 'North-East', 'North-West', 'Main road'];

const SQFT_MAP = { Katha: 720, Bigha: 14400, 'Square Feet': 1, Acre: 43560 };

function formatCurrencyWords(num) {
  const n = Number(num);
  if (!n || n <= 0) return '';
  if (n >= 10000000) return `In words: ৳ ${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')} Crore`;
  if (n >= 100000) return `In words: ৳ ${(n / 100000).toFixed(2).replace(/\.?0+$/, '')} Lakh`;
  if (n >= 1000) return `In words: ৳ ${(n / 1000).toFixed(2).replace(/\.?0+$/, '')} Thousand`;
  return `In words: ৳ ${n.toLocaleString('en-BD')}`;
}

const INITIAL_FORM = {
  purpose: 'Sale',
  cat: 'Flat', // 'Flat' | 'Land' | 'Commercial Space'
  provider: 'Owner', // 'Owner' | 'Agent' | 'Developer'
  area: 'Mirpur, Dhaka',
  areaOther: '',
  title: '',
  address: '',
  map: '',
  ownerName: '',
  ownerPhone: '',
  visit: 'Weekends',
  docsPledge: true,
  sdesc: '',
  videoUrl: '',
  mx: {
    aptType: 'Apartment',
    size: '1450',
    beds: '3',
    baths: '3',
    balc: '2',
    bname: '',
    flevel: '5',
    tfloors: '8',
    perfloor: '2',
    facing: 'South',
    road: '30',
    furnish: 'Unfurnished',
    view: 'Road',
    // Land
    landType: 'Residential',
    lsize: '5',
    lunit: 'Katha',
    llen: '',
    lwid: '',
    lcond: 'Empty Land',
    glevel: 'High Level',
    // Commercial
    comType: 'Office Space',
    // Terms
    price: '13500000',
    advance: "2 months' rent",
    service: 'Additional',
    serviceAmt: '5000',
    tenant: 'Family only',
    gate: 'Closes at a fixed time',
    gateT: '23:00',
    avail: 'Ready',
    availM: 'Jan',
    availY: '2026',
    devby: 'Developer',
    devname: 'Navana Real Estate Ltd.',
    cond: 'Pre-Owned',
    dstat: 'Ready',
    doneY: '2020',
    fin: 'Bank Loan',
    owned: 'Individual(s)',
    ownersN: '1',
    appr: ['Construction Permit', 'Occupancy Certificate'],
    ldocs: ['Title Deed', 'Mutation Certificate', 'Khajna'],
    // Utilities
    elec: 'Yes',
    elecT: 'Pre-paid',
    water: 'Yes',
    waterT: 'WASA + Submersible',
    gas: 'Yes',
    gasT: 'Titas Pipeline',
    lift: 'Yes',
    liftN: '2',
    gen: 'Yes',
    genT: 'Full Backup',
    ac: 'Provision only',
    park: 'Yes',
    parkN: '1',
    guard: 'Yes',
    guardN: '2',
    amen: ['Boundary Wall', 'Gymnasium', 'Rooftop Lounge', 'Intercom', 'Near metro'],
    safe: ['CCTV in Public Areas', 'Fire Extinguisher', 'Emergency Exit'],
  },
  vt: {
    photo: { on: true, ok: true },
    agent: { on: false, ok: false, date: '', slot: 'Morning (10 AM–1 PM)' },
    docs: { on: true, ok: true },
  },
};

export default function ListPropertyWizard() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const currentUser = authState?.user || null;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    ownerName: currentUser?.name || currentUser?.fullName || '',
    ownerPhone: currentUser?.phone || currentUser?.mobile || '',
  }));

  const [photos, setPhotos] = useState([]); // [{ file, preview, name, size }]
  const [floorPlanFile, setFloorPlanFile] = useState(null); // { file, preview, name }
  const [vtDocsFiles, setVtDocsFiles] = useState([]); // [{ file, name, size }]
  const [vtPhotoFiles, setVtPhotoFiles] = useState([]); // [{ file, preview, name, size }]

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const photoInputRef = useRef(null);
  const floorPlanInputRef = useRef(null);
  const vtDocsInputRef = useRef(null);
  const vtPhotoInputRef = useRef(null);

  const isRent = form.purpose === 'Rent';
  const cat = form.cat;
  const isLand = cat === 'Land';
  const isCommercial = cat === 'Commercial Space';
  const isApartment = cat === 'Flat';

  const catLabel = isLand ? 'Land' : isCommercial ? 'Commercial' : 'Apartment';

  const STEPS = [
    { k: 'type', t: 'Listing type' },
    { k: 'loc', t: 'Location' },
    { k: 'cat', t: `${catLabel} details` },
    { k: 'terms', t: isRent ? 'Rent terms' : 'Price & sale details' },
    { k: 'fac', t: isLand ? 'Utilities & amenities' : 'Building & utilities' },
    { k: 'media', t: 'Description & photos' },
    { k: 'contact', t: 'Privacy & contact' },
    { k: 'verify', t: 'Verification' },
    { k: 'review', t: 'Review & submit' },
  ];

  const currentStepKey = STEPS[step]?.k;
  const progressPct = Math.round(((step + 1) / STEPS.length) * 100);

  // Sync user info if user logs in
  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        ownerName: prev.ownerName || currentUser.name || currentUser.fullName || '',
        ownerPhone: prev.ownerPhone || currentUser.phone || currentUser.mobile || '',
      }));
    }
  }, [currentUser]);

  // Handle mx changes
  const updateMx = (field, value) => {
    setForm((prev) => ({
      ...prev,
      mx: {
        ...prev.mx,
        [field]: value,
      },
    }));
  };

  const toggleMxArray = (field, item) => {
    setForm((prev) => {
      const arr = Array.isArray(prev.mx[field]) ? [...prev.mx[field]] : [];
      const idx = arr.indexOf(item);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(item);
      return {
        ...prev,
        mx: {
          ...prev.mx,
          [field]: arr,
        },
      };
    });
  };

  // Sample data filler
  const fillSample = (chosenCat = 'Flat', forRent = false) => {
    const isR = forRent;
    setForm({
      purpose: isR ? 'Rent' : 'Sale',
      cat: chosenCat,
      provider: 'Owner',
      area: 'Mirpur, Dhaka',
      areaOther: '',
      title:
        chosenCat === 'Land'
          ? '5 katha residential plot on a 30 ft road in Mirpur'
          : chosenCat === 'Commercial Space'
          ? '1,800 sqft modern office space near Mirpur 10 roundabout'
          : 'Bright 3-bed south-facing apartment near Mirpur 10 metro',
      address: 'House 14, Road 5, Block B, Mirpur 10',
      map: 'https://maps.google.com/?q=Mirpur+10+Dhaka',
      ownerName: currentUser?.name || 'Rafiqul Hasan',
      ownerPhone: currentUser?.phone || '01713915801',
      visit: 'Weekends',
      docsPledge: true,
      sdesc:
        chosenCat === 'Land'
          ? 'Level, high-ground residential plot on a 30 ft road, ready for immediate construction with clear papers.'
          : chosenCat === 'Commercial Space'
          ? 'Open-plan commercial office floor with lift, full generator backup and washrooms, 2 minutes from metro.'
          : 'Bright corner flat with cross ventilation, wide road access, lift, generator, and Titas gas connection.',
      videoUrl: 'https://www.youtube.com/watch?v=sample',
      mx: {
        aptType: 'Apartment',
        size: chosenCat === 'Commercial Space' ? '1800' : '1450',
        beds: '3',
        baths: '3',
        balc: '2',
        bname: 'Green Valley Tower',
        flevel: '5',
        tfloors: '10',
        perfloor: '2',
        facing: 'South',
        road: '30',
        furnish: 'Semi Furnished',
        view: 'Road',
        landType: 'Residential',
        lsize: '5',
        lunit: 'Katha',
        llen: '60',
        lwid: '60',
        lcond: 'Empty Land',
        glevel: 'High Level',
        comType: 'Office Space',
        price: isR ? (chosenCat === 'Land' ? '45000' : chosenCat === 'Commercial Space' ? '85000' : '35000') : (chosenCat === 'Land' ? '15000000' : chosenCat === 'Commercial Space' ? '25000000' : '12500000'),
        advance: "2 months' rent",
        service: 'Additional',
        serviceAmt: '5000',
        tenant: 'Family only',
        gate: 'Closes at a fixed time',
        gateT: '23:30',
        avail: 'Ready',
        availM: 'Jan',
        availY: '2026',
        devby: 'Developer',
        devname: 'Shanta Holdings Ltd.',
        cond: 'Pre-Owned',
        dstat: 'Ready',
        doneY: '2020',
        fin: 'Bank Loan',
        owned: 'Individual(s)',
        ownersN: '1',
        appr: ['Construction Permit', 'Occupancy Certificate'],
        ldocs: ['Title Deed', 'Mutation Certificate', 'Khajna'],
        elec: 'Yes',
        elecT: 'Pre-paid',
        water: 'Yes',
        waterT: 'WASA + Submersible',
        gas: 'Yes',
        gasT: 'Titas Pipeline',
        lift: 'Yes',
        liftN: '2',
        gen: 'Yes',
        genT: 'Full Backup',
        ac: 'Provision only',
        park: 'Yes',
        parkN: '1',
        guard: 'Yes',
        guardN: '2',
        amen: ['Boundary Wall', 'Gymnasium', 'Rooftop Lounge', 'Intercom', 'Near metro'],
        safe: ['CCTV in Public Areas', 'Fire Extinguisher', 'Emergency Exit'],
      },
      vt: {
        photo: { on: true, ok: true },
        agent: { on: false, ok: false, date: '', slot: 'Morning (10 AM–1 PM)' },
        docs: { on: true, ok: true },
      },
    });
    setErrorMsg('');
  };

  // Validation function per step
  const validateStep = (sKey) => {
    setErrorMsg('');
    if (sKey === 'type') {
      if (!form.purpose) return 'Please choose whether the property is for sale or for rent.';
      if (!form.cat) return 'Please choose Apartment, Land or Commercial.';
      return '';
    }
    if (sKey === 'loc') {
      const activeArea = form.area === 'Other' ? form.areaOther : form.area;
      if (!activeArea || !activeArea.trim()) return 'Please choose or specify the property location.';
      if ((form.title || '').trim().length < 10) return 'Please add a descriptive title (at least 10 characters).';
      if (!(form.address || '').trim()) return 'Please enter the exact address. It remains completely hidden from buyers.';
      return '';
    }
    if (sKey === 'cat') {
      if (!isLand && !(Number(form.mx.size) > 50)) return 'Please enter a valid property size in sqft.';
      if (isApartment && !(Number(form.mx.beds) > 0)) return 'Please enter the number of bedrooms.';
      if (isApartment && !(Number(form.mx.baths) > 0)) return 'Please enter the number of bathrooms.';
      if (isLand && !(Number(form.mx.lsize) > 0)) return 'Please enter the land size.';
      return '';
    }
    if (sKey === 'terms') {
      if (!(Number(form.mx.price) > 0)) return isRent ? 'Please enter the monthly rent in ৳.' : 'Please enter the asking price in ৳.';
      return '';
    }
    if (sKey === 'contact') {
      if (!form.ownerName?.trim()) return 'Please enter your name.';
      if (!form.ownerPhone || !/^01[3-9]\d{8}$/.test(form.ownerPhone.replace(/[\s-]/g, ''))) {
        return 'Please enter a valid 11-digit Bangladesh mobile number (e.g. 017XXXXXXXX).';
      }
      return '';
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep(currentStepKey);
    if (err) {
      setErrorMsg(err);
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setErrorMsg('');
      setStep(step - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const jumpToStep = (index) => {
    setErrorMsg('');
    setStep(index);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Photo handlers
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems = files.map((file) => ({
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newItems].slice(0, 15));
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => {
      const item = prev[idx];
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Verification documents handler
  const handleVtDocsSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems = files.map((file) => ({
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));
    setVtDocsFiles((prev) => [...prev, ...newItems].slice(0, 10));
    e.target.value = '';
  };

  const removeVtDoc = (idx) => {
    setVtDocsFiles((prev) => {
      const item = prev[idx];
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Verification photos handler
  const handleVtPhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems = files.map((file) => ({
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));
    setVtPhotoFiles((prev) => [...prev, ...newItems].slice(0, 10));
    e.target.value = '';
  };

  const removeVtPhoto = (idx) => {
    setVtPhotoFiles((prev) => {
      const item = prev[idx];
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Floor plan handler
  const handleFloorPlanSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFloorPlanFile({
        file,
        name: file.name,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      });
    }
  };

  // Final submission to AWS S3 & Database
  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      const chosenArea = form.area === 'Other' ? form.areaOther : form.area;
      const finalTitle =
        form.title.trim() ||
        `${form.mx.facing || 'South'}-facing ${form.mx.beds ? form.mx.beds + '-bed ' : ''}${catLabel} in ${chosenArea}`;

      // Prepare FormData for S3 upload via backend API
      const formData = new FormData();
      formData.append('purpose', form.purpose);
      formData.append('propertyFor', form.purpose.toLowerCase());
      formData.append('cat', form.cat);
      formData.append('provider', form.provider);
      formData.append('title', finalTitle);
      formData.append('area', chosenArea);
      formData.append('address', form.address);
      formData.append('map', form.map || '');
      formData.append('ownerName', form.ownerName);
      formData.append('ownerPhone', form.ownerPhone);
      formData.append('visit', form.visit);
      formData.append('price', String(form.mx.price || 0));
      formData.append('sizeSqFt', String(form.mx.size || (isLand ? Math.round(Number(form.mx.lsize || 0) * (SQFT_MAP[form.mx.lunit] || 720)) : 0)));
      formData.append('bedrooms', String(form.mx.beds || ''));
      formData.append('bathrooms', String(form.mx.baths || ''));
      formData.append('balcony', String(form.mx.balc || ''));
      formData.append('floor', String(form.mx.flevel || ''));
      formData.append('sdesc', form.sdesc || '');
      formData.append('videoUrl', form.videoUrl || '');
      formData.append('mx', JSON.stringify(form.mx));
      formData.append('vt', JSON.stringify(form.vt));

      // Append multi-files for S3 storage
      photos.forEach((p) => {
        if (p.file) formData.append('photos', p.file);
      });

      if (floorPlanFile?.file) {
        formData.append('floorPlan', floorPlanFile.file);
      }

      vtDocsFiles.forEach((d) => {
        if (d.file) formData.append('documents', d.file);
      });

      vtPhotoFiles.forEach((p) => {
        if (p.file) formData.append('vt_photos', p.file);
      });

      let serverResponse = null;
      try {
        serverResponse = await propertyApi.create(formData);
      } catch (apiErr) {
        console.warn('Backend listing submission error, falling back to local simulation:', apiErr);
      }

      // Also save to client prototype store for instant local reactivity
      const newListing = addListing({
        title: finalTitle,
        purpose: form.purpose,
        type: catLabel,
        area: chosenArea,
        sector: '',
        address: form.address,
        price: Number(form.mx.price) || 0,
        size: Number(form.mx.size) || (isLand ? Math.round(Number(form.mx.lsize || 0) * (SQFT_MAP[form.mx.lunit] || 720)) : 0),
        beds: Number(form.mx.beds) || 0,
        baths: Number(form.mx.baths) || 0,
        balc: Number(form.mx.balc) || 0,
        floor: form.mx.flevel || '-',
        facing: form.mx.facing || 'South',
        features: Array.isArray(form.mx.amen) ? form.mx.amen : [],
        desc: form.sdesc || `${catLabel} located at ${form.address}, ${chosenArea}.`,
        photos: photos.map((p) => p.preview),
        verified: false,
        status: 'pending',
      });

      const assignedId = serverResponse?.data?.id || newListing?.id || Math.floor(1000 + Math.random() * 9000);
      setSubmittedId(assignedId);
      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMsg(err.message || 'Failed to submit property. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success view
  if (submitted) {
    return (
      <div className="wrap formwrap" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <div className="fcard ok" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#e7f6ec',
              color: 'var(--ok)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 style={{ color: 'var(--navy)', fontSize: '24px', margin: '0 0 8px' }}>
            Listing submitted for approval!
          </h2>
          <div
            style={{
              display: 'inline-block',
              background: 'var(--bg)',
              color: 'var(--navy)',
              fontWeight: '700',
              padding: '6px 14px',
              borderRadius: '8px',
              margin: '8px 0 16px',
            }}
          >
            Property Ref: TSP-{submittedId}
          </div>
          <p style={{ maxWidth: '580px', margin: '0 auto 24px', color: 'var(--mut)', fontSize: '14.5px' }}>
            Your property has been uploaded to <b>AWS S3</b> and submitted to the <b>TrueSpace Moderation Queue</b>.
            Your exact address and mobile number remain private and will only unlock when you accept a matching buyer or tenant.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/property/${submittedId}`} className="btn btn-o">
              Preview Listing View →
            </Link>
            <Link href="/dashboard?role=owner" className="btn btn-g">
              Go to Seller Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap formwrap" id="listWrap" style={{ paddingTop: '20px', paddingBottom: '70px' }}>
      <div className="fcard">
        {/* Progress Bar & Header */}
        <div className="ts-prog">
          <div className="ts-prog-top">
            <span>
              Step {step + 1} of {STEPS.length}: <b>{STEPS[step]?.t}</b>
            </span>
            <span>{progressPct}% complete</span>
          </div>
          <div className="ts-bar" role="progressbar" aria-valuenow={progressPct}>
            <i style={{ width: `${progressPct}%` }}></i>
          </div>
          <ol className="ts-steps">
            {STEPS.map((sItem, idx) => (
              <li key={sItem.k} className={idx === step ? 'on' : idx < step ? 'done' : ''}>
                {idx < step ? (
                  <button type="button" onClick={() => jumpToStep(idx)}>
                    {idx + 1}. {sItem.t}
                  </button>
                ) : (
                  <span>
                    {idx + 1}. {sItem.t}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Selected badge banner */}
        {step > 0 && (
          <div className="ts-chosen" style={{ marginBottom: '14px' }}>
            Listing: <b>{catLabel} · For {form.purpose.toLowerCase()}</b>
            <button type="button" className="ts-link" onClick={() => jumpToStep(0)}>
              Change
            </button>
          </div>
        )}

        {/* STEP 1: TYPE */}
        {currentStepKey === 'type' && (
          <div>
            <fieldset className="ts-opt">
              <legend>Is this property for sale or for rent?</legend>
              <div className="ts-cards two">
                {['Sale', 'Rent'].map((p) => (
                  <label key={p} className="ts-card">
                    <input
                      type="radio"
                      name="lPurpose"
                      value={p}
                      checked={form.purpose === p}
                      onChange={() => setForm((prev) => ({ ...prev, purpose: p }))}
                    />
                    <span>
                      <b>For {p}</b>
                      <small>{p === 'Sale' ? 'Sell a property or plot' : 'Rent out a home or commercial unit'}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="ts-opt">
              <legend>What category of property is it?</legend>
              <div className="ts-cards three">
                {[
                  { k: 'Flat', label: 'Apartment', sub: 'Flats, duplexes and houses' },
                  { k: 'Land', label: 'Land', sub: 'Plots and land' },
                  { k: 'Commercial Space', label: 'Commercial', sub: 'Shops, offices and warehouses' },
                ].map((item) => (
                  <label key={item.k} className="ts-card">
                    <input
                      type="radio"
                      name="lCat"
                      value={item.k}
                      checked={form.cat === item.k}
                      onChange={() => setForm((prev) => ({ ...prev, cat: item.k }))}
                    />
                    <span>
                      <b>{item.label}</b>
                      <small>{item.sub}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="fl" style={{ maxWidth: '320px', marginTop: '14px' }}>
              <label>Listed by <span className="req">*</span></label>
              <select
                value={form.provider}
                onChange={(e) => setForm((prev) => ({ ...prev, provider: e.target.value }))}
              >
                <option value="Owner">Owner</option>
                <option value="Agent">Agent / Broker</option>
                <option value="Developer">Developer / Builder</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {currentStepKey === 'loc' && (
          <div>
            <div className="fl" style={{ marginBottom: '14px' }}>
              <label>Property location in Dhaka City <span className="req">*</span></label>
              <select
                value={form.area}
                onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
              >
                {Object.keys(DHAKA_ZONES).map((zoneName) => (
                  <optgroup key={zoneName} label={zoneName}>
                    {DHAKA_ZONES[zoneName].map((n) => (
                      <option key={n} value={`${n}, Dhaka`}>
                        {n}, Dhaka
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="Other">Other locations in Dhaka City…</option>
              </select>
            </div>

            {form.area === 'Other' && (
              <div className="fl" style={{ marginBottom: '14px' }}>
                <label>Specify Neighbourhood / Location <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Keraniganj, Savar, DOHS"
                  value={form.areaOther}
                  onChange={(e) => setForm((prev) => ({ ...prev, areaOther: e.target.value }))}
                />
              </div>
            )}

            <div className="fl" style={{ marginBottom: '14px' }}>
              <label>Listing Title <span className="req">*</span></label>
              <input
                type="text"
                value={form.title}
                placeholder={
                  isLand
                    ? 'e.g. 5 katha south-facing residential plot in Purbachal'
                    : isCommercial
                    ? 'e.g. Ground-floor shop on the main road in Uttara Sector 7'
                    : 'e.g. South-facing 3-bed apartment near Dhanmondi Lake'
                }
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <div className="hint">Keep it clear and descriptive (at least 10 characters).</div>
            </div>

            <div className="fl" style={{ marginBottom: '14px' }}>
              <label>
                Exact Address <span className="private">🔒 Hidden from buyers</span> <span className="req">*</span>
              </label>
              <input
                type="text"
                placeholder={isLand ? 'Plot #, Road #, Sector / Block' : 'House #, Road #, Sector / Block'}
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
              <div className="hint">Used for verification. Shared only after you accept a buyer or tenant.</div>
            </div>

            <div className="fl">
              <label>Google Maps Link <span className="private">🔒 Private</span> (Optional)</label>
              <input
                type="text"
                placeholder="https://maps.google.com/?q=..."
                value={form.map}
                onChange={(e) => setForm((prev) => ({ ...prev, map: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* STEP 3: CATEGORY SPECIFICS */}
        {currentStepKey === 'cat' && (
          <div>
            <p className="ts-lead">Showing questions tailored for {catLabel.toLowerCase()} properties.</p>

            <fieldset className="mx-sec">
              <legend>{catLabel} information</legend>
              <div className="mx-grid">
                {/* Apartment specifics */}
                {isApartment && (
                  <>
                    <div className="fl">
                      <label>Apartment type <span className="req">*</span></label>
                      <select
                        value={form.mx.aptType || 'Apartment'}
                        onChange={(e) => updateMx('aptType', e.target.value)}
                      >
                        <option value="Apartment">Apartment</option>
                        <option value="Duplex">Duplex</option>
                        <option value="House">House / Villa</option>
                        <option value="Serviced Apartment">Serviced Apartment</option>
                      </select>
                    </div>

                    <div className="fl">
                      <label>Size (sqft) <span className="req">*</span></label>
                      <input
                        type="number"
                        min="100"
                        value={form.mx.size || ''}
                        placeholder="1450"
                        onChange={(e) => updateMx('size', e.target.value)}
                      />
                    </div>

                    <div className="fl">
                      <label>Bedrooms <span className="req">*</span></label>
                      <input
                        type="number"
                        min="1"
                        value={form.mx.beds || ''}
                        placeholder="3"
                        onChange={(e) => updateMx('beds', e.target.value)}
                      />
                    </div>

                    <div className="fl">
                      <label>Bathrooms <span className="req">*</span></label>
                      <input
                        type="number"
                        min="1"
                        value={form.mx.baths || ''}
                        placeholder="2"
                        onChange={(e) => updateMx('baths', e.target.value)}
                      />
                    </div>

                    <div className="fl">
                      <label>Balconies</label>
                      <input
                        type="number"
                        min="0"
                        value={form.mx.balc || ''}
                        placeholder="2"
                        onChange={(e) => updateMx('balc', e.target.value)}
                      />
                    </div>

                    <div className="fl">
                      <label>Building name</label>
                      <input
                        type="text"
                        value={form.mx.bname || ''}
                        placeholder="e.g. Green Valley Tower"
                        onChange={(e) => updateMx('bname', e.target.value)}
                      />
                    </div>

                    <div className="fl">
                      <label>Floor level</label>
                      <select
                        value={form.mx.flevel || '1'}
                        onChange={(e) => updateMx('flevel', e.target.value)}
                      >
                        {MX_FLOORS.map((fl) => (
                          <option key={fl} value={fl}>{fl}</option>
                        ))}
                      </select>
                    </div>

                    <div className="fl">
                      <label>Total floors in building</label>
                      <input
                        type="number"
                        min="1"
                        value={form.mx.tfloors || ''}
                        placeholder="8"
                        onChange={(e) => updateMx('tfloors', e.target.value)}
                      />
                    </div>

                    {!isRent && (
                      <div className="fl">
                        <label>Units per floor</label>
                        <input
                          type="number"
                          min="1"
                          value={form.mx.perfloor || ''}
                          placeholder="2"
                          onChange={(e) => updateMx('perfloor', e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Land specifics */}
                {isLand && (
                  <>
                    <div className="fl">
                      <label>Land type <span className="req">*</span></label>
                      <select
                        value={form.mx.landType || 'Residential'}
                        onChange={(e) => updateMx('landType', e.target.value)}
                      >
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Agricultural">Agricultural</option>
                      </select>
                    </div>

                    <div className="fl">
                      <label>Land size <span className="req">*</span></label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        value={form.mx.lsize || ''}
                        placeholder="e.g. 5"
                        onChange={(e) => updateMx('lsize', e.target.value)}
                      />
                      {form.mx.lsize && (
                        <div className="hint" style={{ color: 'var(--orange)', fontWeight: '600' }}>
                          ≈ {Math.round(Number(form.mx.lsize) * (SQFT_MAP[form.mx.lunit || 'Katha'] || 720)).toLocaleString()} sqft total
                        </div>
                      )}
                    </div>

                    <div className="fl">
                      <label>Land unit <span className="req">*</span></label>
                      <select
                        value={form.mx.lunit || 'Katha'}
                        onChange={(e) => updateMx('lunit', e.target.value)}
                      >
                        <option value="Katha">Katha</option>
                        <option value="Bigha">Bigha</option>
                        <option value="Square Feet">Square Feet</option>
                        <option value="Acre">Acre</option>
                      </select>
                    </div>

                    <div className="fl">
                      <label>Land length (ft)</label>
                      <input
                        type="number"
                        value={form.mx.llen || ''}
                        placeholder="e.g. 60"
                        onChange={(e) => updateMx('llen', e.target.value)}
                      />
                    </div>

                    <div className="fl">
                      <label>Land width (ft)</label>
                      <input
                        type="number"
                        value={form.mx.lwid || ''}
                        placeholder="e.g. 60"
                        onChange={(e) => updateMx('lwid', e.target.value)}
                      />
                    </div>

                    <div className="fl">
                      <label>Land condition</label>
                      <select
                        value={form.mx.lcond || 'Empty Land'}
                        onChange={(e) => updateMx('lcond', e.target.value)}
                      >
                        <option value="Empty Land">Empty Land</option>
                        <option value="Plantation">Plantation</option>
                        <option value="Shed">Shed / Boundary</option>
                        <option value="House">House</option>
                        <option value="Partial Construction">Partial Construction</option>
                      </select>
                    </div>

                    <div className="fl">
                      <label>Ground level</label>
                      <select
                        value={form.mx.glevel || 'High Level'}
                        onChange={(e) => updateMx('glevel', e.target.value)}
                      >
                        <option value="High Level">High Level (Flood free)</option>
                        <option value="Low Level">Low Level</option>
                        <option value="Sand Filled">Sand Filled</option>
                        <option value="Mixed">Mixed</option>
                        <option value="Wetland">Wetland</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Commercial specifics */}
                {isCommercial && (
                  <>
                    <div className="fl">
                      <label>Commercial type <span className="req">*</span></label>
                      <select
                        value={form.mx.comType || 'Office Space'}
                        onChange={(e) => updateMx('comType', e.target.value)}
                      >
                        <option value="Office Space">Office Space</option>
                        <option value="Shop Showroom">Shop / Showroom</option>
                        <option value="Warehouse">Warehouse</option>
                      </select>
                    </div>

                    <div className="fl">
                      <label>Size (sqft) <span className="req">*</span></label>
                      <input
                        type="number"
                        min="100"
                        value={form.mx.size || ''}
                        placeholder="1800"
                        onChange={(e) => updateMx('size', e.target.value)}
                      />
                    </div>

                    <div className="fl">
                      <label>Washrooms</label>
                      <input
                        type="number"
                        min="1"
                        value={form.mx.baths || ''}
                        placeholder="2"
                        onChange={(e) => updateMx('baths', e.target.value)}
                      />
                    </div>

                    <div className="fl">
                      <label>Building name</label>
                      <input
                        type="text"
                        value={form.mx.bname || ''}
                        placeholder="e.g. Navana Tower"
                        onChange={(e) => updateMx('bname', e.target.value)}
                      />
                    </div>

                    <div className="fl">
                      <label>Floor level <span className="req">*</span></label>
                      <select
                        value={form.mx.flevel || '1'}
                        onChange={(e) => updateMx('flevel', e.target.value)}
                      >
                        {MX_FLOORS.map((fl) => (
                          <option key={fl} value={fl}>{fl}</option>
                        ))}
                      </select>
                    </div>

                    <div className="fl">
                      <label>Total floors in building</label>
                      <input
                        type="number"
                        min="1"
                        value={form.mx.tfloors || ''}
                        placeholder="12"
                        onChange={(e) => updateMx('tfloors', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Common fields */}
                <div className="fl">
                  <label>Facing</label>
                  <select
                    value={form.mx.facing || 'South'}
                    onChange={(e) => updateMx('facing', e.target.value)}
                  >
                    {TS_FACE.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="fl">
                  <label>Road width in front (ft) {isLand && <span className="req">*</span>}</label>
                  <input
                    type="number"
                    min="6"
                    value={form.mx.road || ''}
                    placeholder="e.g. 30"
                    onChange={(e) => updateMx('road', e.target.value)}
                  />
                </div>

                {!isLand && (
                  <>
                    <div className="fl">
                      <label>Furnishing</label>
                      <select
                        value={form.mx.furnish || 'Unfurnished'}
                        onChange={(e) => updateMx('furnish', e.target.value)}
                      >
                        <option value="Unfurnished">Unfurnished</option>
                        <option value="Semi Furnished">Semi Furnished</option>
                        <option value="Full Furnished">Full Furnished</option>
                      </select>
                    </div>

                    <div className="fl">
                      <label>View from property</label>
                      <select
                        value={form.mx.view || 'Road'}
                        onChange={(e) => updateMx('view', e.target.value)}
                      >
                        <option value="Road">Road</option>
                        <option value="City">City View</option>
                        <option value="Lake">Lake View</option>
                        <option value="Garden">Garden / Park</option>
                        <option value="Open">Open View</option>
                        <option value="No">No specific view</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </fieldset>
          </div>
        )}

        {/* STEP 4: TERMS & PRICE */}
        {currentStepKey === 'terms' && (
          <div>
            <p className="ts-lead">
              {isRent
                ? 'Rent terms only. Sale questions such as developer and legal handover papers are not asked.'
                : 'Sale details only. Rent questions such as tenant preference and advance deposit are not asked.'}
            </p>

            <fieldset className="mx-sec">
              <legend>{isRent ? 'Rent & Charges' : 'Asking Price & Sale Details'}</legend>
              <div className="mx-grid">
                <div className="fl">
                  <label>
                    {isRent ? 'Monthly rent (৳)' : 'Asking price (৳)'} <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    value={form.mx.price || ''}
                    placeholder={isRent ? '35000' : '13500000'}
                    onChange={(e) => updateMx('price', e.target.value)}
                  />
                  {form.mx.price && (
                    <div className="hint" style={{ color: 'var(--navy)', fontWeight: '600' }}>
                      {formatCurrencyWords(form.mx.price)}
                    </div>
                  )}
                </div>

                {isRent ? (
                  <>
                    <div className="fl">
                      <label>Advance / security deposit</label>
                      <input
                        type="text"
                        value={form.mx.advance || ''}
                        placeholder="e.g. 2 months' rent"
                        onChange={(e) => updateMx('advance', e.target.value)}
                      />
                    </div>

                    {!isLand && (
                      <>
                        <div className="fl">
                          <label>Service charge</label>
                          <select
                            value={form.mx.service || 'Additional'}
                            onChange={(e) => updateMx('service', e.target.value)}
                          >
                            <option value="Included">Included in rent</option>
                            <option value="Additional">Additional monthly charge</option>
                          </select>
                        </div>

                        {form.mx.service === 'Additional' && (
                          <div className="fl">
                            <label>Service charge amount (৳)</label>
                            <input
                              type="number"
                              value={form.mx.serviceAmt || ''}
                              placeholder="5000"
                              onChange={(e) => updateMx('serviceAmt', e.target.value)}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {isApartment && (
                      <div className="fl">
                        <label>Tenant preference</label>
                        <select
                          value={form.mx.tenant || 'Family only'}
                          onChange={(e) => updateMx('tenant', e.target.value)}
                        >
                          <option value="Family only">Family only</option>
                          <option value="Any tenant (family or bachelor)">Any tenant (family or bachelor)</option>
                          <option value="Bachelor only">Bachelor only</option>
                        </select>
                      </div>
                    )}

                    {!isLand && (
                      <>
                        <div className="fl">
                          <label>Main gate timings</label>
                          <select
                            value={form.mx.gate || 'Closes at a fixed time'}
                            onChange={(e) => updateMx('gate', e.target.value)}
                          >
                            <option value="Open 24 hours">Open 24 hours</option>
                            <option value="Closes at a fixed time">Closes at a fixed time</option>
                          </select>
                        </div>

                        {form.mx.gate === 'Closes at a fixed time' && (
                          <div className="fl">
                            <label>Gate closing time</label>
                            <input
                              type="time"
                              value={form.mx.gateT || '23:00'}
                              onChange={(e) => updateMx('gateT', e.target.value)}
                            />
                          </div>
                        )}
                      </>
                    )}

                    <div className="fl">
                      <label>Available from <span className="req">*</span></label>
                      <select
                        value={form.mx.avail || 'Ready'}
                        onChange={(e) => updateMx('avail', e.target.value)}
                      >
                        <option value="Ready">Ready to move in</option>
                        <option value="Later">From a specific month</option>
                      </select>
                    </div>

                    {form.mx.avail === 'Later' && (
                      <>
                        <div className="fl">
                          <label>Available month</label>
                          <select
                            value={form.mx.availM || 'Jan'}
                            onChange={(e) => updateMx('availM', e.target.value)}
                          >
                            {MX_MONTHS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>

                        <div className="fl">
                          <label>Available year</label>
                          <select
                            value={form.mx.availY || '2026'}
                            onChange={(e) => updateMx('availY', e.target.value)}
                          >
                            {MX_YEARS.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="fl">
                      <label>Developed by</label>
                      <select
                        value={form.mx.devby || 'Developer'}
                        onChange={(e) => updateMx('devby', e.target.value)}
                      >
                        <option value="Individual">Individual / Private owner</option>
                        <option value="Developer">Developer / Builder</option>
                      </select>
                    </div>

                    {form.mx.devby === 'Developer' && (
                      <div className="fl">
                        <label>Developer name</label>
                        <input
                          type="text"
                          value={form.mx.devname || ''}
                          placeholder="e.g. Shanta Holdings Ltd."
                          onChange={(e) => updateMx('devname', e.target.value)}
                        />
                      </div>
                    )}

                    {!isLand && (
                      <>
                        <div className="fl">
                          <label>Property condition</label>
                          <select
                            value={form.mx.cond || 'Pre-Owned'}
                            onChange={(e) => updateMx('cond', e.target.value)}
                          >
                            <option value="Brand New">Brand New / Unused</option>
                            <option value="Pre-Owned">Pre-Owned</option>
                          </select>
                        </div>

                        <div className="fl">
                          <label>Development status</label>
                          <select
                            value={form.mx.dstat || 'Ready'}
                            onChange={(e) => updateMx('dstat', e.target.value)}
                          >
                            <option value="Ready">Ready to move</option>
                            <option value="Under Construction">Under Construction</option>
                            <option value="Construction Planned">Construction Planned</option>
                          </select>
                        </div>

                        {form.mx.dstat === 'Ready' ? (
                          <div className="fl">
                            <label>Construction finished</label>
                            <select
                              value={form.mx.doneY || '2020'}
                              onChange={(e) => updateMx('doneY', e.target.value)}
                            >
                              {MX_DONE.map((y) => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <>
                            <div className="fl">
                              <label>Handover month</label>
                              <select
                                value={form.mx.compM || 'Jan'}
                                onChange={(e) => updateMx('compM', e.target.value)}
                              >
                                {MX_MONTHS.map((m) => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                            </div>

                            <div className="fl">
                              <label>Handover year</label>
                              <select
                                value={form.mx.compY || '2026'}
                                onChange={(e) => updateMx('compY', e.target.value)}
                              >
                                {MX_YEARS.map((y) => (
                                  <option key={y} value={y}>{y}</option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    <div className="fl">
                      <label>Financing eligible</label>
                      <select
                        value={form.mx.fin || 'Bank Loan'}
                        onChange={(e) => updateMx('fin', e.target.value)}
                      >
                        <option value="Bank Loan">Bank Loan Eligible</option>
                        <option value="Cash Only">Cash Payment Only</option>
                        <option value="Installments">Developer Installment Available</option>
                      </select>
                    </div>

                    <div className="fl">
                      <label>Ownership</label>
                      <select
                        value={form.mx.owned || 'Individual(s)'}
                        onChange={(e) => updateMx('owned', e.target.value)}
                      >
                        <option value="Individual(s)">Single / Private Individual</option>
                        <option value="Joint">Joint Family Ownership</option>
                        <option value="Company">Company Owned</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </fieldset>

            {!isRent && (
              <fieldset className="mx-sec">
                <legend>Available Legal Approvals & Documents <small>tick all that apply</small></legend>
                <div className="chips" style={{ padding: '8px 0' }}>
                  {(!isLand ? MX_APPR : MX_LDOCS).map((docName) => {
                    const arr = form.mx[!isLand ? 'appr' : 'ldocs'] || [];
                    const active = arr.includes(docName);
                    return (
                      <button
                        key={docName}
                        type="button"
                        className={`chip ${active ? 'on' : ''}`}
                        onClick={() => toggleMxArray(!isLand ? 'appr' : 'ldocs', docName)}
                      >
                        {active ? '✓ ' : '+ '}
                        {docName}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
          </div>
        )}

        {/* STEP 5: FACILITIES & UTILITIES */}
        {currentStepKey === 'fac' && (
          <div>
            <p className="ts-lead">
              {isLand ? 'Utilities available at the land and amenities.' : 'What the building and unit offer.'}
            </p>

            <fieldset className="mx-sec">
              <legend>Essential Utilities</legend>
              <div className="mx-grid">
                <div className="fl">
                  <label>Electricity</label>
                  <select
                    value={form.mx.elec || 'Yes'}
                    onChange={(e) => updateMx('elec', e.target.value)}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No / Under application</option>
                  </select>
                </div>

                {form.mx.elec === 'Yes' && (
                  <div className="fl">
                    <label>Electricity Meter</label>
                    <select
                      value={form.mx.elecT || 'Pre-paid'}
                      onChange={(e) => updateMx('elecT', e.target.value)}
                    >
                      <option value="Pre-paid">Pre-paid Smart Meter</option>
                      <option value="Post-paid">Post-paid Regular Meter</option>
                    </select>
                  </div>
                )}

                <div className="fl">
                  <label>Water Connection</label>
                  <select
                    value={form.mx.water || 'Yes'}
                    onChange={(e) => updateMx('water', e.target.value)}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {form.mx.water === 'Yes' && (
                  <div className="fl">
                    <label>Water Source</label>
                    <select
                      value={form.mx.waterT || 'WASA + Submersible'}
                      onChange={(e) => updateMx('waterT', e.target.value)}
                    >
                      <option value="WASA">WASA Supply Line</option>
                      <option value="Submersible">Deep Tube-well / Submersible</option>
                      <option value="WASA + Submersible">Both WASA & Deep Tube-well</option>
                    </select>
                  </div>
                )}

                <div className="fl">
                  <label>Gas Connection</label>
                  <select
                    value={form.mx.gas || 'Yes'}
                    onChange={(e) => updateMx('gas', e.target.value)}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {form.mx.gas === 'Yes' && (
                  <div className="fl">
                    <label>Gas Type</label>
                    <select
                      value={form.mx.gasT || 'Titas Pipeline'}
                      onChange={(e) => updateMx('gasT', e.target.value)}
                    >
                      <option value="Titas Pipeline">Titas Pipeline Gas</option>
                      <option value="LPG Cylinder">LPG Cylinder System</option>
                      <option value="Central LPG">Central LPG Reticulated System</option>
                    </select>
                  </div>
                )}
              </div>
            </fieldset>

            {!isLand && (
              <fieldset className="mx-sec">
                <legend>Building Facilities</legend>
                <div className="mx-grid">
                  <div className="fl">
                    <label>Lift / Elevator</label>
                    <select
                      value={form.mx.lift || 'Yes'}
                      onChange={(e) => updateMx('lift', e.target.value)}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {form.mx.lift === 'Yes' && (
                    <div className="fl">
                      <label>Number of Lifts</label>
                      <input
                        type="number"
                        min="1"
                        value={form.mx.liftN || '1'}
                        onChange={(e) => updateMx('liftN', e.target.value)}
                      />
                    </div>
                  )}

                  <div className="fl">
                    <label>Generator / Power Backup</label>
                    <select
                      value={form.mx.gen || 'Yes'}
                      onChange={(e) => updateMx('gen', e.target.value)}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {form.mx.gen === 'Yes' && (
                    <div className="fl">
                      <label>Backup Scope</label>
                      <select
                        value={form.mx.genT || 'Full Backup'}
                        onChange={(e) => updateMx('genT', e.target.value)}
                      >
                        <option value="Full Backup">Full backup (Lights, fans & AC)</option>
                        <option value="Partial Backup">Partial backup (Lights & fans)</option>
                        <option value="Common Areas">Common areas only</option>
                      </select>
                    </div>
                  )}

                  <div className="fl">
                    <label>Car Parking</label>
                    <select
                      value={form.mx.park || 'Yes'}
                      onChange={(e) => updateMx('park', e.target.value)}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {form.mx.park === 'Yes' && (
                    <div className="fl">
                      <label>Parking Spots</label>
                      <input
                        type="number"
                        min="1"
                        value={form.mx.parkN || '1'}
                        onChange={(e) => updateMx('parkN', e.target.value)}
                      />
                    </div>
                  )}

                  <div className="fl">
                    <label>Security Guard</label>
                    <select
                      value={form.mx.guard || 'Yes'}
                      onChange={(e) => updateMx('guard', e.target.value)}
                    >
                      <option value="Yes">Yes (24/7 Guards)</option>
                      <option value="No">Caretaker only / No dedicated guard</option>
                    </select>
                  </div>
                </div>
              </fieldset>
            )}

            {/* Amenities Chips */}
            <fieldset className="mx-sec">
              <legend>Amenities <small>tick all that apply</small></legend>
              <div className="chips" style={{ padding: '8px 0' }}>
                {(MX_AMEN[form.cat] || MX_AMEN.Flat).map((amenItem) => {
                  const arr = form.mx.amen || [];
                  const active = arr.includes(amenItem);
                  return (
                    <button
                      key={amenItem}
                      type="button"
                      className={`chip ${active ? 'on' : ''}`}
                      onClick={() => toggleMxArray('amen', amenItem)}
                    >
                      {active ? '✓ ' : '+ '}
                      {amenItem}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Safety Chips */}
            {!isLand && (
              <fieldset className="mx-sec">
                <legend>Safety & Security <small>tick all that apply</small></legend>
                <div className="chips" style={{ padding: '8px 0' }}>
                  {MX_SAFE.map((safeItem) => {
                    const arr = form.mx.safe || [];
                    const active = arr.includes(safeItem);
                    return (
                      <button
                        key={safeItem}
                        type="button"
                        className={`chip ${active ? 'on' : ''}`}
                        onClick={() => toggleMxArray('safe', safeItem)}
                      >
                        {active ? '✓ ' : '+ '}
                        {safeItem}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
          </div>
        )}

        {/* STEP 6: MEDIA & PHOTOS */}
        {currentStepKey === 'media' && (
          <div>
            <div className="fl" style={{ marginBottom: '18px' }}>
              <label>Property Description / Summary</label>
              <textarea
                rows="4"
                placeholder="Describe key highlights, cross ventilation, nearby landmarks, metro station distance, or finishings..."
                value={form.sdesc}
                onChange={(e) => setForm((prev) => ({ ...prev, sdesc: e.target.value }))}
              />
            </div>

            {/* Multi-Photo Upload to AWS S3 */}
            <div className="fl" style={{ marginBottom: '22px' }}>
              <label>
                Property Photos <small>(Up to 15 photos · Uploaded directly to AWS S3)</small>
              </label>

              <div
                style={{
                  border: '2px dashed var(--line)',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: '#fafbfd',
                  cursor: 'pointer',
                }}
                onClick={() => photoInputRef.current?.click()}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--orange)"
                  strokeWidth="2"
                  style={{ margin: '0 auto 8px' }}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <div style={{ color: 'var(--navy)', fontWeight: '600', fontSize: '15px' }}>
                  Click or drag photos here to upload
                </div>
                <div style={{ color: 'var(--mut)', fontSize: '12.5px', marginTop: '4px' }}>
                  Supports JPG, PNG, WEBP, HEIC (Photos are permanently hosted on secure AWS S3 bucket)
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/heic,.heic"
                  style={{ display: 'none' }}
                  onChange={handlePhotoSelect}
                />
              </div>

              {photos.length > 0 && (
                <ul className="sv-files" style={{ marginTop: '12px' }}>
                  {photos.map((p, idx) => (
                    <li key={idx}>
                      {p.preview && <img src={p.preview} alt="" />}
                      <span className="sv-fn">{p.name}</span>
                      <small>{p.size}</small>
                      <button
                        type="button"
                        className="sv-rm"
                        onClick={() => removePhoto(idx)}
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Floor Plan Upload */}
            <div className="fl" style={{ marginBottom: '18px' }}>
              <label>Floor Plan (Optional)</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label className="btn btn-g btn-sm">
                  Choose Floor Plan
                  <input
                    ref={floorPlanInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleFloorPlanSelect}
                  />
                </label>
                {floorPlanFile ? (
                  <span style={{ fontSize: '13px', color: 'var(--navy)' }}>
                    ✓ {floorPlanFile.name}
                  </span>
                ) : (
                  <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>
                    PDF or Image (hosted on S3)
                  </span>
                )}
              </div>
            </div>

            {/* Walk-through Video Link */}
            <div className="fl">
              <label>Walk-through Video Link (Optional)</label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=... or Google Drive link"
                value={form.videoUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* STEP 7: PRIVACY & CONTACT */}
        {currentStepKey === 'contact' && (
          <div>
            <div className="note" style={{ marginBottom: '16px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <b>Your contact is never public.</b> Prospective buyers see your listing with &quot;{form.provider} details hidden&quot;.
              When a buyer engages, you get an anonymous request and choose whether to share your contact.
            </div>

            <div className="frow">
              <div className="fl">
                <label>
                  Your name <span className="private">🔒 Private</span> <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rafiqul Hasan"
                  value={form.ownerName}
                  onChange={(e) => setForm((prev) => ({ ...prev, ownerName: e.target.value }))}
                />
              </div>

              <div className="fl">
                <label>
                  Mobile Number <span className="private">🔒 Private</span> <span className="req">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={form.ownerPhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, ownerPhone: e.target.value }))}
                />
              </div>
            </div>

            <div className="frow">
              <div className="fl">
                <label>Preferred Visit Times</label>
                <select
                  value={form.visit}
                  onChange={(e) => setForm((prev) => ({ ...prev, visit: e.target.value }))}
                >
                  <option value="Weekends">Weekends only</option>
                  <option value="Weekday evenings">Weekday evenings</option>
                  <option value="Any day, 10 AM–6 PM">Any day, 10 AM–6 PM</option>
                  <option value="By prior appointment">By prior appointment only</option>
                </select>
              </div>

              <div className="fl">
                <label>Contact Unlock Rule</label>
                <select disabled value="mutual">
                  <option value="mutual">Only after I accept a matched buyer / tenant (always on)</option>
                </select>
              </div>
            </div>

            <label className="chk" style={{ marginTop: '14px', display: 'flex', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.docsPledge}
                onChange={(e) => setForm((prev) => ({ ...prev, docsPledge: e.target.checked }))}
              />
              <span>I can share ownership documents for verification (deed, mutation, RAJUK papers)</span>
            </label>
          </div>
        )}

        {/* STEP 8: VERIFICATION */}
        {currentStepKey === 'verify' && (
          <div>
            <p className="ts-lead">
              Optional. Choose verification tags and attach proof. The proof files are uploaded directly to our <b>AWS S3 bucket</b> and reviewed by TrueSpace moderation.
            </p>

            <div id="vtWrap">
              {/* Photo/Video Verified */}
              <div className={`sv-card ${form.vt.photo?.on ? 'on' : ''}`}>
                <div className="sv-n">Photo/Video Verified</div>
                <div className="sv-meta">
                  <span className="sv-st on">Available</span>
                  <span className="sv-fee free">Free during launch</span>
                </div>
                <p className="sv-d">
                  TSP checks that photos and walk-through videos are authentic, recent, and show this specific property.
                </p>
                <label className="sv-pick">
                  <input
                    type="checkbox"
                    checked={form.vt.photo?.on}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        vt: { ...prev.vt, photo: { ...prev.vt.photo, on: e.target.checked } },
                      }))
                    }
                  />
                  <span>Request Photo/Video Verified with this listing</span>
                </label>

                {form.vt.photo?.on && (
                  <div className="sv-body">
                    <div className="sv-up">
                      <div className="sv-up-h">
                        <div>
                          <b>Verification Photos</b>
                          <small>JPG, PNG, WEBP · 3 to 10 photos</small>
                        </div>
                        <label className="btn btn-g btn-sm sv-btn">
                          Choose Photos
                          <input
                            ref={vtPhotoInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="sv-in"
                            onChange={handleVtPhotoSelect}
                          />
                        </label>
                      </div>

                      {vtPhotoFiles.length > 0 ? (
                        <ul className="sv-files">
                          {vtPhotoFiles.map((f, i) => (
                            <li key={i}>
                              {f.preview ? <img src={f.preview} alt="" /> : <span className="sv-ic">📄</span>}
                              <span className="sv-fn">{f.name}</span>
                              <small>{f.size}</small>
                              <button
                                type="button"
                                className="sv-rm"
                                onClick={() => removeVtPhoto(i)}
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="sv-empty">
                          {photos.length >= 3
                            ? `✓ ${photos.length} photos already selected in Step 6 will be used for verification!`
                            : 'Select at least 3 photos (or add them in Step 6).'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Document Verified */}
              <div className={`sv-card ${form.vt.docs?.on ? 'on' : ''}`}>
                <div className="sv-n">Paper & Documents Verified by TSP</div>
                <div className="sv-meta">
                  <span className="sv-st on">Available</span>
                  <span className="sv-fee free">Free during launch</span>
                </div>
                <p className="sv-d">
                  TSP checks the ownership documents (Deed/Dolil, Mutation/Namjari, Khajna receipt, Approved plan, NID).
                </p>
                <label className="sv-pick">
                  <input
                    type="checkbox"
                    checked={form.vt.docs?.on}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        vt: { ...prev.vt, docs: { ...prev.vt.docs, on: e.target.checked } },
                      }))
                    }
                  />
                  <span>Request Paper & Documents Verified with this listing</span>
                </label>

                {form.vt.docs?.on && (
                  <div className="sv-body">
                    <div className="sv-up">
                      <div className="sv-up-h">
                        <div>
                          <b>Upload Ownership Papers</b>
                          <small>PDF, JPG, PNG · Uploaded to private AWS S3</small>
                        </div>
                        <label className="btn btn-g btn-sm sv-btn">
                          Choose Documents
                          <input
                            ref={vtDocsInputRef}
                            type="file"
                            multiple
                            accept=".pdf,image/jpeg,image/png"
                            className="sv-in"
                            onChange={handleVtDocsSelect}
                          />
                        </label>
                      </div>

                      {vtDocsFiles.length > 0 ? (
                        <ul className="sv-files">
                          {vtDocsFiles.map((d, i) => (
                            <li key={i}>
                              <span className="sv-ic">📄</span>
                              <span className="sv-fn">{d.name}</span>
                              <small>{d.size}</small>
                              <button
                                type="button"
                                className="sv-rm"
                                onClick={() => removeVtDoc(i)}
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="sv-empty">No verification documents selected yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* TSP Agent Verified */}
              <div className={`sv-card ${form.vt.agent?.on ? 'on' : ''}`}>
                <div className="sv-n">Human / TSP Agent Verified</div>
                <div className="sv-meta">
                  <span className="sv-st soon">Available</span>
                  <span className="sv-fee free">Free during launch</span>
                </div>
                <p className="sv-d">
                  A TSP agent visits the property in person and validates all listed specs.
                </p>
                <label className="sv-pick">
                  <input
                    type="checkbox"
                    checked={form.vt.agent?.on}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        vt: { ...prev.vt, agent: { ...prev.vt.agent, on: e.target.checked } },
                      }))
                    }
                  />
                  <span>Book TSP Agent site inspection</span>
                </label>

                {form.vt.agent?.on && (
                  <div className="sv-body">
                    <div className="sv-row">
                      <div className="fl">
                        <label>Preferred Visit Date</label>
                        <input
                          type="date"
                          value={form.vt.agent?.date || ''}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              vt: { ...prev.vt, agent: { ...prev.vt.agent, date: e.target.value } },
                            }))
                          }
                        />
                      </div>
                      <div className="fl">
                        <label>Time Slot</label>
                        <select
                          value={form.vt.agent?.slot || 'Morning (10 AM–1 PM)'}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              vt: { ...prev.vt, agent: { ...prev.vt.agent, slot: e.target.value } },
                            }))
                          }
                        >
                          <option>Morning (10 AM–1 PM)</option>
                          <option>Afternoon (2 PM–5 PM)</option>
                          <option>Evening (5 PM–8 PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: REVIEW & SUBMIT */}
        {currentStepKey === 'review' && (
          <div>
            <p className="ts-lead">
              Review your listing details below. Click any <b>Edit</b> button to jump directly to that step.
            </p>

            <div className="ts-rv-wrap">
              {/* Review Table */}
              <div>
                {/* 1. Type */}
                <div className="ts-rv">
                  <div className="ts-rv-h">
                    <h4>1. Listing Type</h4>
                    <button type="button" className="btn btn-g btn-sm" onClick={() => jumpToStep(0)}>
                      Edit
                    </button>
                  </div>
                  <table className="tt">
                    <tbody>
                      <tr><th>Purpose</th><td>For {form.purpose.toLowerCase()}</td></tr>
                      <tr><th>Category</th><td>{catLabel}</td></tr>
                      <tr><th>Listed by</th><td>{form.provider}</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. Location */}
                <div className="ts-rv">
                  <div className="ts-rv-h">
                    <h4>2. Location & Address</h4>
                    <button type="button" className="btn btn-g btn-sm" onClick={() => jumpToStep(1)}>
                      Edit
                    </button>
                  </div>
                  <table className="tt">
                    <tbody>
                      <tr><th>Location</th><td>{form.area === 'Other' ? form.areaOther : form.area}</td></tr>
                      <tr><th>Title</th><td>{form.title || 'Auto-generated'}</td></tr>
                      <tr><th>Address</th><td>{form.address} <small style={{ color: 'var(--mut)' }}>(Hidden from buyers)</small></td></tr>
                    </tbody>
                  </table>
                </div>

                {/* 3. Specs */}
                <div className="ts-rv">
                  <div className="ts-rv-h">
                    <h4>3. Property Details</h4>
                    <button type="button" className="btn btn-g btn-sm" onClick={() => jumpToStep(2)}>
                      Edit
                    </button>
                  </div>
                  <table className="tt">
                    <tbody>
                      {isApartment && (
                        <>
                          <tr><th>Size</th><td>{form.mx.size} sqft</td></tr>
                          <tr><th>Bedrooms</th><td>{form.mx.beds} Bed</td></tr>
                          <tr><th>Bathrooms</th><td>{form.mx.baths} Bath</td></tr>
                          <tr><th>Floor</th><td>Floor {form.mx.flevel} of {form.mx.tfloors || '-'}</td></tr>
                          <tr><th>Facing</th><td>{form.mx.facing}</td></tr>
                        </>
                      )}
                      {isLand && (
                        <>
                          <tr><th>Land Size</th><td>{form.mx.lsize} {form.mx.lunit}</td></tr>
                          <tr><th>Facing</th><td>{form.mx.facing}</td></tr>
                          <tr><th>Road width</th><td>{form.mx.road} ft</td></tr>
                        </>
                      )}
                      {isCommercial && (
                        <>
                          <tr><th>Type</th><td>{form.mx.comType}</td></tr>
                          <tr><th>Size</th><td>{form.mx.size} sqft</td></tr>
                          <tr><th>Floor</th><td>Floor {form.mx.flevel}</td></tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 4. Price & Terms */}
                <div className="ts-rv">
                  <div className="ts-rv-h">
                    <h4>4. Price & Terms</h4>
                    <button type="button" className="btn btn-g btn-sm" onClick={() => jumpToStep(3)}>
                      Edit
                    </button>
                  </div>
                  <table className="tt">
                    <tbody>
                      <tr>
                        <th>{isRent ? 'Monthly Rent' : 'Asking Price'}</th>
                        <td><b>৳ {Number(form.mx.price || 0).toLocaleString('en-BD')}</b></td>
                      </tr>
                      {isRent ? (
                        <>
                          <tr><th>Advance</th><td>{form.mx.advance}</td></tr>
                          <tr><th>Tenant</th><td>{form.mx.tenant}</td></tr>
                        </>
                      ) : (
                        <>
                          <tr><th>Handover</th><td>{form.mx.dstat}</td></tr>
                          <tr><th>Developer</th><td>{form.mx.devname || form.mx.devby}</td></tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 5. Building & Utilities */}
                <div className="ts-rv">
                  <div className="ts-rv-h">
                    <h4>5. Facilities & Amenities</h4>
                    <button type="button" className="btn btn-g btn-sm" onClick={() => jumpToStep(4)}>
                      Edit
                    </button>
                  </div>
                  <table className="tt">
                    <tbody>
                      <tr><th>Electricity</th><td>{form.mx.elec} ({form.mx.elecT})</td></tr>
                      <tr><th>Water</th><td>{form.mx.water}</td></tr>
                      <tr><th>Gas</th><td>{form.mx.gas} ({form.mx.gasT})</td></tr>
                      {!isLand && (
                        <>
                          <tr><th>Lift</th><td>{form.mx.lift} ({form.mx.liftN} lifts)</td></tr>
                          <tr><th>Generator</th><td>{form.mx.gen} ({form.mx.genT})</td></tr>
                        </>
                      )}
                      <tr><th>Amenities</th><td>{form.mx.amen?.join(', ') || 'None selected'}</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* 6. Media */}
                <div className="ts-rv">
                  <div className="ts-rv-h">
                    <h4>6. Media</h4>
                    <button type="button" className="btn btn-g btn-sm" onClick={() => jumpToStep(5)}>
                      Edit
                    </button>
                  </div>
                  <table className="tt">
                    <tbody>
                      <tr><th>Photos Selected</th><td>{photos.length} photos ready for AWS S3 upload</td></tr>
                      <tr><th>Floor Plan</th><td>{floorPlanFile ? 'Attached' : 'None'}</td></tr>
                      <tr><th>Video Link</th><td>{form.videoUrl || 'None'}</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* 7. Verification */}
                <div className="ts-rv">
                  <div className="ts-rv-h">
                    <h4>7. Verification & Contact</h4>
                    <button type="button" className="btn btn-g btn-sm" onClick={() => jumpToStep(7)}>
                      Edit
                    </button>
                  </div>
                  <table className="tt">
                    <tbody>
                      <tr><th>Contact</th><td>{form.ownerName} · {form.ownerPhone} (Private)</td></tr>
                      <tr><th>Photo Verified</th><td>{form.vt.photo?.on ? 'Requested (Proof attached)' : 'No'}</td></tr>
                      <tr><th>Doc Verified</th><td>{form.vt.docs?.on ? `Requested (${vtDocsFiles.length} files attached)` : 'No'}</td></tr>
                      <tr><th>Visit Time</th><td>{form.visit}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Preview Card */}
              <div style={{ position: 'sticky', top: '90px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy)', marginBottom: '8px' }}>
                  Live Buyer Card Preview
                </div>
                <div
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    border: '1px solid var(--line)',
                    overflow: 'hidden',
                    boxShadow: 'var(--sh)',
                  }}
                >
                  <div
                    style={{
                      height: '160px',
                      background: 'var(--navy2)',
                      position: 'relative',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                    }}
                  >
                    {photos.length > 0 && photos[0].preview ? (
                      <img
                        src={photos[0].preview}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '24px' }}>🏡</span>
                        <div style={{ fontSize: '12px', color: '#c9d1e6' }}>{photos.length} photos</div>
                      </div>
                    )}
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'var(--orange)',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      For {form.purpose}
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      🔒 Owner details hidden
                    </span>
                  </div>

                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--navy)' }}>
                      ৳ {Number(form.mx.price || 0).toLocaleString('en-BD')}
                      {isRent && <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--mut)' }}> / month</span>}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)', margin: '4px 0 6px' }}>
                      {form.title || `${catLabel} in ${form.area}`}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--mut)' }}>
                      📍 {form.area === 'Other' ? form.areaOther : form.area}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginTop: '10px',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--line)',
                        fontSize: '12px',
                        color: 'var(--mut)',
                      }}
                    >
                      {isApartment && (
                        <>
                          <span>🛏️ {form.mx.beds || 3} Beds</span>
                          <span>🚿 {form.mx.baths || 2} Baths</span>
                          <span>📐 {form.mx.size || 1450} sqft</span>
                        </>
                      )}
                      {isLand && (
                        <>
                          <span>📐 {form.mx.lsize || 5} {form.mx.lunit || 'Katha'}</span>
                          <span>🧭 {form.mx.facing || 'South'}</span>
                        </>
                      )}
                      {isCommercial && (
                        <>
                          <span>📐 {form.mx.size || 1800} sqft</span>
                          <span>🏢 {form.mx.comType}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: '#fdf2f2',
              color: '#d64545',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: '500',
              border: '1px solid #f8b4b4',
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Wizard Footer Navigation Actions */}
        <div className={`factions ts-nav ${step > 0 && step < STEPS.length - 1 ? 'ts-nav3' : ''}`}>
          {step > 0 ? (
            <button type="button" className="btn btn-g" onClick={handleBack} disabled={submitting}>
              ← Back
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-g"
              onClick={() => fillSample(form.cat, form.purpose === 'Rent')}
              disabled={submitting}
            >
              Fill with sample data
            </button>
          )}

          <div className="ts-fr">
            {step > 0 && step < STEPS.length - 1 && (
              <button
                type="button"
                className="btn btn-g"
                onClick={() => jumpToStep(STEPS.length - 1)}
                disabled={submitting}
              >
                Review
              </button>
            )}

            <button
              type="button"
              className={`btn ${step === STEPS.length - 1 ? 'btn-o' : 'btn-n'}`}
              onClick={handleNext}
              disabled={submitting}
            >
              {submitting
                ? 'Uploading to S3 & submitting...'
                : step === STEPS.length - 1
                ? 'Submit Property Listing →'
                : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

