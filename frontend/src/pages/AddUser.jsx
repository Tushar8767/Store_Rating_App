import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import FormInput from '../components/FormInput.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { validateForm, validateName, validateEmail, validateAddress, validatePassword } from '../utils/validators.js';

const rules = { name: validateName, email: validateEmail, address: validateAddress, password: validatePassword };

export default function AddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState({ message: '', errors: [] });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const found = validateForm(form, rules);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await api.adminCreateUser(form);
      navigate('/admin/users');
    } catch (err) {
      setServerError({ message: err.message, errors: err.errors });
    }
  }

  return (
    <div className="narrow">
      <h1>Add user</h1>
      <form className="card" onSubmit={submit} noValidate>
        <ErrorMessage message={serverError.message} errors={serverError.errors} />
        <FormInput label="Full name" name="name" value={form.name} onChange={change} error={errors.name} hint="20 to 60 characters" />
        <FormInput label="Email" name="email" type="email" value={form.email} onChange={change} error={errors.email} />
        <FormInput label="Address" name="address" multiline value={form.address} onChange={change} error={errors.address} />
        <FormInput label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} hint="8 to 16 characters, one uppercase letter and one special character" />
        <FormInput label="Role" name="role">
          <select id="role" name="role" value={form.role} onChange={change}>
            <option value="user">Normal user</option>
            <option value="admin">Admin</option>
            <option value="owner">Store owner</option>
          </select>
        </FormInput>
        <button className="btn">Add user</button>
      </form>
    </div>
  );
}
