'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { requirementApi } from '../../utils/api';
import { IconPlus } from '../layout/icons';
import CreateRequirementForm from './CreateRequirementForm';
import styles from './myRequirements.module.css';
import common from './pageCommon.module.css';

const BADGE_CLASS = {
  active: styles.badgeActive,
  matched: styles.badgeMatched,
  closed: styles.badgeClosed,
};

function IconRequirementsLarge() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

export default function MyRequirementsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCreate = searchParams.get('create') === '1';

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadRequirements = async () => {
    try {
      setError('');
      const res = await requirementApi.getMine();
      setRequirements(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await requirementApi.delete(id);
      setRequirements((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateSuccess = () => {
    router.replace('/dashboard/my-requirements');
    setLoading(true);
    loadRequirements();
  };

  const openCreate = () => router.push('/dashboard/my-requirements?create=1');
  const closeCreate = () => router.push('/dashboard/my-requirements');

  if (showCreate) {
    return (
      <div className={styles.createView}>
        <CreateRequirementForm onSuccess={handleCreateSuccess} onCancel={closeCreate} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={common.loading}>
        <div className={common.spinner} />
        Loading your requirements...
      </div>
    );
  }

  return (
    <div>
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>My Requirements</h1>
          <p className={common.pageSubtitle}>
            View your property search criteria and create new requirements to get better matches.
          </p>
        </div>
        <button type="button" className={common.primaryBtn} onClick={openCreate}>
          <IconPlus />
          Create New Requirement
        </button>
      </div>

      {error && <div className={common.error}>{error}</div>}

      {requirements.length === 0 ? (
        <div className={common.emptyState}>
          <div className={common.emptyIcon}>
            <IconRequirementsLarge />
          </div>
          <h2 className={common.emptyTitle}>No requirements yet</h2>
          <p className={common.emptyDesc}>
            Tell us what you&apos;re looking for and we&apos;ll match you with properties that fit your needs.
          </p>
          <button type="button" className={common.primaryBtn} onClick={openCreate}>
            <IconPlus />
            Create Your First Requirement
          </button>
        </div>
      ) : (
        <div className={styles.requirementGrid}>
          {requirements.map((req) => (
            <article key={req.id} className={styles.requirementCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardCategory}>
                  {req.category === 'residential' ? 'Residential' : 'Commercial'}
                </span>
                <span className={`${styles.badge} ${BADGE_CLASS[req.status] || styles.badgeActive}`}>
                  {req.statusLabel}
                </span>
              </div>

              <h2 className={styles.cardTitle}>{req.title}</h2>
              <p className={styles.cardSummary}>{req.summary}</p>
              <p className={styles.cardBudget}>{req.budgetDisplay}</p>

              <div className={styles.cardMeta}>
                {req.subType && <span>{req.subType}</span>}
                {req.sizeSqFt && <span>{req.sizeSqFt} sft</span>}
                {req.area && <span>Sector: {req.area}</span>}
                {req.zone && <span>{req.zone}</span>}
                {req.city && <span>{req.city}</span>}
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  disabled={deletingId === req.id}
                  onClick={() => handleDelete(req.id, req.title)}
                >
                  {deletingId === req.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
