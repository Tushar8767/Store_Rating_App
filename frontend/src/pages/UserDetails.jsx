import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { formatRating } from '../utils/validators.js';

const roleLabel = { admin: 'Admin', user: 'Normal user', owner: 'Store owner' };

export default function UserDetails() {
  const { id } = useParams();
  const { data: user, loading, error } = useFetch(() => api.adminUser(id), [id]);

  return (
    <div className="narrow">
      <p><Link to="/admin/users">Back to users</Link></p>
      <h1>User details</h1>
      <ErrorMessage message={error} />
      {loading && <LoadingState />}
      {user && (
        <dl className="card details">
          <dt>Name</dt><dd>{user.name}</dd>
          <dt>Email</dt><dd>{user.email}</dd>
          <dt>Address</dt><dd>{user.address}</dd>
          <dt>Role</dt><dd>{roleLabel[user.role]}</dd>
          {user.role === 'owner' && (
            <>
              <dt>Store</dt><dd>{user.store ? user.store.name : 'No store assigned'}</dd>
              <dt>Store rating</dt><dd>{user.store ? formatRating(user.store.rating) : '-'}</dd>
            </>
          )}
        </dl>
      )}
    </div>
  );
}
