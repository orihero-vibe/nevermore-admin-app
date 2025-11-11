import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authBg from '../assets/images/auth-bg.png';
import CheckSmallIcon from '../assets/icons/check-small';
import { createPasswordRecovery } from '../lib/auth';

export const LinkSent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  // Get email from location state
  const email = (location.state as { email?: string })?.email;

  const handleResend = async () => {
    if (!email) {
      // If no email in state, navigate back to forgot password
      navigate('/forgot-password');
      return;
    }

    setResendError('');
    setResendSuccess(false);
    setIsResending(true);

    try {
      await createPasswordRecovery(email);
      setResendSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend recovery email. Please try again.';
      setResendError(errorMessage);
    } finally {
      setIsResending(false);
    }
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
      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-[rgba(255, 255, 255, 0.07)] backdrop-blur-[10px] rounded-2xl shadow-2xl p-8 border border-gray-700/30">
          {/* Title */}
          <h1 className="text-3xl font-normal text-white mb-4 tracking-wide uppercase text-center">
            Link Sent
          </h1>

          {/* Success Message */}
          <p className="text-sm text-white mb-8 text-center font-normal">
            A link to reset your password has been sent to your email.
            {email && (
              <span className="block mt-2 text-purple-300 font-medium">
                {email}
              </span>
            )}
          </p>

          {/* Resend Success Message */}
          {resendSuccess && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 mb-4">
              <p className="text-green-400 text-sm text-center">
                Recovery link has been resent successfully!
              </p>
            </div>
          )}

          {/* Resend Error Message */}
          {resendError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm text-center">{resendError}</p>
            </div>
          )}

          {/* Success Icon with Concentric Circles */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Outer circle - lightest purple */}
              <div className="w-32 h-32 rounded-full bg-purple-300/20 flex items-center justify-center">
                {/* Middle circle - medium purple */}
                <div className="w-24 h-24 rounded-full bg-purple-400/30 flex items-center justify-center">
                  {/* Inner circle - darker purple */}
                  <div className="w-16 h-16 rounded-full bg-purple-600/80 flex items-center justify-center">
                    {/* White checkmark */}
                    <CheckSmallIcon width={32} height={24} color="#ffffff" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resend Section */}
          <div className="text-center">
            <p className="text-sm text-white mb-2 font-normal">
              Didn't receive a link?
            </p>
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-[#8A4DBC] hover:text-[#9D5DD1] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Resending...' : 'Resend'}
            </button>
          </div>

          {/* Return to Sign In Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/signin')}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

