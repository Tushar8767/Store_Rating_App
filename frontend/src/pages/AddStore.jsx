import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import FormInput from '../components/FormInput.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { validateForm, validateEmail, validateAddress } from '../utils/validators.js';

const rules = {
  name: (v) => (v.trim().length < 1 || v.trim().length > 100 ? 'Store name must be 1 to 100 characters.' : ''),
  email: validateEmail,
  address: validateAddress,
};

export default function AddStore() {
  const navigate = useNavigate();
  const { data: owners } = useFetch(() => api.adminOwners(), []);
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState({ message: '', errors: [] });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const found = validateForm(form, rules);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await api.adminCreateStore({ ...form, ownerId: form.ownerId || null });
      navigate('/admin/stores');
    } catch (err) {
      setServerError({ message: err.message, errors: err.errors });
    }
  }

  return (
    <div className="narrow">
      <h1>Add store</h1>
      <form className="card" onSubmit={submit} noValidate>
        <ErrorMessage message={serverError.message} errors={serverError.errors} />
        <FormInput label="Store name" name="name" value={form.name} onChange={change} error={errors.name} />
        <FormInput label="Store email" name="email" type="email" value={form.email} onChange={change} error={errors.email} />
        <FormInput label="Address" name="address" multiline value={form.address} onChange={change} error={errors.address} />
        <FormInput label="Store owner" name="ownerId" hint="Only owners without a store are listed. Add an owner from Add user first.">
          <select id="ownerId" name="ownerId" value={form.ownerId} onChange={change}>
            <option value="">No owner yet</option>
            {owners && owners.map((o) => (
              <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
            ))}
          </select>
        </FormInput>
        <button className="btn">Add store</button>
      </form>
    </div>
  );
}
