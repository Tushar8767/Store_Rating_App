import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = {
  admin: [
    ['/admin', 'Dashboard'],
    ['/admin/users', 'Users'],
    ['/admin/stores', 'Stores'],
  ],
  user: [['/stores', 'Stores']],
  owner: [['/owner', 'My Store']],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="brand">Store Rating</span>
        <nav className="nav-links">
          {links[user.role].map(([to, label]) => (
            <NavLink key={to} to={to} end>
              {label}
            </NavLink>
          ))}
          <NavLink to="/change-password">Change Password</NavLink>
        </nav>
        <div className="nav-user">
          <span className="role-badge">{user.role === 'owner' ? 'store owner' : user.role}</span>
          <button className="btn btn-light" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
