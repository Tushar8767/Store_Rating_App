import { api } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { formatRating } from '../utils/validators.js';

export default function OwnerDashboard() {
  const { data, loading, error } = useFetch(() => api.ownerDashboard(), []);

  return (
    <div>
      <h1>{data ? data.store.name : 'My store'}</h1>
      <ErrorMessage message={error} />
      {loading && <LoadingState />}
      {data && (
        <>
          <p className="muted">{data.store.address}</p>
          <div className="stat-grid">
            <div className="card stat">
              <span className="stat-number">
                {data.store.average_rating == null ? '-' : data.store.average_rating.toFixed(1)}
              </span>
              Average rating
            </div>
            <div className="card stat">
              <span className="stat-number">{data.store.rating_count}</span>
              Ratings received
            </div>
          </div>

          <h2>Users who rated your store</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Rating</th><th>Date</th></tr>
              </thead>
              <tbody>
                {data.raters.length === 0 && <tr><td colSpan="4" className="muted">No one has rated your store yet.</td></tr>}
                {data.raters.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{formatRating(r.rating)}</td>
                    <td>{new Date(r.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
