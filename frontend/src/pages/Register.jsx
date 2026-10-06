import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import FormInput from '../components/FormInput.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { validateForm, validateName, validateEmail, validateAddress, validatePassword } from '../utils/validators.js';

const rules = { name: validateName, email: validateEmail, address: validateAddress, password: validatePassword };

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const found = validateForm(form, rules);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setServerError('');
    try {
      await register(form);
      navigate('/stores');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Create an account</h1>
        <ErrorMessage message={serverError} />
        <FormInput label="Full name" name="name" value={form.name} onChange={change} error={errors.name} hint="20 to 60 characters" />
        <FormInput label="Email" name="email" type="email" value={form.email} onChange={change} error={errors.email} />
        <FormInput label="Address" name="address" multiline value={form.address} onChange={change} error={errors.address} hint="Up to 400 characters" />
        <FormInput label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} hint="8 to 16 characters, one uppercase letter and one special character" />
        <button className="btn" disabled={busy}>{busy ? 'Creating...' : 'Sign up'}</button>
        <p className="muted">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
