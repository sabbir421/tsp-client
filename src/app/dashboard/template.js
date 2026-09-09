'use client';

import { usePathname } from 'next/navigation';

export default function DashboardTemplate({ children }) {
  const pathname = usePathname();
  return <div key={pathname}>{children}</div>;
}
