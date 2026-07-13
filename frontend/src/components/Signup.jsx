import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import zxcvbn from 'zxcvbn';

const Signup = ({ setIsAuthenticated }) => {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Real-time password rules
  const requirements = [
    { id: 'length', text: 'At least 8 characters', met: form.password.length >= 8 },
    { id: 'uppercase', text: 'One uppercase letter', met: /[A-Z]/.test(form.password) },
    { id: 'number', text: 'One number', met: /[0-9]/.test(form.password) },
    { id: 'special', text: 'One special character', met: /[^A-Za-z0-9]/.test(form.password) },
  ];
  
  const allRequirementsMet = requirements.every(r => r.met);
  const strength = form.password ? zxcvbn(form.password).score : 0; // 0-4

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  // STEP 1: Send OTP to Email
  const handleRequestSignup = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Sending OTP...");
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      
      const data = await response.json();
      if (response.ok) {
        setStep(2);
        toast.success("OTP sent to your email!", { id: loadingToast });
      } else {
        toast.error(data.error || "Signup failed", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Network error", { id: loadingToast });
    }
  };

  // STEP 2: Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Verifying OTP...");
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp })
      });
      
      const data = await response.json();
      if (response.ok) {
        setStep(3);
        toast.success("Email verified!", { id: loadingToast });
      } else {
        toast.error(data.error || "Verification failed", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Network error", { id: loadingToast });
    }
  };

  // STEP 3: Complete Signup (Username & Password)
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    if (!allRequirementsMet) {
      toast.error("Please meet all password requirements first.");
      return;
    }

    const loadingToast = toast.loading("Creating account...");
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/complete-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Account created successfully! Please log in.", { id: loadingToast });
        navigate('/login');
      } else {
        toast.error(data.error || "Account creation failed", { id: loadingToast });
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
          {step === 1 && <>Join <span className="text-highlight1">CryptX</span></>}
          {step === 2 && "Verify Email"}
          {step === 3 && "Secure Account"}
        </h2>
        
        {/* Step 1: Request OTP */}
        {step === 1 && (
          <form onSubmit={handleRequestSignup} className="flex flex-col gap-4">
            <p className="text-center text-gray-600 text-sm mb-2">Enter your email to get started.</p>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="rounded-full border border-blue-500 w-full p-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button type="submit" className="bg-green-600 text-white rounded-full py-2 mt-4 hover:bg-green-500 transition font-semibold">
              Send Verification Code
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <p className="text-center text-gray-600 text-sm mb-2">We sent a 6-digit code to <strong>{form.email}</strong></p>
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="rounded-full border border-blue-500 w-full p-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center tracking-widest text-lg font-bold"
              required
              maxLength={6}
            />
            <button type="submit" className="bg-blue-600 text-white rounded-full py-2 mt-4 hover:bg-blue-500 transition font-semibold">
              Verify Code
            </button>
          </form>
        )}

        {/* Step 3: Complete Signup (Username and Password) */}
        {step === 3 && (
          <form onSubmit={handleCompleteSignup} className="flex flex-col gap-4">
            <p className="text-center text-gray-600 text-sm mb-2">Create your username and secure password.</p>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              className="rounded-full border border-blue-500 w-full p-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            
            <div className="relative w-full">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocused(true)}
                placeholder="Create Password"
                className="rounded-full border border-blue-500 w-full p-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              
              <AnimatePresence>
                {(focused || form.password.length > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-inner"
                  >
                    {/* Strength Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-gray-500">Password Strength</span>
                        <span className={`text-xs font-bold ${form.password ? 'text-gray-700' : 'text-gray-400'}`}>
                          {form.password ? strengthLabels[strength] : 'Empty'}
                        </span>
                      </div>
                      <div className="flex gap-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        {[0, 1, 2, 3].map(idx => (
                          <div 
                            key={idx} 
                            className={`h-full flex-1 transition-colors duration-500 ${form.password && idx <= strength ? strengthColors[strength] : 'bg-transparent'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Requirements Checklist */}
                    <div className="flex flex-col gap-2">
                      {requirements.map(req => (
                        <div key={req.id} className="flex items-center gap-2">
                          <motion.div 
                            initial={false}
                            animate={{ 
                              backgroundColor: req.met ? '#22c55e' : '#e5e7eb',
                              color: req.met ? '#ffffff' : '#9ca3af'
                            }}
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                          >
                            {req.met ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                          </motion.div>
                          <span className={`text-xs transition-colors duration-300 ${req.met ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              type="submit" 
              disabled={!allRequirementsMet}
              className={`text-white rounded-full py-2 mt-4 transition font-semibold ${allRequirementsMet ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Create Account
            </button>
          </form>
        )}
        
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
