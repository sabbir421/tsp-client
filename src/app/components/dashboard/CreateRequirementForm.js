'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { requirementApi } from '../../utils/api';
import {
  CATEGORIES,
  RESIDENTIAL_SUBTYPES,
  COMMERCIAL_SUBTYPES,
  BED_OPTIONS,
  ZONES,
  CITIES,
  INITIAL_REQUIREMENT_FORM,
} from './requirementFormConstants';
import styles from './requirementForm.module.css';

export default function CreateRequirementForm({ onSuccess, onCancel }) {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_REQUIREMENT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isResidential = form.category === 'residential';
  const subTypes = isResidential ? RESIDENTIAL_SUBTYPES : COMMERCIAL_SUBTYPES;
  const categoryLabel = isResidential ? 'Residential' : 'Commercial';

  const update = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'category') {
        const options = value === 'residential' ? RESIDENTIAL_SUBTYPES : COMMERCIAL_SUBTYPES;
        next.subType = options[0];
        if (value === 'commercial') {
          next.residentialNotes = '';
          next.bedrooms = null;
        } else {
          next.bedrooms = next.bedrooms || '3';
        }
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await requirementApi.create(form);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/my-requirements');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {!onCancel && (
        <Link href="/dashboard/my-requirements" className={styles.backLink}>
          ← Back to My Requirements
        </Link>
      )}

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formIntro}>
          <h2 className={styles.formIntroTitle}>Create New Requirement</h2>
          <p className={styles.formIntroDesc}>
            Tell us what you&apos;re looking for in your own words — just fill in the blanks below.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* Image 1 — Section 1: Residential / Commercial */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>1. Choose category</span>
          <div className={styles.categoryRow}>
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.categoryBtn} ${form.category === value ? styles.categoryBtnActive : ''}`}
                onClick={() => update('category', value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Image 1 — Section 2: Conditional sub-type */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>2. Select property type</span>
          <div className={styles.subTypeGrid}>
            {subTypes.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`${styles.subTypeChip} ${form.subType === opt ? styles.subTypeChipActive : ''}`}
                onClick={() => update('subType', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Image 2 — Natural language sentence */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>3. Describe your requirement</span>
          <p className={styles.sentence}>
            I need a{' '}
            <span className={styles.inlineHighlight}>{categoryLabel}</span>{' '}
            <span className={styles.inlineHighlight}>{form.subType}</span>
            {isResidential ? (
              <>
                {' '}
                of{' '}
                <select
                  className={styles.inlineSelect}
                  value={form.bedrooms}
                  onChange={(e) => update('bedrooms', e.target.value)}
                >
                  {BED_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>{' '}
                bedrooms, within{' '}
              </>
            ) : (
              ' within '
            )}
            <input
              type="number"
              className={`${styles.inlineInput} ${styles.inlineInputNarrow}`}
              placeholder="1200"
              value={form.sizeSqFt}
              onChange={(e) => update('sizeSqFt', e.target.value)}
              min="1"
            />{' '}
            sft at{' '}
            <select
              className={`${styles.inlineSelect} ${styles.inlineSelectZone}`}
              value={form.zone}
              onChange={(e) => update('zone', e.target.value)}
            >
              {ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>{' '}
            of{' '}
            <input
              type="text"
              className={`${styles.inlineInput} ${styles.inlineInputWide}`}
              placeholder="Sector 11"
              value={form.area}
              onChange={(e) => update('area', e.target.value)}
            />
            . My maximum budget is BDT{' '}
            <input
              type="number"
              className={`${styles.inlineInput} ${styles.inlineInputBudget}`}
              placeholder="1,50,00,000"
              value={form.maxBudget}
              onChange={(e) => update('maxBudget', e.target.value)}
              min="1"
              required
            />
            .
          </p>
        </div>

        {/* Image 1 — Section 3 / Field ④: Residential-only free text */}
        {isResidential && (
          <div className={styles.fieldBlock}>
            <label className={styles.fieldLabel} htmlFor="residentialNotes">
              4. Additional details <span className={styles.fieldHint}>(Residential only)</span>
            </label>
            <textarea
              id="residentialNotes"
              className={styles.textarea}
              placeholder="Any specific preferences for your home..."
              value={form.residentialNotes}
              onChange={(e) => update('residentialNotes', e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* Location — synced with zone & area in description above */}
        <div className={styles.fieldBlock}>
          <span className={styles.fieldLabel}>5–7. Location</span>
          <p className={styles.locationSyncHint}>
            Zone and area below match what you selected in the description above.
          </p>
          <div className={styles.locationGrid}>
            <div className={styles.locationField}>
              <label className={styles.locationLabel} htmlFor="zone">
                Zone
              </label>
              <select
                id="zone"
                className={styles.locationSelect}
                value={form.zone}
                onChange={(e) => update('zone', e.target.value)}
              >
                {ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.locationField}>
              <label className={styles.locationLabel} htmlFor="area">
                Area
              </label>
              <input
                id="area"
                type="text"
                className={styles.locationInput}
                placeholder="Sector: 11"
                value={form.area}
                onChange={(e) => update('area', e.target.value)}
              />
            </div>
            <div className={styles.locationField}>
              <label className={styles.locationLabel} htmlFor="city">
                City
              </label>
              <select
                id="city"
                className={styles.locationSelect}
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Requirement'}
          </button>
          {onCancel ? (
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
          ) : (
            <Link href="/dashboard/my-requirements" className={styles.cancelBtn}>
              Cancel
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
