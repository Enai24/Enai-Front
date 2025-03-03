import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userData.password !== userData.password2) {
      toast.error("Passwords don't match.");
      return;
    }
    try {
      await api.post('register/', {
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: userData.password,
        password2: userData.password2,
      });
      toast.success('Registered successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response && error.response.data) {
        const errors = error.response.data;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key]}`);
        });
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold text-white mb-4">Register</h2>
        <div className="mb-4">
          <label className="block text-gray-300">Username</label>
          <input
            type="text"
            name="username"
            value={userData.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300">First Name</label>
          <input
            type="text"
            name="first_name"
            value={userData.first_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={userData.last_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300">Password</label>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300">Confirm Password</label>
          <input
            type="password"
            name="password2"
            value={userData.password2}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Register
        </button>
        <p className="text-gray-400 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;