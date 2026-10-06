import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Frontend guard only. The backend repeats the same role check on every API call.
export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    const home = { admin: '/admin', user: '/stores', owner: '/owner' }[user.role];
    return <Navigate to={home} replace />;
  }
  return <Outlet />;
}
