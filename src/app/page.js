'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { USER_ROLES } from './constants';
import LandingHeader from './components/landing/LandingHeader';
import LandingFooter from './components/landing/LandingFooter';
import PropertyCard from './components/landing/PropertyCard';
import RequirementCard from './components/landing/RequirementCard';
import RequirementDetailModal from './components/landing/RequirementDetailModal';
import {
  IconWrite,
  IconMessage,
  IconEye,
  IconUnlock,
  IconLock,
  IconCoin,
  IconCity,
} from './components/landing/LandingIcons';
import { openPortalWindow } from './utils/navigation';
import { hasPortalToken } from './utils/authStorage';
import { propertyApi, requirementApi } from './utils/api';
import { formatPostedAgo, formatTaka, isBachelorListing } from './utils/format';
import PublicPageShell from './components/PublicPageShell';
import styles from './components/landing/landing.module.css';

const HOW_STEPS = [
  { Icon: IconWrite, title: 'Post requirement', desc: 'Tell us what you need. Stay anonymous until you choose.' },
  { Icon: IconMessage, title: 'Owners answer', desc: 'Sellers and agents send matching properties to your requirement.' },
  { Icon: IconEye, title: 'Pick & request visit', desc: 'Review matches, see full details, and request a site visit.' },
  { Icon: IconUnlock, title: 'Contact unlocks', desc: 'After you accept a match, owner contact details become available.' },
];

const TRUST_ITEMS = [
  { Icon: IconLock, title: 'Your number stays yours', desc: 'Contact info stays hidden until you choose to unlock it after accepting a match.' },
  { Icon: IconCoin, title: 'No commission, no middleman', desc: 'TrueSpace connects buyers and owners directly — zero commission during the pilot.' },
  { Icon: IconCity, title: 'Built for how Dhaka works', desc: 'Sector-based search, bachelor feeds, and requirements-first matching for local needs.' },
];

export default function Home() {
  const router = useRouter();
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [properties, setProperties] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  const goBuyer = (path) => openPortalWindow(path, USER_ROLES.BUYER_TENANT);
  const goSeller = (path) => openPortalWindow(path, USER_ROLES.SELLER_AGENT);

  useEffect(() => {
    const load = async () => {
      try {
        const [propRes, reqRes] = await Promise.all([
          propertyApi.getPublic(),
          requirementApi.getPublic(),
        ]);
        setProperties(propRes.data || []);
        setRequirements(reqRes.data || []);
      } catch {
        setProperties([]);
        setRequirements([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleOwnerDetails = (property) => {
    if (hasPortalToken(USER_ROLES.BUYER_TENANT)) {
      router.push(`/browse/properties/${property.id}`);
    } else {
      openPortalWindow(`/browse/properties/${property.id}`, USER_ROLES.BUYER_TENANT);
    }
  };

  const featuredReq = requirements[0];
  const previewProperties = properties.slice(0, 3);
  const previewRequirements = requirements.slice(0, 3);
  const bachelorListings = [...properties, ...requirements].filter(isBachelorListing).slice(0, 3);

  return (
    <PublicPageShell className={styles.site}>
      <LandingHeader />

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <h1 className={styles.heroTitle}>
                Stop scrolling listings. Post what you need — let the market answer.
              </h1>
              <p className={styles.heroSub}>
                TrueSpace connects buyers and property owners in Dhaka through requirement-first matching.
                No spam, no noise — just relevant properties sent to you.
              </p>
              <div className={styles.heroBtns}>
                <button type="button" className={styles.pillBtn} onClick={() => goBuyer('/dashboard/my-requirements?create=1')}>
                  Post a requirement – free
                </button>
                <Link href="/browse/properties" className={styles.pillBtnOutline}>
                  Browse properties
                </Link>
              </div>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>{loading ? '—' : properties.length}</span>
                  <span className={styles.heroStatLabel}>Listed properties</span>
                </div>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>{loading ? '—' : requirements.length}</span>
                  <span className={styles.heroStatLabel}>Active requirements</span>
                </div>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>0%</span>
                  <span className={styles.heroStatLabel}>Commission during pilot</span>
                </div>
              </div>
            </div>

            <div className={styles.heroPreview}>
              <p className={styles.previewLabel}>Live Requirement</p>
              {featuredReq ? (
                <>
                  <div className={styles.liveCard}>
                    <div className={styles.liveCardTop}>
                      <span className={styles.liveBadge}><span className={styles.liveDot} />LIVE</span>
                      <span className={styles.liveCardMeta}>{formatPostedAgo(featuredReq.createdAt)}</span>
                    </div>
                    <p className={styles.liveCardTitle}>
                      {[featuredReq.sector, featuredReq.title].filter(Boolean).join(' · ')}
                    </p>
                    <p className={styles.liveCardMeta}>{featuredReq.budget || featuredReq.budgetDisplay}</p>
                  </div>
                  {previewProperties.length > 0 && (
                    <div className={styles.suggestionList}>
                      {previewProperties.map((p) => (
                        <div key={p.id} className={styles.suggestionItem}>
                          <span>{p.title}</span>
                          <span className={styles.suggestionMatch}>{formatTaka(p.priceDisplay)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.liveCard}>
                  <p className={styles.liveCardTitle}>No live requirements yet</p>
                  <p className={styles.liveCardMeta}>New buyer requests will appear here from the database.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Four steps. You stay anonymous for three of them.</h2>
            </div>
          </div>
          <div className={styles.stepsGrid}>
            {HOW_STEPS.map((step, i) => {
              const StepIcon = step.Icon;
              return (
                <article key={step.title} className={styles.stepCard}>
                  <div className={styles.stepIcon}>
                    <StepIcon />
                  </div>
                  <p className={styles.stepNum}>STEP {i + 1}</p>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>People looking right now</h2>
              <p className={styles.sectionSub}>Own or manage a property? Answer one of these live requirements.</p>
            </div>
            <Link href="/browse/requirements" className={styles.seeAllLink}>
              See all requirements →
            </Link>
          </div>
          {previewRequirements.length === 0 ? (
            <div className={styles.emptyState}>No requirements posted yet.</div>
          ) : (
            <div className={styles.reqGrid}>
              {previewRequirements.map((req) => (
                <RequirementCard
                  key={req.id}
                  requirement={req}
                  onViewDetails={setSelectedRequirement}
                  onSuggest={(r) => goSeller(`/dashboard/buyer-requirements?requirementId=${r.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Available Property</h2>
            </div>
            <Link href="/browse/properties" className={styles.seeAllLink}>
              See all properties →
            </Link>
          </div>
          {previewProperties.length === 0 ? (
            <div className={styles.emptyState}>No properties listed yet.</div>
          ) : (
            <div className={styles.propGrid}>
              {previewProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onViewDetails={(p) => router.push(`/browse/properties/${p.id}`)}
                  onOwnerDetails={handleOwnerDetails}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="bachelor" className={styles.sectionPeach}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Seats, single rooms and mess listings — in their own feed.</h2>
            </div>
            <button type="button" className={styles.pillBtnDark} onClick={() => goBuyer('/dashboard/my-requirements?create=1')}>
              Open Bachelor Feed
            </button>
          </div>
          {bachelorListings.length === 0 ? (
            <div className={styles.emptyState}>No bachelor listings yet.</div>
          ) : (
            <div className={styles.reqGrid}>
              {bachelorListings.map((item) => (
                <article key={`${item.title}-${item.id}`} className={styles.reqCard}>
                  <h3 className={styles.reqTitle}>{item.title}</h3>
                  <p className={styles.reqBudget}>{item.budget || item.budgetDisplay || formatTaka(item.priceDisplay)}</p>
                  <p className={styles.reqMeta}>{item.summary || item.meta || [item.sector, item.area, item.city].filter(Boolean).join(', ')}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.trustGrid}>
            {TRUST_ITEMS.map((item) => {
              const TrustIcon = item.Icon;
              return (
                <div key={item.title} className={styles.trustItem}>
                  <div className={styles.trustIcon}>
                    <TrustIcon />
                  </div>
                  <h3 className={styles.trustTitle}>{item.title}</h3>
                  <p className={styles.trustDesc}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.ctaBar}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Tell us what you need. Free during the Uttara pilot.</h2>
          <div className={styles.ctaBtns}>
            <button type="button" className={styles.pillBtnDark} onClick={() => goBuyer('/dashboard/my-requirements?create=1')}>
              Post a requirement
            </button>
            <button type="button" className={styles.pillBtnOutline} onClick={() => goSeller('/dashboard/post-property')}>
              List a property
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />

      {selectedRequirement && (
        <RequirementDetailModal requirement={selectedRequirement} onClose={() => setSelectedRequirement(null)} />
      )}
    </PublicPageShell>
  );
}
