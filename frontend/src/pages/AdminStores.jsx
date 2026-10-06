import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import useDebounce from '../hooks/useDebounce.js';
import FilterBar from '../components/FilterBar.jsx';
import SortableTh from '../components/SortableTh.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { formatRating } from '../utils/validators.js';

export default function AdminStores() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const debounced = useDebounce(filters);
  const { data: stores, loading, error } = useFetch(() => api.adminStores({ ...debounced, ...sort }), [debounced, sort]);

  return (
    <div>
      <div className="page-head">
        <h1>Stores</h1>
        <Link className="btn" to="/admin/stores/new">Add store</Link>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} fields={[['name', 'Name'], ['email', 'Email'], ['address', 'Address']]} />
      <ErrorMessage message={error} />
      {loading && !stores ? <LoadingState /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <SortableTh label="Name" field="name" sort={sort} onSort={setSort} />
                <SortableTh label="Email" field="email" sort={sort} onSort={setSort} />
                <SortableTh label="Address" field="address" sort={sort} onSort={setSort} />
                <SortableTh label="Rating" field="rating" sort={sort} onSort={setSort} />
              </tr>
            </thead>
            <tbody>
              {stores && stores.length === 0 && <tr><td colSpan="4" className="muted">No stores match the filters.</td></tr>}
              {stores && stores.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.address}</td>
                  <td>{formatRating(s.rating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
