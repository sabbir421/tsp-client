'use client';

import styles from './landing.module.css';

export default function RequirementCard({ requirement, onViewDetails, onSuggest }) {
  return (
    <article className={styles.reqCard}>
      <div className={styles.reqCardTop}>
        <span className={styles.reqSector}>{requirement.sector}</span>
        {requirement.isLive && (
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            LIVE
          </span>
        )}
      </div>
      <h3 className={styles.reqTitle}>{requirement.title}</h3>
      <p className={styles.reqBudget}>
        {requirement.budget}
        {requirement.budgetNote && <span style={{ fontSize: '0.85rem', fontWeight: 500 }}> {requirement.budgetNote}</span>}
      </p>
      <div className={styles.reqMeta}>
        <span>Move-in: {requirement.moveIn}</span>
        <span>·</span>
        <span>{requirement.postedAgo}</span>
        <span>·</span>
        <span>{requirement.suggestionsCount} suggestions</span>
      </div>
      <div className={styles.reqFooter}>
        <button type="button" className={styles.btnSecondary} onClick={() => onViewDetails(requirement)}>
          View full details
        </button>
        <button type="button" className={styles.btnPrimary} onClick={() => onSuggest(requirement)}>
          Suggest a property
        </button>
      </div>
    </article>
  );
}
