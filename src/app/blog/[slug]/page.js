'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PrototypeHeader from '../../components/prototype/PrototypeHeader';
import PrototypeFooter from '../../components/prototype/PrototypeFooter';
import { POSTS } from '../../utils/prototypeData';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug;

  const post = useMemo(() => {
    return POSTS.find((p) => p.slug === slug) || null;
  }, [slug]);

  const related = useMemo(() => {
    if (!post) return [];
    return POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);
  }, [post]);

  if (!post) {
    return (
      <>
        <PrototypeHeader />
        <div className="wrap" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '50vh' }}>
          <h2>Article not found</h2>
          <p style={{ color: 'var(--mut)', marginTop: '8px' }}>The requested blog post does not exist or has been removed.</p>
          <Link href="/blog" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
            Back to Blog →
          </Link>
        </div>
        <PrototypeFooter />
      </>
    );
  }

  return (
    <>
      <PrototypeHeader />

      <div className="phead">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / <span>{post.title}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
            <span className="tag" style={{ background: '#fff4e5', color: 'var(--orange2)' }}>
              {post.cat.replace('-', ' ').toUpperCase()}
            </span>
            <span style={{ color: 'var(--mut)', fontSize: '13px' }}>{post.date}</span>
            <span style={{ color: 'var(--mut)', fontSize: '13px' }}>· {post.read || 5} min read</span>
            <span style={{ color: 'var(--mut)', fontSize: '13px' }}>· {post.v || 2100} views</span>
          </div>
          <h1 style={{ marginTop: '10px' }}>{post.title}</h1>
        </div>
      </div>

      <div className="wrap" style={{ padding: '36px 20px 60px', maxWidth: '840px' }}>
        <article className="fcard" style={{ padding: '36px', fontSize: '16px', lineHeight: '1.8' }}>
          <p style={{ fontSize: '18px', color: 'var(--navy)', fontWeight: '500', lineHeight: '1.6', marginBottom: '24px' }}>
            {post.excerpt}
          </p>

          <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '24px 0' }} />

          <h3 style={{ color: 'var(--navy)' }}>Key Factors to Consider</h3>
          <p>
            When evaluating residential sectors in Dhaka, connectivity, water logging resilience, utility line availability (especially approved pipeline gas vs LPG cylinder connections), and emergency access are paramount.
          </p>

          <h3 style={{ color: 'var(--navy)' }}>Verifying Property Ownership</h3>
          <p>
            Never advance financial deposits without cross-checking the primary dolil (title deed), recent CS/RS/BS porcha, namjari khatian, and dakhila receipts with the local AC Land office. On TrueSpace, our verification team performs preliminary paperwork checks before any property listing earns the verified owner badge.
          </p>

          <h3 style={{ color: 'var(--navy)' }}>Summary Recommendation</h3>
          <p>
            Make site visits at different times of the day—especially during peak evening commuter hours and rainy periods—to evaluate street drainage and accessibility accurately.
          </p>

          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--line)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(post.tags || []).map((t) => (
              <span key={t} className="chip">
                #{t}
              </span>
            ))}
          </div>
        </article>

        {/* RELATED ARTICLES */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: '18px' }}>Related Dhaka Property Guides</h3>
          <div className="grid2">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="fcard" style={{ textDecoration: 'none' }}>
                <h4 style={{ color: 'var(--navy)', margin: '0 0 6px' }}>{r.title}</h4>
                <p style={{ color: 'var(--mut)', fontSize: '13px', margin: 0 }}>{r.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <PrototypeFooter />
    </>
  );
}
