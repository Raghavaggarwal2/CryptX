import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Sending reset code...");
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStep(2);
        toast.success(data.message || "OTP sent to your email!", { id: loadingToast });
      } else {
        toast.error(data.error || "Failed to send OTP", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Network error", { id: loadingToast });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Resetting password...");
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Password reset successfully! Please login.", { id: loadingToast });
        navigate('/login');
      } else {
        toast.error(data.error || "Reset failed", { id: loadingToast });
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
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
          {step === 1 ? <>Reset <span className="text-highlight1">Password</span></> : "Enter Code"}
        </h2>
        
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="flex flex-col gap-4">
            <p className="text-center text-gray-600 text-sm mb-2">Enter your email to receive a password reset code.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="rounded-full border border-blue-500 w-full p-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button type="submit" className="bg-blue-600 text-white rounded-full py-2 mt-4 hover:bg-blue-500 transition font-semibold">
              Send Reset Code
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <p className="text-center text-gray-600 text-sm mb-2">We sent a 6-digit code to <strong>{email}</strong></p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="rounded-full border border-blue-500 w-full p-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center tracking-widest text-lg font-bold"
              required
              maxLength={6}
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="rounded-full border border-blue-500 w-full p-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              minLength={6}
            />
            <button type="submit" className="bg-green-600 text-white rounded-full py-2 mt-4 hover:bg-green-500 transition font-semibold">
              Update Password
            </button>
          </form>
        )}
        
        <p className="text-center mt-6 text-sm text-gray-600">
          Remember your password? <Link to="/login" className="text-blue-600 hover:underline font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
