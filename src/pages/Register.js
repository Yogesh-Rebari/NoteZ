

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Register = () => {
	const { register, loading } = useAuth();
	const navigate = useNavigate();
		const [form, setForm] = useState({
			username: '',
			email: '',
			password: ''
		});
	const [error, setError] = useState('');

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

			const validate = () => {
				const { username, email, password } = form;
				if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
					return 'Username must be 3-30 characters and only contain letters, numbers, and underscores.';
				}
				if (!/^\S+@\S+\.\S+$/.test(email)) {
					return 'Please provide a valid email address.';
				}
				if (!/^.{6,}$/.test(password)) {
					return 'Password must be at least 6 characters long.';
				}
				if (!/(?=.*[a-z])/.test(password)) {
					return 'Password must contain at least one lowercase letter.';
				}
				if (!/(?=.*[A-Z])/.test(password)) {
					return 'Password must contain at least one uppercase letter.';
				}
				if (!/(?=.*\d)/.test(password)) {
					return 'Password must contain at least one number.';
				}
				return '';
			};

			const handleSubmit = async (e) => {
				e.preventDefault();
				setError('');
				const validationError = validate();
				if (validationError) {
					setError(validationError);
					return;
				}
				const result = await register(form);
				if (result.success) {
					navigate('/');
				} else {
					// Show detailed validation errors if available (error.data.errors or error.errors)
					const errObj = result.error && (result.error.data || result.error);
					if (errObj && Array.isArray(errObj.errors)) {
						setError(errObj.errors.map(err => `${err.field}: ${err.message}`).join(' | '));
					} else if (Array.isArray(errObj)) {
						setError(errObj.map(err => `${err.field}: ${err.message}`).join(' | '));
					} else {
						setError(result.error?.message || result.error || 'Registration failed');
					}
				}
			};

		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
				<div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
					<h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Register</h2>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
							<input
								id="username"
								name="username"
								type="text"
								className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								value={form.username}
								onChange={handleChange}
								required
								autoFocus
							/>
						</div>
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
							<input
								id="email"
								name="email"
								type="email"
								className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								value={form.email}
								onChange={handleChange}
								required
							/>
						</div>
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
							<input
								id="password"
								name="password"
								type="password"
								className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								value={form.password}
								onChange={handleChange}
								required
							/>
						</div>
						{error && <div className="text-red-600 text-sm">{error}</div>}
						<button
							type="submit"
							className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
							disabled={loading}
						>
							{loading ? <LoadingSpinner size={20} /> : 'Register'}
						</button>
					</form>
					<div className="mt-4 text-center text-sm text-gray-500">
						Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
					</div>
				</div>
			</div>
		);
};

export default Register;

