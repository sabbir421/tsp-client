'use client';

import { useEffect, useState } from 'react';
import { matchApi } from '../../utils/api';
import common from './pageCommon.module.css';
import styles from './buyerRequirements.module.css';

const BADGE_CLASS = {
  sent: styles.badgeSent,
  viewed: styles.badgeViewed,
  interested: styles.badgeInterested,
  declined: styles.badgeDeclined,
};

export default function SubmittedSuggestionsPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const res = await matchApi.getSellerMatches();
        setMatches(res.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className={common.loading}>
        <div className={common.spinner} />
        Loading your suggestions...
      </div>
    );
  }

  return (
    <div>
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>Submitted Suggestions</h1>
          <p className={common.pageSubtitle}>
            Property matches you have sent to buyers based on their requirements.
          </p>
        </div>
      </div>

      {error && <div className={common.error}>{error}</div>}

      {matches.length === 0 ? (
        <div className={common.emptyState}>
          <div className={common.emptyIcon}>📋</div>
          <h2 className={common.emptyTitle}>No suggestions yet</h2>
          <p className={common.emptyDesc}>
            Browse buyer requirements and send matching properties to get started.
          </p>
        </div>
      ) : (
        <div className={styles.requirementList}>
          {matches.map((match) => (
            <article key={match.id} className={styles.suggestionItem}>
              <div>
                <h2 className={styles.suggestionTitle}>{match.title}</h2>
                <p className={styles.suggestionMeta}>
                  {match.matchScore}% match · {new Date(match.createdAt).toLocaleDateString('en-BD')}
                </p>
              </div>
              <span className={`${styles.badge} ${BADGE_CLASS[match.status] || styles.badgeSent}`}>
                {match.statusLabel}
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
