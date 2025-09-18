import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
	const { login, loading } = useAuth();
	const navigate = useNavigate();
	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		const result = await login(identifier, password);
		if (result.success) {
			navigate('/');
		} else {
			setError(result.error || 'Login failed');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
			<div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
				<h2 className="text-2xl font-bold mb-6 text-center text-blue-700">NoteZ Login</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="identifier" className="block text-sm font-medium text-gray-700">Email or Username</label>
						<input
							id="identifier"
							type="text"
							className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							value={identifier}
							onChange={e => setIdentifier(e.target.value)}
							required
							autoFocus
						/>
					</div>
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
						<input
							id="password"
							type="password"
							className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							value={password}
							onChange={e => setPassword(e.target.value)}
							required
						/>
					</div>
					{error && <div className="text-red-600 text-sm">{error}</div>}
					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
						disabled={loading}
					>
						{loading ? <LoadingSpinner size={20} /> : 'Login'}
					</button>
				</form>
				<div className="mt-4 text-center text-sm text-gray-500">
					Don&apos;t have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
				</div>
			</div>
		</div>
	);
};

export default Login;

