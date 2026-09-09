'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { propertyApi, getUploadUrl } from '../../utils/api';
import { IconPlus } from '../layout/icons';
import styles from './myProperties.module.css';
import common from './pageCommon.module.css';
import dashStyles from '../layout/dashboard.module.css';

const BADGE_CLASS = {
  pending: styles.badgePending,
  verified: styles.badgeVerified,
  matched: styles.badgeMatched,
};

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadProperties = async () => {
    try {
      setError('');
      const res = await propertyApi.getMine();
      setProperties(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await propertyApi.delete(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className={common.loading}>
        <div className={common.spinner} />
        Loading your properties...
      </div>
    );
  }

  return (
    <div>
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>My Properties</h1>
          <p className={common.pageSubtitle}>
            Manage your listings — edit details or remove properties you no longer want to list.
          </p>
        </div>
        <Link href="/dashboard/post-property" className={common.primaryBtn}>
          <IconPlus />
          Post New Property
        </Link>
      </div>

      {error && <div className={common.error}>{error}</div>}

      {properties.length === 0 ? (
        <div className={common.emptyState}>
          <div className={common.emptyIcon}>🏢</div>
          <h2 className={common.emptyTitle}>No properties yet</h2>
          <p className={common.emptyDesc}>
            You haven&apos;t posted any properties. Create your first listing to start receiving leads.
          </p>
          <Link href="/dashboard/post-property" className={common.primaryBtn}>
            <IconPlus />
            Post Your First Property
          </Link>
        </div>
      ) : (
        <div className={styles.propertyGrid}>
          {properties.map((property) => (
            <article key={property.id} className={styles.propertyCard}>
              {property.photos?.[0] ? (
                /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(property.photos[0]) ? (
                  <video
                    src={getUploadUrl(property.photos[0])}
                    className={styles.cardImage}
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={getUploadUrl(property.photos[0])}
                    alt={property.title}
                    className={styles.cardImage}
                  />
                )
              ) : (
                <div className={styles.cardImagePlaceholder}>No photo</div>
              )}

              <div className={styles.cardBody}>
                <span className={`${styles.badge} ${BADGE_CLASS[property.status] || dashStyles.badgePending}`}>
                  {property.statusLabel}
                </span>
                <h2 className={styles.cardTitle}>{property.title}</h2>
                <p className={styles.cardMeta}>{property.meta}</p>
                <p className={styles.cardPrice}>{property.priceDisplay}</p>
                <div className={styles.cardStats}>
                  <span>{property.views} views</span>
                  <span>{property.leads} leads</span>
                </div>

                <div className={styles.cardActions}>
                  <Link
                    href={`/dashboard/my-properties/${property.id}/edit`}
                    className={styles.editBtn}
                  >
                    Edit Details
                  </Link>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    disabled={deletingId === property.id}
                    onClick={() => handleDelete(property.id, property.title)}
                  >
                    {deletingId === property.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
