import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={(location.state as { from?: string } | null)?.from ?? '/'} replace />;
  return <Outlet />;
}
