
import { useNavigate } from 'react-router-dom';
import authBg from '../assets/images/auth-bg.png';
import CheckSmallIcon from '../assets/icons/check-small';

export const LinkSent = () => {
  const navigate = useNavigate();

  const handleResend = () => {
    // TODO: Implement resend logic
    console.log('Resending password reset link');
    // Navigate to success page
    navigate('/success');
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
          </p>

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
              className="text-sm text-[#8A4DBC] hover:text-[#9D5DD1] transition-colors font-medium"
            >
              Resend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

