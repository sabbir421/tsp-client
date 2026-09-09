'use client';

import { useSelector } from 'react-redux';
import { isSellerAgent, isBuyerTenant } from '../utils/roles';
import SellerDashboard from '../components/dashboard/SellerDashboard';
import BuyerDashboard from '../components/dashboard/BuyerDashboard';
import SimpleDashboard from '../components/dashboard/SimpleDashboard';

export default function DashboardPage() {
  const { user, selectedRole, isHydrated } = useSelector((state) => state.auth);

  if (!isHydrated) {
    return null;
  }

  if (!user) return null;

  if (isSellerAgent(user, selectedRole)) {
    return <SellerDashboard />;
  }

  if (isBuyerTenant(user, selectedRole)) {
    return <BuyerDashboard />;
  }

  return <SimpleDashboard />;
}
