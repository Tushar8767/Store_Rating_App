// Table header cell. Click to sort ascending, click again for descending.
export default function SortableTh({ label, field, sort, onSort }) {
  const active = sort.sortBy === field;
  const next = active && sort.order === 'asc' ? 'desc' : 'asc';
  return (
    <th aria-sort={active ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button className="th-button" onClick={() => onSort({ sortBy: field, order: next })}>
        {label}
        <span className="sort-mark">{active ? (sort.order === 'asc' ? '▲' : '▼') : ''}</span>
      </button>
    </th>
  );
}
