import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authBg from '../assets/images/auth-bg.png';
import { Input } from '../components/Input';
import { PasswordInput } from '../components/PasswordInput';
import { Button } from '../components/Button';
import { useStore } from '../store';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  const { signIn, isLoading, error, clearError } = useStore();

  // Get success message from location state (e.g., after password reset)
  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      setSuccessMessage(state.message);
      // Clear the location state to prevent showing message on subsequent navigations
      window.history.replaceState({}, document.title);
      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Clear errors when email/password changes
  useEffect(() => {
    if (localError || error) {
      setLocalError('');
      clearError();
    }
  }, [email, password]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear success message when user interacts with form (types or focuses)
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage(''); // Clear success message when form is submitted
    
    // Basic validation
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await signIn(email, password);
      // Redirect to the original destination if available, otherwise to content-management
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/content-management';
      navigate(from, { replace: true });
    } catch (error: unknown) {
      // Get error message directly from Appwrite error
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string')
        ? error.message
        : (typeof error === 'string')
        ? error
        : 'Failed to sign in. Please check your credentials.';
      
      // Set local error to display in the form
      setLocalError(errorMessage);
      // Clear success message when sign-in fails
      setSuccessMessage('');
    }
  };

  // Get the error to display (prioritize local error, then store error)
  const displayError = localError || error;

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
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                <p className="text-green-400 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {displayError && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{displayError}</p>
              </div>
            )}

            {/* Email Field */}
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />

            {/* Password Field */}
            <PasswordInput
              id="password"
              label="Password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password!"
              required
              disabled={isLoading}
            />

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

