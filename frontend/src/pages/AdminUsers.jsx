import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import useDebounce from '../hooks/useDebounce.js';
import FilterBar from '../components/FilterBar.jsx';
import SortableTh from '../components/SortableTh.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const roleLabel = { admin: 'Admin', user: 'Normal user', owner: 'Store owner' };

export default function AdminUsers() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const debounced = useDebounce(filters);
  const { data: users, loading, error } = useFetch(() => api.adminUsers({ ...debounced, ...sort }), [debounced, sort]);

  return (
    <div>
      <div className="page-head">
        <h1>Users</h1>
        <Link className="btn" to="/admin/users/new">Add user</Link>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} showRole fields={[['name', 'Name'], ['email', 'Email'], ['address', 'Address']]} />
      <ErrorMessage message={error} />
      {loading && !users ? <LoadingState /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <SortableTh label="Name" field="name" sort={sort} onSort={setSort} />
                <SortableTh label="Email" field="email" sort={sort} onSort={setSort} />
                <SortableTh label="Address" field="address" sort={sort} onSort={setSort} />
                <SortableTh label="Role" field="role" sort={sort} onSort={setSort} />
              </tr>
            </thead>
            <tbody>
              {users && users.length === 0 && <tr><td colSpan="4" className="muted">No users match the filters.</td></tr>}
              {users && users.map((u) => (
                <tr key={u.id}>
                  <td><Link to={`/admin/users/${u.id}`}>{u.name}</Link></td>
                  <td>{u.email}</td>
                  <td>{u.address}</td>
                  <td>{roleLabel[u.role]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
