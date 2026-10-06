import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import StoreList from './pages/StoreList.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminStores from './pages/AdminStores.jsx';
import AddUser from './pages/AddUser.jsx';
import AddStore from './pages/AddStore.jsx';
import UserDetails from './pages/UserDetails.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';

export const homeFor = { admin: '/admin', user: '/stores', owner: '/owner' };

function Home() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor[user.role] : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AppLayout />}>
        <Route element={<ProtectedRoute roles={['admin', 'user', 'owner']} />}>
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>

        <Route element={<ProtectedRoute roles={['user']} />}>
          <Route path="/stores" element={<StoreList />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/new" element={<AddUser />} />
          <Route path="/admin/users/:id" element={<UserDetails />} />
          <Route path="/admin/stores" element={<AdminStores />} />
          <Route path="/admin/stores/new" element={<AddStore />} />
        </Route>

        <Route element={<ProtectedRoute roles={['owner']} />}>
          <Route path="/owner" element={<OwnerDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
