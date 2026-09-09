'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { propertyApi, matchApi, getUploadUrl } from '../../utils/api';
import {
  IconPlus,
  IconChevronRight,
  IconHome,
  IconSettings,
  IconHelp,
  IconHeadset,
} from '../layout/icons';
import styles from '../layout/dashboard.module.css';

const BADGE_CLASS = {
  pending: styles.badgePending,
  verified: styles.badgeVerified,
  matched: styles.badgeMatched,
  review: styles.badgeReview,
  interested: styles.badgeInterested,
  siteVisit: styles.badgeSiteVisit,
  sent: styles.badgeMatched,
  viewed: styles.badgeReview,
  declined: styles.badgePending,
};

const DEFAULT_STATS = { total: 0, verified: 0, matched: 0, totalLeads: 0 };

export default function SellerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [requirements, setRequirements] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [propsRes, statsRes, reqRes, matchRes] = await Promise.all([
          propertyApi.getMine(),
          propertyApi.getStats(),
          matchApi.getRequirements().catch(() => ({ data: [] })),
          matchApi.getSellerMatches().catch(() => ({ data: [] })),
        ]);
        setProperties((propsRes.data || []).slice(0, 4));
        setStats(statsRes.data || DEFAULT_STATS);
        setRequirements((reqRes.data || []).slice(0, 3));
        setSuggestions((matchRes.data || []).slice(0, 3));
      } catch {
        setProperties([]);
        setStats(DEFAULT_STATS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Welcome back, {user?.fullName || 'User'}</h1>
          <p className={styles.pageSubtitle}>
            Here&apos;s an overview of your properties, leads, and activity on TrueSpace Property.
          </p>
        </div>
        <Link href="/dashboard/post-property" className={styles.primaryBtn}>
          <IconPlus />
          Post New Property
        </Link>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>My Properties</div>
          <div className={`${styles.statValue} ${styles.statValueOrange}`}>
            {stats.total} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Total</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Verified</div>
          <div className={`${styles.statValue} ${styles.statValueGreen}`}>
            {stats.verified} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Properties</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Matched</div>
          <div className={`${styles.statValue} ${styles.statValueOrange}`}>
            {stats.matched} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Properties</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Leads</div>
          <div className={`${styles.statValue} ${styles.statValueOrange}`}>
            {stats.totalLeads} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>This Month</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>My Properties</h2>
          <Link href="/dashboard/my-properties" className={styles.cardLink}>
            View All <IconChevronRight />
          </Link>
        </div>
        <div className={styles.cardBody}>
          {loading ? (
            <p style={{ padding: '20px 22px', color: 'var(--text-muted)' }}>Loading properties...</p>
          ) : properties.length === 0 ? (
            <p style={{ padding: '20px 22px', color: 'var(--text-muted)' }}>
              No properties yet.{' '}
              <Link href="/dashboard/post-property">Post your first property</Link>
            </p>
          ) : (
            <table className={styles.propertiesTable}>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Leads</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id}>
                    <td>
                      <div className={styles.propertyInfo}>
                        {property.photos?.[0] ? (
                          /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(property.photos[0]) ? (
                            <video
                              src={getUploadUrl(property.photos[0])}
                              className={styles.propertyThumb}
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={getUploadUrl(property.photos[0])}
                              alt=""
                              className={styles.propertyThumb}
                            />
                          )
                        ) : (
                          <div className={styles.propertyThumb} style={{ background: '#dbeafe' }} aria-hidden="true" />
                        )}
                        <div>
                          <div className={styles.propertyTitle}>{property.title}</div>
                          <div className={styles.propertyMeta}>{property.meta}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.propertyPrice}>{property.priceDisplay}</span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${BADGE_CLASS[property.status]}`}>
                        {property.statusLabel}
                      </span>
                    </td>
                    <td>
                      <span className={styles.statNum}>{property.views}</span>
                    </td>
                    <td>
                      <span className={styles.statNum}>{property.leads}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className={styles.cardFooter}>
          <Link href="/dashboard/my-properties" className={styles.cardFooterLink}>View All Properties</Link>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Buyer Requirements</h2>
            <Link href="/dashboard/buyer-requirements" className={styles.cardLink}>
              View All <IconChevronRight />
            </Link>
          </div>
          <ul className={styles.widgetList}>
            {requirements.length === 0 ? (
              <li className={styles.widgetItem}>
                <div className={styles.widgetItemContent}>
                  <div className={styles.widgetItemMeta}>No active buyer requirements yet.</div>
                </div>
              </li>
            ) : (
              requirements.map((item) => (
                <li key={item.id} className={styles.widgetItem}>
                  <div className={styles.widgetItemContent}>
                    <div className={styles.widgetItemTitle}>{item.title}</div>
                    <div className={styles.widgetItemMeta}>Budget: {item.budgetDisplay}</div>
                  </div>
                  {item.isNew && <span className={`${styles.badge} ${styles.badgeNew}`}>New</span>}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Submitted Suggestions</h2>
            <Link href="/dashboard/submitted-suggestions" className={styles.cardLink}>
              View All <IconChevronRight />
            </Link>
          </div>
          <ul className={styles.widgetList}>
            {suggestions.length === 0 ? (
              <li className={styles.widgetItem}>
                <div className={styles.widgetItemContent}>
                  <div className={styles.widgetItemMeta}>No suggestions sent yet.</div>
                </div>
              </li>
            ) : (
              suggestions.map((item) => (
                <li key={item.id} className={styles.widgetItem}>
                  <div className={styles.widgetItemContent}>
                    <div className={styles.widgetItemTitle}>{item.title}</div>
                  </div>
                  <span className={`${styles.badge} ${BADGE_CLASS[item.status] || styles.badgeMatched}`}>
                    {item.statusLabel}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Leads Shared by TSP</h2>
          </div>
          <p className={styles.widgetEmpty}>No leads shared yet. Coming soon.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Site Visits</h2>
            <Link href="/dashboard/site-visits" className={styles.cardLink}>
              View All <IconChevronRight />
            </Link>
          </div>
          <p className={styles.widgetEmpty}>Accepted buyer matches will appear in your site visits list.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Payments / Plans</h2>
          </div>
          <p className={styles.widgetEmpty}>Plan details will appear here soon.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Quick Actions</h2>
          </div>
          <div className={styles.quickActions}>
            <Link href="/dashboard/post-property" className={styles.quickAction}>
              <div className={styles.quickActionIcon}><IconHome /></div>
              <span className={styles.quickActionLabel}>Post Property</span>
            </Link>
            <Link href="/dashboard/buyer-requirements" className={styles.quickAction}>
              <div className={styles.quickActionIcon}><IconHelp /></div>
              <span className={styles.quickActionLabel}>Buyer Requirements</span>
            </Link>
            <Link href="/dashboard/my-properties" className={styles.quickAction}>
              <div className={styles.quickActionIcon}><IconSettings /></div>
              <span className={styles.quickActionLabel}>My Properties</span>
            </Link>
            <Link href="/dashboard/submitted-suggestions" className={styles.quickAction}>
              <div className={styles.quickActionIcon}><IconHelp /></div>
              <span className={styles.quickActionLabel}>My Suggestions</span>
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.supportBanner}>
        <div className={styles.supportContent}>
          <h3 className={styles.supportTitle}>Need help or have questions?</h3>
          <p className={styles.supportDesc}>
            Our support team is here to help you manage your listings, connect with buyers, and grow your business on TrueSpace Property.
          </p>
          <button type="button" className={styles.supportBtn}>Contact Support</button>
        </div>
        <div className={styles.supportVisual} aria-hidden="true">
          <IconHeadset />
        </div>
      </div>
    </>
  );
}
