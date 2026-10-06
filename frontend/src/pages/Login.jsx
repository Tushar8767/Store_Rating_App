import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import FormInput from '../components/FormInput.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { validateEmail } from '../utils/validators.js';

const homeFor = { admin: '/admin', user: '/stores', owner: '/owner' };

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homeFor[user.role]} replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (validateEmail(form.email)) found.email = validateEmail(form.email);
    if (!form.password) found.password = 'Password is required.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setServerError('');
    try {
      const loggedIn = await login(form.email, form.password);
      navigate(homeFor[loggedIn.role]);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Log in</h1>
        <ErrorMessage message={serverError} />
        <FormInput label="Email" name="email" type="email" value={form.email} onChange={change} error={errors.email} />
        <FormInput label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} />
        <button className="btn" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
