import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import BottomNav from './BottomNav';
import UserStats from './UserStats';

export default function Layout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col max-w-lg mx-auto relative">
      <UserStats />
      <main className="flex-1 overflow-y-auto pb-20 pt-2">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
