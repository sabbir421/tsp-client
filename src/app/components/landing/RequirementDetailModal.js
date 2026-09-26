'use client';

import { useEffect } from 'react';
import { USER_ROLES } from '../../constants';
import { openPortalWindow } from '../../utils/navigation';
import { formatSqFt } from '../../utils/format';
import styles from './landing.module.css';

export default function RequirementDetailModal({ requirement, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!requirement) return null;

  const handleSuggest = () => {
    onClose();
    openPortalWindow(
      `/dashboard/buyer-requirements?requirementId=${requirement.id}`,
      USER_ROLES.SELLER_AGENT
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 className={styles.modalTitle}>{requirement.title}</h2>
        <p className={styles.modalLocation}>
          {[requirement.sector, requirement.area, requirement.city].filter(Boolean).join(', ')}
        </p>
        <p className={styles.modalPrice}>
          {requirement.budget || requirement.budgetDisplay}
        </p>

        <div className={styles.modalSection}>
          <p className={styles.modalSectionTitle}>Requirement details</p>
          <div className={styles.specGrid}>
            <div className={styles.specItem}><span className={styles.specLabel}>Category: </span>{requirement.category === 'residential' ? 'Residential' : 'Commercial'}</div>
            <div className={styles.specItem}><span className={styles.specLabel}>Type: </span>{requirement.subType}</div>
            {requirement.bedrooms && (
              <div className={styles.specItem}><span className={styles.specLabel}>Bedrooms: </span>{requirement.bedrooms}</div>
            )}
            <div className={styles.specItem}><span className={styles.specLabel}>Size: </span>{formatSqFt(requirement.sizeSqFt)}</div>
            {requirement.createdAt && (
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Posted: </span>
                {new Date(requirement.createdAt).toLocaleDateString('en-US')}
              </div>
            )}
          </div>
        </div>

        {requirement.summary && (
          <div className={styles.modalSection}>
            <p className={styles.modalSectionTitle}>Summary</p>
            <p className={styles.modalText}>{requirement.summary}</p>
          </div>
        )}

        {requirement.mustHaves?.length > 0 && (
          <div className={styles.modalSection}>
            <p className={styles.modalSectionTitle}>Must-haves</p>
            <div className={styles.chipList}>
              {requirement.mustHaves.map((item) => (
                <span key={item} className={styles.chip}>{item}</span>
              ))}
            </div>
          </div>
        )}

        <div className={styles.modalActions}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Close
          </button>
          <button type="button" className={styles.btnPrimary} onClick={handleSuggest}>
            Suggest a property
          </button>
        </div>
        <p className={styles.modalHint}>
          Suggesting a property requires a seller or agent account. You will be redirected to sign in.
        </p>
      </div>
    </div>
  );
}
