'use client';

import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { propertyApi, getUploadUrl } from '../../utils/api';
import {
  PROPERTY_TYPES,
  PURPOSES,
  CITIES,
  BED_OPTIONS,
  BATH_OPTIONS,
  BALCONY_OPTIONS,
  AMENITIES,
  CONTACT_METHODS,
  BEST_TIMES,
  INITIAL_FORM,
  propertyToForm,
} from './propertyFormConstants';
import styles from './postProperty.module.css';

function IconUpload() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function Section({ number, title, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>{number}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

export default function PostPropertyForm({ propertyId = null }) {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const isEdit = Boolean(propertyId);

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    contactNumber: user?.phone || '',
    whatsappNumber: user?.phone || '',
  });
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;

    const loadProperty = async () => {
      try {
        const res = await propertyApi.getOne(propertyId);
        setForm(propertyToForm(res.data));
        setExistingPhotos(res.data.photos || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [isEdit, propertyId]);

  const update = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'purpose') {
        next.propertyFor = value === 'Rent' ? 'rent' : 'sale';
      }
      return next;
    });
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const toggleContactMethod = (method) => {
    setForm((prev) => ({
      ...prev,
      preferredContact: prev.preferredContact.includes(method)
        ? prev.preferredContact.filter((m) => m !== method)
        : [...prev.preferredContact, method],
    }));
  };

  const handleFiles = (files) => {
    const remaining = 10 - photos.length - existingPhotos.length;
    const newPhotos = Array.from(files)
      .filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .slice(0, remaining)
      .map((file) => ({
        file,
        url: URL.createObjectURL(file),
        isVideo: file.type.startsWith('video/'),
      }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removeExistingPhoto = (photoPath) => {
    setExistingPhotos((prev) => prev.filter((p) => p !== photoPath));
  };

  const removeNewPhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.confirmed) return;

    setSubmitting(true);
    setError('');

    try {
      if (isEdit) {
        await propertyApi.update(propertyId, form, photos, existingPhotos);
      } else {
        await propertyApi.create(form, photos);
      }
      setSubmitted(true);
      setTimeout(() => router.push('/dashboard/my-properties'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.page}><div className={styles.loading}>Loading property...</div></div>;
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.successMessage}>
          Property {isEdit ? 'updated' : 'submitted for review'} successfully. Redirecting…
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{isEdit ? 'Edit Property' : 'Post Your Property'}</h1>
          <p className={styles.pageSubtitle}>
            {isEdit
              ? 'Update your listing details below.'
              : 'Fill in the details below to list your property. Our team will review and match it with verified buyer requirements.'}
          </p>
        </div>
        <div className={styles.secureBadge}>
          <div className={styles.secureIcon}><IconShield /></div>
          <div>
            <div className={styles.secureText}>Secure &amp; Verified</div>
            <div className={styles.secureSub}>Your details are safe with us</div>
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <Section number={1} title="Property Details">
          <div className={`${styles.fieldGrid} ${styles.fieldGrid2}`}>
            <div className={styles.field}>
              <label className={styles.label}>Property Type<span className={styles.required}>*</span></label>
              <select className={styles.select} value={form.propertyType} onChange={(e) => update('propertyType', e.target.value)}>
                {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Purpose<span className={styles.required}>*</span></label>
              <select className={styles.select} value={form.purpose} onChange={(e) => update('purpose', e.target.value)}>
                {PURPOSES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Area / Locality<span className={styles.required}>*</span></label>
              <input className={styles.input} placeholder="e.g. Bashundhara R/A" value={form.area} onChange={(e) => update('area', e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Sector / Block</label>
              <input className={styles.input} placeholder="e.g. Block C" value={form.sector} onChange={(e) => update('sector', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>City<span className={styles.required}>*</span></label>
              <select className={styles.select} value={form.city} onChange={(e) => update('city', e.target.value)}>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>Address<span className={styles.required}>*</span></label>
              <textarea className={styles.textarea} placeholder="House / Road / Plot / Landmark" value={form.address} onChange={(e) => update('address', e.target.value)} required />
            </div>
          </div>
        </Section>

        <Section number={2} title="Size & Price">
          <div className={`${styles.fieldGrid} ${styles.fieldGrid2}`}>
            <div className={styles.field}>
              <label className={styles.label}>Size (Sq Ft)<span className={styles.required}>*</span></label>
              <input className={styles.input} type="number" placeholder="e.g. 1600" value={form.sizeSqFt} onChange={(e) => update('sizeSqFt', e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Land Area (Katha)</label>
              <input className={styles.input} type="number" placeholder="e.g. 5" value={form.landAreaKatha} onChange={(e) => update('landAreaKatha', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Price<span className={styles.required}>*</span></label>
              <div className={styles.priceWrap}>
                <input className={`${styles.input} ${styles.priceInput}`} placeholder="e.g. 22500000" value={form.price} onChange={(e) => update('price', e.target.value)} required />
                <span className={styles.priceSuffix}>BDT</span>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Price Negotiable?</label>
              <div className={styles.radioGroup}>
                {['yes', 'no'].map((v) => (
                  <label key={v} className={styles.radioLabel}>
                    <input type="radio" name="priceNegotiable" value={v} checked={form.priceNegotiable === v} onChange={() => update('priceNegotiable', v)} />
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section number={3} title="Property Features">
          <div className={`${styles.fieldGrid} ${styles.fieldGrid3}`}>
            <div className={styles.field}>
              <label className={styles.label}>Bedrooms</label>
              <select className={styles.select} value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)}>
                {BED_OPTIONS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Bathrooms</label>
              <select className={styles.select} value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)}>
                {BATH_OPTIONS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Balcony</label>
              <select className={styles.select} value={form.balcony} onChange={(e) => update('balcony', e.target.value)}>
                {BALCONY_OPTIONS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Floor</label>
              <input className={styles.input} type="number" placeholder="e.g. 5" value={form.floor} onChange={(e) => update('floor', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Total Floors</label>
              <input className={styles.input} type="number" placeholder="e.g. 12" value={form.totalFloors} onChange={(e) => update('totalFloors', e.target.value)} />
            </div>
          </div>
        </Section>

        <Section number={4} title="Amenities">
          <div className={styles.amenitiesGrid}>
            {AMENITIES.map((amenity) => (
              <label key={amenity} className={styles.checkboxLabel}>
                <input type="checkbox" checked={form.amenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} />
                {amenity}
              </label>
            ))}
            <div className={styles.otherAmenity}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={form.amenities.includes('Other')} onChange={() => toggleAmenity('Other')} />
                Other
              </label>
              <input className={styles.input} placeholder="Specify other amenities" value={form.otherAmenity} onChange={(e) => update('otherAmenity', e.target.value)} />
            </div>
          </div>
        </Section>

        <Section number={5} title="Photos & Videos">
          <div>
            <label className={styles.label}>Upload Photos / Videos</label>
            <div
              className={`${styles.uploadZone} ${dragOver ? styles.uploadZoneDrag : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            >
              <div className={styles.uploadIcon}><IconUpload /></div>
              <div className={styles.uploadTitle}>Click to upload or drag &amp; drop</div>
              <div className={styles.uploadHint}>PNG, JPG, MP4, WEBM up to 50MB each</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
              multiple
              className={styles.hiddenInput}
              onChange={(e) => handleFiles(e.target.files)}
            />
            {(existingPhotos.length > 0 || photos.length > 0) && (
              <div className={styles.photoPreviews}>
                {existingPhotos.map((photo) => {
                  const isVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(photo);
                  return (
                    <div key={photo} className={styles.photoThumbWrap}>
                      {isVideo ? (
                        <video src={getUploadUrl(photo)} className={styles.photoThumb} muted preload="metadata" />
                      ) : (
                        <img src={getUploadUrl(photo)} alt="Property" className={styles.photoThumb} />
                      )}
                      <button type="button" className={styles.removePhotoBtn} onClick={() => removeExistingPhoto(photo)}>×</button>
                    </div>
                  );
                })}
                {photos.map((p, i) => (
                  <div key={p.url} className={styles.photoThumbWrap}>
                    {p.isVideo ? (
                      <video src={p.url} className={styles.photoThumb} muted preload="metadata" />
                    ) : (
                      <img src={p.url} alt={`Upload ${i + 1}`} className={styles.photoThumb} />
                    )}
                    <button type="button" className={styles.removePhotoBtn} onClick={() => removeNewPhoto(i)}>×</button>
                  </div>
                ))}
                {existingPhotos.length + photos.length < 10 && (
                  <button type="button" className={styles.addMoreBtn} onClick={() => fileInputRef.current?.click()}>
                    <IconPlus />
                    Add More
                  </button>
                )}
              </div>
            )}
          </div>
        </Section>

        <Section number={6} title="Contact & Communication">
          <div className={`${styles.fieldGrid} ${styles.fieldGrid2}`}>
            <div className={styles.field}>
              <label className={styles.label}>Direct Contact Number<span className={styles.required}>*</span></label>
              <div className={styles.phoneRow}>
                <span className={styles.phonePrefix}>+880</span>
                <input className={`${styles.input} ${styles.phoneInput}`} placeholder="XXXXXXXXXX" value={form.contactNumber} onChange={(e) => update('contactNumber', e.target.value)} required />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>WhatsApp Number</label>
              <div className={styles.phoneRow}>
                <span className={styles.phonePrefix}>+880</span>
                <input className={`${styles.input} ${styles.phoneInput}`} placeholder="XXXXXXXXXX" value={form.whatsappNumber} onChange={(e) => update('whatsappNumber', e.target.value)} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Preferred Contact Method</label>
              <div className={styles.contactMethods}>
                {CONTACT_METHODS.map((method) => (
                  <label key={method} className={styles.checkboxLabel}>
                    <input type="checkbox" checked={form.preferredContact.includes(method)} onChange={() => toggleContactMethod(method)} />
                    {method}
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Best Time to Contact</label>
              <select className={styles.select} value={form.bestTime} onChange={(e) => update('bestTime', e.target.value)}>
                {BEST_TIMES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <div className={styles.submitSection}>
          <label className={styles.confirmRow}>
            <input type="checkbox" checked={form.confirmed} onChange={(e) => update('confirmed', e.target.checked)} />
            I confirm that the information provided is accurate.
          </label>
          <button type="submit" className={styles.submitBtn} disabled={!form.confirmed || submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit for Review'}
          </button>
          <p className={styles.submitNote}>
            {isEdit
              ? 'Your updated listing will be reviewed if major details changed.'
              : 'Our team will review and publish your property after verification.'}
          </p>
        </div>
      </form>
    </div>
  );
}
