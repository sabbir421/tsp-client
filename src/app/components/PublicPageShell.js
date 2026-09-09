'use client';

import { useEffect, useState } from 'react';

/**
 * Renders public marketing pages only after the client mounts so browser
 * extensions (e.g. Urban VPN injecting bis_skin_checked) cannot cause
 * SSR/client hydration attribute mismatches.
 */
export default function PublicPageShell({ className, children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={className} aria-busy="true" aria-label="Loading page" />;
  }

  return <div className={className}>{children}</div>;
}
