'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import PrototypeHeader from '../components/prototype/PrototypeHeader';
import PrototypeFooter from '../components/prototype/PrototypeFooter';
import { POSTS } from '../utils/prototypeData';

export default function BlogListingPage() {
  const [selectedCat, setSelectedCat] = useState('all');
  const [query, setQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Articles' },
    { id: 'area-guides', label: 'Dhaka Area Guides' },
    { id: 'renting-tips', label: 'Renting & Tenancy' },
    { id: 'legal', label: 'Legal & Paperwork' },
    { id: 'investment', label: 'Property Investment' },
  ];

  const filteredPosts = useMemo(() => {
    return POSTS.filter((post) => {
      if (selectedCat !== 'all' && post.cat !== selectedCat) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const str = `${post.title} ${post.excerpt || ''} ${(post.tags || []).join(' ')}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [selectedCat, query]);

  return (
    <>
      <PrototypeHeader />

      <div className="phead">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / <span>Blog</span>
          </div>
          <h1>Dhaka Real Estate Insights & Guides</h1>
          <p>Practical sector guides, legal dolil verification advice, and tenancy tips for Dhaka City.</p>
        </div>
      </div>

      <div className="wrap" style={{ padding: '30px 20px 60px' }}>
        {/* CATEGORY CHIPS & SEARCH */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
          <div className="chips">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chip ${selectedCat === c.id ? 'on' : ''}`}
                onClick={() => setSelectedCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search guides (e.g. Uttara, Namjari)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ padding: '8px 14px', fontSize: '13.5px' }}
            />
          </div>
        </div>

        {/* POSTS GRID */}
        {filteredPosts.length > 0 ? (
          <div className="grid2">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="fcard"
                style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', transition: '.2s' }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="tag" style={{ background: '#fff4e5', color: 'var(--orange2)' }}>
                    {post.cat.replace('-', ' ').toUpperCase()}
                  </span>
                  <small style={{ color: 'var(--mut)' }}>{post.read || 5} min read</small>
                  <small style={{ color: 'var(--mut)', marginLeft: 'auto' }}>{post.date}</small>
                </div>

                <h3 style={{ margin: '4px 0 8px', color: 'var(--navy)', fontSize: '18px' }}>
                  {post.title}
                </h3>

                <p style={{ color: 'var(--mut)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px', flex: 1 }}>
                  {post.excerpt}
                </p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                  {(post.tags || []).map((t) => (
                    <span key={t} className="chip" style={{ fontSize: '11.5px', padding: '3px 8px' }}>
                      #{t}
                    </span>
                  ))}
                  <span style={{ marginLeft: 'auto', color: 'var(--orange)', fontWeight: '600', fontSize: '13px' }}>
                    Read article →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No articles found</h3>
            <p>Try clearing your search keyword or switching categories.</p>
          </div>
        )}
      </div>

      <PrototypeFooter />
    </>
  );
}
