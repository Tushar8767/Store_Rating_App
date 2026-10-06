import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';

export default function AppLayout() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
