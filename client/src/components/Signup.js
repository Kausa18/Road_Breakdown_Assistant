import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user', // 'user' or 'provider'
    service_type: '',
    latitude: '',
    longitude: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    setForm({ ...form, role: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Choose correct endpoint
      const url =
        form.role === 'provider'
          ? 'http://localhost:5000/api/provider-signup'
          : 'http://localhost:5000/api/user-signup';

      const payload =
        form.role === 'provider'
          ? form
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone,
              role: 'user'
            };

      const res = await axios.post(url, payload);
      setMessage(res.data.message || 'Signup successful!');
      navigate('/login');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Signup</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Role: </label>
          <select name="role" value={form.role} onChange={handleRoleChange}>
            <option value="user">User</option>
            <option value="provider">Provider</option>
          </select>
        </div>

        {['name', 'email', 'password', 'phone'].map((field) => (
          <div key={field} style={{ marginBottom: '1rem' }}>
            <label>{field.toUpperCase()}: </label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        {form.role === 'provider' && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label>Service Type: </label>
              <input
                type="text"
                name="service_type"
                value={form.service_type}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Latitude: </label>
              <input
                type="text"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Longitude: </label>
              <input
                type="text"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        <button type="submit">Sign Up</button>
      </form>

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
};

export default Signup;
