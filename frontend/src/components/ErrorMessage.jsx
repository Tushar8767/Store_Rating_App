// Shows a message from the server, plus the list of field problems if there is one.
export default function ErrorMessage({ message, errors = [] }) {
  if (!message) return null;
  return (
    <div className="alert alert-error" role="alert">
      {message}
      {errors.length > 0 && (
        <ul>
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
