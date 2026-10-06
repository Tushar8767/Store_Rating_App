// Row of text boxes (and an optional role select) that update a filters object.
export default function FilterBar({ filters, setFilters, fields, showRole }) {
  const update = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  return (
    <div className="filter-bar">
      {fields.map(([name, label]) => (
        <input
          key={name}
          name={name}
          value={filters[name]}
          onChange={update}
          placeholder={label}
          aria-label={label}
        />
      ))}
      {showRole && (
        <select name="role" value={filters.role} onChange={update} aria-label="Role">
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">Normal user</option>
          <option value="owner">Store owner</option>
        </select>
      )}
    </div>
  );
}
