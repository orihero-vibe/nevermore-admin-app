import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authBg from '../assets/images/auth-bg.png';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password reset logic
    console.log('Reset password for:', { email });
    // Navigate to link sent page
    navigate('/link-sent');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-[rgba(255, 255, 255, 0.75)] backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-gray-700/50">
          {/* Title */}
          <h1 className="text-3xl font-normal text-white mb-4 tracking-wide">
            Reset Password
          </h1>

          {/* Instructions */}
          <p className="text-sm text-gray-200 mb-6">
            Enter your email address to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <Input
              id="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />

            {/* Send Link Button */}
            <Button type="submit" fullWidth>
              Send Link
            </Button>
          </form>

          {/* Return to Sign In Link */}
          <div className="mt-6 text-center">
            <Link
              to="/signin"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

