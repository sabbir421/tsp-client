'use client';

import { useState } from 'react';
import styles from './filterBar.module.css';

export function filterItems(items = [], filter = {}) {
  const {
    search = '',
    propertyFor = '',
    category = '',
    bedrooms = '',
    maxPrice = '',
  } = filter;

  const searchLower = search.toLowerCase().trim();

  return items.filter((item) => {
    // Text search (title, sector, area, city, location, address, summary, meta)
    if (searchLower) {
      const title = (item.title || item.name || '').toLowerCase();
      const location = [
        item.sector,
        item.area,
        item.city,
        item.address,
        item.location,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const summary = (item.summary || item.description || item.meta || '').toLowerCase();

      if (
        !title.includes(searchLower) &&
        !location.includes(searchLower) &&
        !summary.includes(searchLower)
      ) {
        return false;
      }
    }

    // Property For (Rent / Sale)
    if (propertyFor && propertyFor !== 'all') {
      const forVal = (item.propertyFor || item.purpose || '').toLowerCase();
      if (forVal && !forVal.includes(propertyFor.toLowerCase())) {
        return false;
      }
    }

    // Category / Type
    if (category && category !== 'all') {
      const catVal = (
        item.category ||
        item.categoryLabel ||
        item.propertyType ||
        item.subType ||
        ''
      ).toLowerCase();
      if (catVal && !catVal.includes(category.toLowerCase())) {
        return false;
      }
    }

    // Bedrooms
    if (bedrooms && bedrooms !== 'all') {
      const itemBeds = parseInt(item.bedrooms, 10);
      if (bedrooms === '4+') {
        if (!itemBeds || itemBeds < 4) return false;
      } else {
        const targetBeds = parseInt(bedrooms, 10);
        if (isNaN(itemBeds) || itemBeds !== targetBeds) return false;
      }
    }

    // Max Price / Budget
    if (maxPrice && !isNaN(Number(maxPrice)) && Number(maxPrice) > 0) {
      const itemPrice = Number(
        item.price ||
          item.expectedPrice ||
          item.maxBudget ||
          item.budget ||
          0
      );
      if (itemPrice > 0 && itemPrice > Number(maxPrice)) {
        return false;
      }
    }

    return true;
  });
}

export default function FilterBar({
  onFilterChange,
  placeholder = 'Search by title, location, sector...',
  showPropertyFor = true,
  showCategory = true,
  showBedrooms = true,
  showMaxPrice = true,
}) {
  const [filterState, setFilterState] = useState({
    search: '',
    propertyFor: 'all',
    category: 'all',
    bedrooms: 'all',
    maxPrice: '',
  });

  const handleChange = (field, value) => {
    const updated = { ...filterState, [field]: value };
    setFilterState(updated);
    if (onFilterChange) {
      onFilterChange(updated);
    }
  };

  const handleReset = () => {
    const resetState = {
      search: '',
      propertyFor: 'all',
      category: 'all',
      bedrooms: 'all',
      maxPrice: '',
    };
    setFilterState(resetState);
    if (onFilterChange) {
      onFilterChange(resetState);
    }
  };

  const isFiltered =
    filterState.search ||
    filterState.propertyFor !== 'all' ||
    filterState.category !== 'all' ||
    filterState.bedrooms !== 'all' ||
    filterState.maxPrice !== '';

  return (
    <div className={styles.filterWrap}>
      <div className={styles.searchRow}>
        <div className={styles.searchInputWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={placeholder}
            value={filterState.search}
            onChange={(e) => handleChange('search', e.target.value)}
          />
          {filterState.search && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => handleChange('search', '')}
            >
              ×
            </button>
          )}
        </div>

        {isFiltered && (
          <button type="button" className={styles.resetBtn} onClick={handleReset}>
            Reset Filters ↺
          </button>
        )}
      </div>

      <div className={styles.filterControls}>
        {showPropertyFor && (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Purpose</label>
            <select
              className={styles.selectInput}
              value={filterState.propertyFor}
              onChange={(e) => handleChange('propertyFor', e.target.value)}
            >
              <option value="all">All (Rent & Sale)</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>
          </div>
        )}

        {showCategory && (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Category / Type</label>
            <select
              className={styles.selectInput}
              value={filterState.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment / Flat</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial / Office</option>
              <option value="land">Plot / Land</option>
            </select>
          </div>
        )}

        {showBedrooms && (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Bedrooms</label>
            <select
              className={styles.selectInput}
              value={filterState.bedrooms}
              onChange={(e) => handleChange('bedrooms', e.target.value)}
            >
              <option value="all">Any Beds</option>
              <option value="1">1 Bed</option>
              <option value="2">2 Beds</option>
              <option value="3">3 Beds</option>
              <option value="4+">4+ Beds</option>
            </select>
          </div>
        )}

        {showMaxPrice && (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Max Budget / Price</label>
            <input
              type="number"
              className={styles.numInput}
              placeholder="e.g. 50000"
              value={filterState.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
