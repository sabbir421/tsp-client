'use client';

import { usePathname } from 'next/navigation';
import RequireAuth from '../components/auth/RequireAuth';
import { getRequiredRoleForPath } from '../utils/navigation';

export default function Layout({ children }) {
  const pathname = usePathname();
  return <RequireAuth requiredRole={getRequiredRoleForPath(pathname)}>{children}</RequireAuth>;
}
