import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MailCheck } from 'lucide-react';

export default function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6 || isNaN(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    // Simulate OTP Success
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <MailCheck className="text-blue-600 w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Verify your email
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a 6-digit code to <br/>
          <span className="font-bold text-gray-900">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleVerify}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 text-center mb-2">Enter OTP</label>
              <div className="mt-1 flex justify-center">
                <input
                  type="text"
                  maxLength="6"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-48 text-center text-2xl tracking-widest px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                  placeholder="------"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Verify
              </button>
            </div>
            
            <div className="text-center text-sm">
              <span className="text-gray-500">Didn't receive code? </span>
              <button 
                type="button"
                disabled={countdown > 0}
                className={`font-medium ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-500'}`}
                onClick={() => setCountdown(60)}
              >
                Resend {countdown > 0 && `in ${countdown}s`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
