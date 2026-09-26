'use client';

import { formatPostedAgo } from '../../utils/format';
import styles from './landing.module.css';

export default function RequirementCard({ requirement, onViewDetails, onSuggest }) {
  const postedAgo = formatPostedAgo(requirement.createdAt);
  const sector = requirement.sector || requirement.area || requirement.zone;

  return (
    <article className={styles.reqCard}>
      <div className={styles.reqCardTop}>
        {sector && <span className={styles.reqSector}>{sector}</span>}
        {requirement.isLive && (
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            LIVE
          </span>
        )}
      </div>
      <h3 className={styles.reqTitle}>{requirement.title}</h3>
      <p className={styles.reqBudget}>{requirement.budget || requirement.budgetDisplay}</p>
      <div className={styles.reqMeta}>
        {postedAgo && <span>{postedAgo}</span>}
        <span>·</span>
        <span>{requirement.suggestionsCount || 0} suggestions</span>
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
