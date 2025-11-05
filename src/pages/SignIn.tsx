import { useState } from 'react';
import authBg from '../assets/images/auth-bg.png';
import { Input } from '../components/Input';
import { PasswordInput } from '../components/PasswordInput';
import { Button } from '../components/Button';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement sign in logic
    console.log('Sign in:', { email, password });
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
          <h1 className="text-3xl font-normal text-white mb-8 tracking-wide">
            Sign In
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            {/* Password Field */}
            <PasswordInput
              id="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password!"
              required
            />

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <a
                href="#"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <Button type="submit" fullWidth>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

