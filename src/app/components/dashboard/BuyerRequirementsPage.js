'use client';

import { useEffect, useState } from 'react';
import { matchApi, propertyApi } from '../../utils/api';
import FilterBar, { filterItems } from '../common/FilterBar';
import common from './pageCommon.module.css';
import styles from './buyerRequirements.module.css';

export default function BuyerRequirementsPage() {
  const [requirements, setRequirements] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  const [propertyId, setPropertyId] = useState('');
  const [sellerNote, setSellerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const [reqRes, propRes] = await Promise.all([
          matchApi.getRequirements(),
          propertyApi.getMine(),
        ]);
        setRequirements(reqRes.data || []);
        setProperties(propRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredRequirements = filterItems(requirements, filter);

  const openMatchModal = (req) => {
    setSelectedReq(req);
    setPropertyId(properties[0]?.id?.toString() || '');
    setSellerNote('');
    setSubmitError('');
  };

  const closeModal = () => {
    setSelectedReq(null);
    setSubmitError('');
  };

  const handleSendMatch = async (e) => {
    e.preventDefault();
    if (!propertyId) {
      setSubmitError('Please select a property to match');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await matchApi.send({
        requirementId: selectedReq.id,
        propertyId: Number(propertyId),
        sellerNote: sellerNote.trim() || undefined,
      });
      setRequirements((prev) =>
        prev.map((req) =>
          req.id === selectedReq.id ? { ...req, alreadyMatched: true } : req
        )
      );
      closeModal();
      alert('Match sent successfully! The buyer will see it in their portal.');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={common.loading}>
        <div className={common.spinner} />
        Loading buyer requirements...
      </div>
    );
  }

  return (
    <div>
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>Buyer Requirements</h1>
          <p className={common.pageSubtitle}>
            Browse active buyer requirements and send matching properties from your listings.
          </p>
        </div>
      </div>

      <FilterBar
        onFilterChange={setFilter}
        placeholder="Filter buyer requirements by title, sector, area..."
      />

      {error && <div className={common.error}>{error}</div>}

      {filteredRequirements.length === 0 ? (
        <div className={common.emptyState}>
          <div className={common.emptyIcon}>📝</div>
          <h2 className={common.emptyTitle}>
            {requirements.length === 0 ? 'No active requirements' : 'No requirements match your filter'}
          </h2>
          <p className={common.emptyDesc}>
            {requirements.length === 0
              ? 'When buyers post requirements, they will appear here for you to match.'
              : 'Try adjusting your filter choices.'}
          </p>
        </div>
      ) : (
        <div className={styles.requirementList}>
          {filteredRequirements.map((req) => (
            <article key={req.id} className={styles.requirementItem}>
              <div className={styles.itemMain}>
                <h2 className={styles.itemTitle}>{req.title}</h2>
                <p className={styles.itemMeta}>{req.summary}</p>
                <p className={styles.itemBudget}>Budget: {req.budgetDisplay}</p>
                <div className={styles.itemTags}>
                  <span className={`${styles.tag} ${styles.tagCategory}`}>{req.categoryLabel}</span>
                  {req.subType && <span className={styles.tag}>{req.subType}</span>}
                  {req.bedrooms && <span className={styles.tag}>{req.bedrooms} Bed</span>}
                  {req.sizeSqFt && <span className={styles.tag}>{req.sizeSqFt} sft</span>}
                  {req.area && <span className={styles.tag}>Sector: {req.area}</span>}
                  {req.isNew && <span className={`${styles.tag} ${styles.tagNew}`}>New</span>}
                </div>
              </div>
              <div className={styles.itemActions}>
                {req.alreadyMatched ? (
                  <button type="button" className={styles.matchedBtn} disabled>
                    Already Sent
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.matchBtn}
                    disabled={properties.length === 0}
                    onClick={() => openMatchModal(req)}
                    title={properties.length === 0 ? 'Post a property first' : 'Send a matching property'}
                  >
                    Send Match
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedReq && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Send Property Match</h3>
              <p className={styles.modalSubtitle}>{selectedReq.title}</p>
            </div>
            <form onSubmit={handleSendMatch}>
              <div className={styles.modalBody}>
                {submitError && <div className={styles.error}>{submitError}</div>}

                {properties.length === 0 ? (
                  <p className={styles.itemMeta}>You need to post a property before sending a match.</p>
                ) : (
                  <>
                    <div>
                      <label className={styles.fieldLabel} htmlFor="propertyId">
                        Select your property
                      </label>
                      <select
                        id="propertyId"
                        className={styles.select}
                        value={propertyId}
                        onChange={(e) => setPropertyId(e.target.value)}
                        required
                      >
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} — {p.priceDisplay}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={styles.fieldLabel} htmlFor="sellerNote">
                        Note to buyer (optional)
                      </label>
                      <textarea
                        id="sellerNote"
                        className={styles.textarea}
                        placeholder="Why this property is a good match..."
                        value={sellerNote}
                        onChange={(e) => setSellerNote(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting || properties.length === 0}
                >
                  {submitting ? 'Sending…' : 'Send Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
