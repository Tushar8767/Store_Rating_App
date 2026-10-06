// Five buttons, 1 to 5. The selected number is highlighted.
export default function RatingInput({ value, onChange, disabled }) {
  return (
    <div className="rating-input" role="group" aria-label="Rating from 1 to 5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          className={n === value ? 'selected' : ''}
          aria-pressed={n === value}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
