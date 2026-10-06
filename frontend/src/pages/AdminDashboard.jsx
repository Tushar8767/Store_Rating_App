import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function AdminDashboard() {
  const { data, loading, error } = useFetch(() => api.adminDashboard(), []);

  return (
    <div>
      <h1>Admin dashboard</h1>
      <ErrorMessage message={error} />
      {loading && <LoadingState />}
      {data && (
        <div className="stat-grid">
          <div className="card stat"><span className="stat-number">{data.total_users}</span>Total users</div>
          <div className="card stat"><span className="stat-number">{data.total_stores}</span>Total stores</div>
          <div className="card stat"><span className="stat-number">{data.total_ratings}</span>Total ratings</div>
        </div>
      )}
      <div className="actions">
        <Link className="btn" to="/admin/users">View users</Link>
        <Link className="btn" to="/admin/stores">View stores</Link>
        <Link className="btn btn-light" to="/admin/users/new">Add user</Link>
        <Link className="btn btn-light" to="/admin/stores/new">Add store</Link>
      </div>
    </div>
  );
}
