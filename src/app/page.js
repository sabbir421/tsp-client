'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { USER_ROLES } from './constants';
import { PUBLIC_PROPERTIES, PUBLIC_REQUIREMENTS, BACHELOR_LISTINGS } from './data/publicListings';
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

  const goBuyer = (path) => openPortalWindow(path, USER_ROLES.BUYER_TENANT);
  const goSeller = (path) => openPortalWindow(path, USER_ROLES.SELLER_AGENT);

  const handleOwnerDetails = (property) => {
    if (hasPortalToken(USER_ROLES.BUYER_TENANT)) {
      router.push(`/browse/properties/${property.id}`);
    } else {
      openPortalWindow(`/browse/properties/${property.id}`, USER_ROLES.BUYER_TENANT);
    }
  };

  const featuredReq = PUBLIC_REQUIREMENTS[0];

  return (
    <PublicPageShell className={styles.site}>
      <LandingHeader />

      {/* Hero */}
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
                  <span className={styles.heroStatValue}>0% Commission</span>
                  <span className={styles.heroStatLabel}>During Uttara pilot</span>
                </div>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>48h</span>
                  <span className={styles.heroStatLabel}>Typical first match</span>
                </div>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>14 sectors</span>
                  <span className={styles.heroStatLabel}>Uttara covered</span>
                </div>
              </div>
            </div>

            <div className={styles.heroPreview}>
              <p className={styles.previewLabel}>Live Requirement</p>
              <div className={styles.liveCard}>
                <div className={styles.liveCardTop}>
                  <span className={styles.liveBadge}><span className={styles.liveDot} />LIVE</span>
                  <span className={styles.liveCardMeta}>{featuredReq.postedAgo}</span>
                </div>
                <p className={styles.liveCardTitle}>{featuredReq.sector} · {featuredReq.title}</p>
                <p className={styles.liveCardMeta}>{featuredReq.budget}{featuredReq.budgetNote}</p>
              </div>
              <div className={styles.suggestionList}>
                {PUBLIC_PROPERTIES.slice(0, 3).map((p, i) => (
                  <div key={p.id} className={styles.suggestionItem}>
                    <span>{p.title}</span>
                    <span className={styles.suggestionMatch}>{90 - i * 5}% match</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
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

      {/* Requirements preview */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>People looking right now</h2>
              <p className={styles.sectionSub}>Own or manage a property in Uttara? Answer one of these.</p>
            </div>
            <Link href="/browse/requirements" className={styles.seeAllLink}>
              See all requirements →
            </Link>
          </div>
          <div className={styles.reqGrid}>
            {PUBLIC_REQUIREMENTS.slice(0, 3).map((req) => (
              <RequirementCard
                key={req.id}
                requirement={req}
                onViewDetails={setSelectedRequirement}
                onSuggest={(r) => goSeller(`/dashboard/buyer-requirements?requirementId=${r.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Properties preview */}
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
          <div className={styles.propGrid}>
            {PUBLIC_PROPERTIES.slice(0, 3).map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onViewDetails={(p) => router.push(`/browse/properties/${p.id}`)}
                onOwnerDetails={handleOwnerDetails}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bachelor feed */}
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
          <div className={styles.reqGrid}>
            {BACHELOR_LISTINGS.map((item) => (
              <article key={item.id} className={styles.reqCard}>
                <h3 className={styles.reqTitle}>{item.title}</h3>
                <p className={styles.reqBudget}>{item.price}</p>
                <p className={styles.reqMeta}>{item.meta}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
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

      {/* CTA */}
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
