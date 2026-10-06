import { useState } from 'react';
import { api } from '../services/api.js';
import FormInput from '../components/FormInput.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { validatePassword } from '../utils/validators.js';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSuccess('');
    setServerError('');
    const found = {};
    if (!form.currentPassword) found.currentPassword = 'Current password is required.';
    if (validatePassword(form.newPassword)) found.newPassword = validatePassword(form.newPassword);
    if (form.confirm !== form.newPassword) found.confirm = 'Passwords do not match.';
    setErrors(found);
    if (Object.keys(found).length) return;

    try {
      await api.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess('Password updated.');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setServerError(err.message);
    }
  }

  return (
    <div className="narrow">
      <h1>Change password</h1>
      <form className="card" onSubmit={submit} noValidate>
        <ErrorMessage message={serverError} />
        {success && <div className="alert alert-success">{success}</div>}
        <FormInput label="Current password" name="currentPassword" type="password" value={form.currentPassword} onChange={change} error={errors.currentPassword} />
        <FormInput label="New password" name="newPassword" type="password" value={form.newPassword} onChange={change} error={errors.newPassword} hint="8 to 16 characters, one uppercase letter and one special character" />
        <FormInput label="Confirm new password" name="confirm" type="password" value={form.confirm} onChange={change} error={errors.confirm} />
        <button className="btn">Update password</button>
      </form>
    </div>
  );
}
