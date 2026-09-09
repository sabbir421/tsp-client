'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { IconChevronRight } from '../layout/icons';
import { IconShield, IconNoSpam, IconClock } from '../layout/buyerIcons';
import { matchApi, requirementApi, getUploadUrl } from '../../utils/api';
import layoutStyles from '../layout/dashboard.module.css';
import styles from './buyerDashboard.module.css';

function ProgressRing({ percent }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={styles.progressRing}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle className={styles.progressRingBg} cx="60" cy="60" r={radius} />
        <circle
          className={styles.progressRingFill}
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.progressPercent}>{percent}%</div>
    </div>
  );
}

function computeSearchProgress(requirements, matchCount) {
  if (!requirements.length) return 15;
  let score = 40;
  const latest = requirements[0];
  if (latest?.zone || latest?.area) score += 15;
  if (latest?.maxBudget) score += 15;
  if (latest?.sizeSqFt) score += 10;
  if (matchCount > 0) score += 20;
  return Math.min(100, score);
}

function formatBudget(amount) {
  const num = Number(amount);
  if (!amount || Number.isNaN(num)) return '—';
  if (num >= 10000000) return `৳ ${(num / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (num >= 100000) return `৳ ${(num / 100000).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `৳ ${num.toLocaleString('en-BD')}`;
}

export default function BuyerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const firstName = user?.fullName?.split(' ')[0] || 'User';
  const [matchedProperties, setMatchedProperties] = useState([]);
  const [matchStats, setMatchStats] = useState({ total: 0, newMatches: 0 });
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [matchRes, statsRes, reqRes] = await Promise.all([
          matchApi.getBuyerMatches(),
          matchApi.getBuyerStats(),
          requirementApi.getMine(),
        ]);
        setMatchedProperties((matchRes.data || []).slice(0, 4));
        setMatchStats(statsRes.data || { total: 0, newMatches: 0 });
        setRequirements(reqRes.data || []);
      } catch {
        setMatchedProperties([]);
        setMatchStats({ total: 0, newMatches: 0 });
        setRequirements([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const latestReq = requirements[0] || null;
  const activeCount = requirements.filter((r) => r.status === 'active').length;
  const searchProgress = computeSearchProgress(requirements, matchStats.total);
  const preferredLocation = latestReq
    ? [latestReq.area, latestReq.zone, latestReq.city].filter(Boolean).join(', ')
    : '—';

  return (
    <>
      <div className={layoutStyles.pageHeader}>
        <div>
          <h1 className={layoutStyles.pageTitle}>Welcome back, {firstName}!</h1>
          <p className={layoutStyles.pageSubtitle}>
            Here&apos;s what&apos;s happening with your home search.
          </p>
        </div>
        <Link href="/dashboard/my-requirements?create=1" className={layoutStyles.primaryBtn}>
          Create Requirement
        </Link>
      </div>

      <div className={styles.topRow}>
        <div className={styles.profileCard}>
          <div className={styles.profileCardHeader}>
            <h2 className={styles.profileCardTitle}>Profile Summary</h2>
            <Link href="/dashboard/profile" className={styles.editLink}>
              Manage Profile
            </Link>
          </div>
          <div className={styles.profileGrid}>
            <div className={styles.profileField}>
              <span className={styles.profileLabel}>Name</span>
              <span className={styles.profileValue}>{user?.fullName || '—'}</span>
            </div>
            <div className={styles.profileField}>
              <span className={styles.profileLabel}>Email</span>
              <span className={styles.profileValue}>{user?.email || '—'}</span>
            </div>
            <div className={styles.profileField}>
              <span className={styles.profileLabel}>Phone</span>
              <span className={styles.profileValue}>
                {user?.phone ? `${user.countryCode || ''} ${user.phone}`.trim() : '—'}
              </span>
            </div>
            <div className={styles.profileField}>
              <span className={styles.profileLabel}>Preferred Location</span>
              <span className={styles.profileValue}>{preferredLocation}</span>
            </div>
            <div className={styles.profileField}>
              <span className={styles.profileLabel}>Budget</span>
              <span className={styles.profileValue}>
                {latestReq ? formatBudget(latestReq.maxBudget) : '—'}
              </span>
            </div>
            <div className={styles.profileField}>
              <span className={styles.profileLabel}>Property Type</span>
              <span className={styles.profileValue}>{latestReq?.subType || '—'}</span>
            </div>
            <div className={styles.profileField}>
              <span className={styles.profileLabel}>Category</span>
              <span className={styles.profileValue}>
                {latestReq
                  ? latestReq.category === 'residential'
                    ? 'Residential'
                    : 'Commercial'
                  : '—'}
              </span>
            </div>
            <div className={styles.profileField}>
              <span className={styles.profileLabel}>Bedrooms</span>
              <span className={styles.profileValue}>
                {latestReq?.bedrooms ? `${latestReq.bedrooms} Bed` : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.progressCard}>
          <h2 className={styles.profileCardTitle} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
            Search Progress
          </h2>
          <ProgressRing percent={searchProgress} />
          <p className={styles.progressText}>
            {requirements.length === 0
              ? 'Create a requirement to start your property search.'
              : matchStats.total > 0
                ? 'Sellers are matching properties to your requirements.'
                : 'Your requirement is live. Waiting for seller matches.'}
          </p>
          <Link href="/dashboard/my-requirements" className={styles.refineBtn}>
            {requirements.length === 0 ? 'Add Requirement' : 'View Requirements'}
          </Link>
        </div>
      </div>

      <div className={styles.buyerStatsRow}>
        <div className={styles.buyerStatCard}>
          <span className={styles.buyerStatLabel}>Matched Properties</span>
          <span className={styles.buyerStatValue}>{matchStats.total}</span>
          <span className={`${styles.statBadge} ${styles.statBadgeGreen}`}>
            {matchStats.newMatches > 0 ? `${matchStats.newMatches} New` : 'Total'}
          </span>
        </div>
        <div className={styles.buyerStatCard}>
          <span className={styles.buyerStatLabel}>My Requirements</span>
          <span className={styles.buyerStatValue}>{requirements.length}</span>
          <span className={`${styles.statBadge} ${styles.statBadgeBlue}`}>
            {activeCount} Active
          </span>
        </div>
        <div className={styles.buyerStatCard}>
          <span className={styles.buyerStatLabel}>Active Searches</span>
          <span className={styles.buyerStatValue}>{activeCount}</span>
          <span className={`${styles.statBadge} ${styles.statBadgeOrange}`}>
            Looking for matches
          </span>
        </div>
        <div className={styles.buyerStatCard}>
          <span className={styles.buyerStatLabel}>Search Progress</span>
          <span className={styles.buyerStatValue}>{searchProgress}%</span>
          <span className={`${styles.statBadge} ${styles.statBadgeGreen}`}>
            Complete
          </span>
        </div>
      </div>

      <div className={styles.propertiesSection}>
        <div className={styles.propertiesSectionHeader}>
          <h2 className={styles.propertiesSectionTitle}>Latest Matched Properties</h2>
          <Link href="/dashboard/matched-properties" className={layoutStyles.cardLink}>
            View All <IconChevronRight />
          </Link>
        </div>
        <div className={styles.propertiesGrid}>
          {loading ? (
            <p className={styles.emptyMessage}>Loading matches...</p>
          ) : matchedProperties.length === 0 ? (
            <p className={styles.emptyMessage}>
              No matched properties yet.{' '}
              <Link href="/dashboard/my-requirements">Create a requirement</Link> to get matches.
            </p>
          ) : (
            matchedProperties.map((property) => (
              <div key={property.id} className={styles.propertyCard}>
                <div className={styles.propertyImageWrap}>
                  {property.image ? (
                    <img
                      src={getUploadUrl(property.image)}
                      alt=""
                      className={styles.propertyImage}
                    />
                  ) : (
                    <div className={styles.propertyImagePlaceholder}>No photo</div>
                  )}
                  <span
                    className={`${styles.propertyStatusBadge} ${
                      property.property?.status === 'verified'
                        ? styles.propertyStatusVerified
                        : styles.propertyStatusPending
                    }`}
                  >
                    {property.statusLabel}
                  </span>
                </div>
                <div className={styles.propertyCardBody}>
                  <div className={styles.propertyPrice}>{property.price}</div>
                  <div className={styles.propertyTitle}>{property.title}</div>
                  <div className={styles.propertyDetails}>{property.details || '—'}</div>
                  <div className={styles.matchScore}>
                    <div className={styles.matchBar}>
                      <div
                        className={styles.matchBarFill}
                        style={{ width: `${property.matchScore}%` }}
                      />
                    </div>
                    <span className={styles.matchLabel}>{property.matchScore}% Match</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.bottomTwoCol}>
        <div className={layoutStyles.card}>
          <div className={layoutStyles.cardHeader}>
            <h2 className={layoutStyles.cardTitle}>My Requirements</h2>
            <Link href="/dashboard/my-requirements" className={layoutStyles.cardLink}>
              View All <IconChevronRight />
            </Link>
          </div>
          <div>
            {requirements.length === 0 ? (
              <p className={styles.widgetEmpty}>
                No requirements yet.{' '}
                <Link href="/dashboard/my-requirements?create=1">Create one</Link>
              </p>
            ) : (
              requirements.slice(0, 4).map((req) => (
                <div key={req.id} className={styles.reqListItem}>
                  <div className={styles.reqInfo}>
                    <div className={styles.reqTitle}>{req.title}</div>
                    <div className={styles.reqMeta}>
                      {req.budgetDisplay} · {req.summary}
                    </div>
                  </div>
                  <span
                    className={`${layoutStyles.badge} ${
                      req.status === 'active'
                        ? styles.reqStatusActive
                        : req.status === 'matched'
                          ? styles.reqStatusMatched
                          : styles.reqStatusClosed
                    }`}
                  >
                    {req.statusLabel}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={layoutStyles.card}>
          <div className={layoutStyles.cardHeader}>
            <h2 className={layoutStyles.cardTitle}>Recent Matches</h2>
            <Link href="/dashboard/matched-properties" className={layoutStyles.cardLink}>
              View All <IconChevronRight />
            </Link>
          </div>
          <div>
            {matchedProperties.length === 0 ? (
              <p className={styles.widgetEmpty}>
                Matches from sellers will appear here once they send suggestions.
              </p>
            ) : (
              matchedProperties.slice(0, 4).map((match) => (
                <div key={match.id} className={styles.reqListItem}>
                  <div className={styles.reqInfo}>
                    <div className={styles.reqTitle}>{match.title}</div>
                    <div className={styles.reqMeta}>
                      {match.price} · {match.matchScore}% match
                    </div>
                  </div>
                  <span className={`${layoutStyles.badge} ${styles.reqStatusMatched}`}>
                    {match.statusLabel}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={styles.featureBar}>
        <div className={styles.featureItem}>
          <IconShield />
          Verified. Relevant. Reliable.
        </div>
        <div className={styles.featureItem}>
          <IconNoSpam />
          No Spam. No Noise.
        </div>
        <div className={styles.featureItem}>
          <IconClock />
          Save Time &amp; Effort.
        </div>
      </div>
    </>
  );
}
