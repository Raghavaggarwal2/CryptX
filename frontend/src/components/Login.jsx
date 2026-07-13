import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = ({ setIsAuthenticated }) => {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Logging in...");
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.username);
        setIsAuthenticated(true);
        navigate('/');
        toast.success("Logged in successfully!", { id: loadingToast });
      } else {
        toast.error(data.error || "Login failed", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Network error", { id: loadingToast });
    }
  };

  return (
    <div className="min-h-[81vh] relative flex flex-col items-center justify-center px-4 py-10 w-full">
      <div className="fixed inset-0 -z-10 h-full w-full bg-gradient-to-br from-blue-100 via-blue-100 to-blue-200">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-300 opacity-20 blur-[100px]"></div>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">Login to <span className="text-highlight1">CryptX</span></h2>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            placeholder="Username or Email"
            className="rounded-full border border-blue-500 w-full p-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="rounded-full border border-blue-500 w-full p-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          
          <button type="submit" className="bg-blue-600 text-white rounded-full py-2 mt-2 hover:bg-blue-500 transition font-semibold">
            Log in
          </button>
        </form>
        
        <div className="flex flex-col items-center mt-6 gap-2">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot your password?
          </Link>
          <p className="text-sm text-gray-600">
            Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
