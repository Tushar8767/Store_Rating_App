import { useState } from 'react';
import { api } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import useDebounce from '../hooks/useDebounce.js';
import FilterBar from '../components/FilterBar.jsx';
import SortableTh from '../components/SortableTh.jsx';
import RatingInput from '../components/RatingInput.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { formatRating } from '../utils/validators.js';

// One table row. Keeps the rating the user has picked but not saved yet.
function StoreRow({ store, onSaved }) {
  const [picked, setPicked] = useState(store.my_rating || 0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const hasRated = store.my_rating != null;

  async function save() {
    if (!picked) {
      setMessage({ type: 'error', text: 'Pick a rating from 1 to 5.' });
      return;
    }
    setBusy(true);
    setMessage({ type: '', text: '' });
    try {
      if (hasRated) await api.updateRating(store.id, picked);
      else await api.createRating(store.id, picked);
      await onSaved();
      setMessage({ type: 'success', text: hasRated ? 'Rating updated.' : 'Rating saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr>
      <td data-label="Store">{store.name}</td>
      <td data-label="Address">{store.address}</td>
      <td data-label="Overall rating">
        {formatRating(store.overall_rating)}
        {store.rating_count > 0 && <span className="muted"> ({store.rating_count})</span>}
      </td>
      <td data-label="My rating">{store.my_rating ?? 'Not rated'}</td>
      <td data-label="Rate">
        <RatingInput value={picked} onChange={setPicked} disabled={busy} />
        <button className="btn btn-small" onClick={save} disabled={busy || picked === store.my_rating}>
          {hasRated ? 'Update rating' : 'Submit rating'}
        </button>
        {message.text && <small className={message.type === 'error' ? 'error-text' : 'success-text'}>{message.text}</small>}
      </td>
    </tr>
  );
}

export default function StoreList() {
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const debounced = useDebounce(filters);

  const { data: stores, setData, loading, error } = useFetch(
    () => api.getStores({ ...debounced, ...sort }),
    [debounced, sort]
  );

  // After a rating is saved, reload the list so overall and "my" ratings are up to date.
  const reload = async () => setData(await api.getStores({ ...debounced, ...sort }));

  return (
    <div>
      <h1>Stores</h1>
      <FilterBar filters={filters} setFilters={setFilters} fields={[['name', 'Search by store name'], ['address', 'Search by address']]} />
      <ErrorMessage message={error} />
      {loading && !stores ? (
        <LoadingState />
      ) : (
        <div className="table-wrap">
          <table className="responsive-table">
            <thead>
              <tr>
                <SortableTh label="Store" field="name" sort={sort} onSort={setSort} />
                <SortableTh label="Address" field="address" sort={sort} onSort={setSort} />
                <SortableTh label="Overall rating" field="rating" sort={sort} onSort={setSort} />
                <th>My rating</th>
                <th>Rate this store</th>
              </tr>
            </thead>
            <tbody>
              {stores && stores.length === 0 && (
                <tr><td colSpan="5" className="muted">No stores match your search.</td></tr>
              )}
              {stores && stores.map((store) => (
                <StoreRow key={store.id} store={store} onSaved={reload} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
