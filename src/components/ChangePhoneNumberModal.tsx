import { useState, useEffect } from 'react';
import CloseIcon from '../assets/icons/close';
import EyeIcon from '../assets/icons/eye';
import EyeClosedIcon from '../assets/icons/eye-closed';

interface ChangePhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoneNumber?: string;
  onSave?: (phoneNumber: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

// Phone number masking helper - formats as (XXX) XXX-XXXX
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // Limit to 10 digits for US phone numbers
  const limitedDigits = digitsOnly.slice(0, 10);
  
  // Apply mask based on number of digits
  if (limitedDigits.length === 0) {
    return '';
  } else if (limitedDigits.length <= 3) {
    return `(${limitedDigits}`;
  } else if (limitedDigits.length <= 6) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  } else {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  }
};

// Phone number validation helper
const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone.trim()) {
    return { isValid: false, error: 'Please enter a phone number' };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  // US format: exactly 10 digits
  if (digitsOnly.length === 10) {
    return { isValid: true };
  }

  // Invalid format
  return {
    isValid: false,
    error: 'US phone number must be 10 digits (e.g., (123) 456-7890)',
  };
};

export const ChangePhoneNumberModal: React.FC<ChangePhoneNumberModalProps> = ({
  isOpen,
  onClose,
  currentPhoneNumber = '',
  onSave,
  isLoading = false,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(() => 
    currentPhoneNumber ? formatPhoneNumber(currentPhoneNumber) : ''
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Format the current phone number if it exists
      const formatted = currentPhoneNumber ? formatPhoneNumber(currentPhoneNumber) : '';
      setPhoneNumber(formatted);
      setPassword('');
      setShowPassword(false);
      setError('');
      setShowTooltip(false);
    }
  }, [isOpen, currentPhoneNumber]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading]);

  const handleSave = async () => {
    // Validate password
    if (!password) {
      setError('Please enter your password');
      return;
    }

    // Validate phone number format
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || 'Please enter a valid phone number');
      return;
    }

    setError('');
    try {
      await onSave?.(phoneNumber, password);
      // Modal will be closed by parent component on success
    } catch (error) {
      // Error is handled by parent component, but we can show it here too
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update phone number. Please try again.';
      setError(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={isLoading ? undefined : onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal Content */}
      <div
        className="relative backdrop-blur-[10px] bg-[rgba(255,255,255,0.1)] rounded-[16px] p-8 w-[406px] flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-white text-[24px] leading-normal"
            style={{ fontFamily: 'Cinzel, serif', fontWeight: 400 }}
          >
            Change Phone Number
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition"
            aria-label="Close modal"
            disabled={isLoading}
          >
            <CloseIcon width={24} height={24} color="#fff" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Description */}
        <p
          className="text-white text-[14px] leading-[24px]"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          To change your phone number please enter your current password for verification.
        </p>

        {/* Form Fields */}
        <div className="flex flex-col gap-6">
          {/* Phone Number Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="phone-number"
              className="text-white text-[14px] leading-[20px]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Phone Number
            </label>
            <input
              id="phone-number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setPhoneNumber(formatted);
                setError('');
              }}
              placeholder="(123) 456-7899"
              maxLength={14}
              className="w-full h-[56px] px-4 bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] text-white font-lato text-[16px] leading-[24px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="phone-password"
                className="text-white text-[14px] leading-[20px]"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Current Password
              </label>
              {/* Tooltip Icon */}
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onFocus={() => setShowTooltip(true)}
                  onBlur={() => setShowTooltip(false)}
                  className="w-4 h-4 rounded-full border border-[rgba(255,255,255,0.5)] flex items-center justify-center text-[10px] text-[rgba(255,255,255,0.7)] hover:border-white hover:text-white transition"
                  aria-label="Why is password required?"
                >
                  ?
                </button>
                {/* Tooltip */}
                {showTooltip && (
                  <div className="absolute left-0 top-6 w-64 bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[8px] p-3 z-10 shadow-lg">
                    <p
                      className="text-white text-[12px] leading-[16px]"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Password verification is required for security purposes to ensure that only authorized users can change sensitive account information like phone numbers.
                    </p>
                    {/* Tooltip Arrow */}
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-[#131313] border-l border-t border-[rgba(255,255,255,0.25)] rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <input
                id="phone-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="• • • • • • • •"
                className="w-full h-[56px] px-4 pr-12 bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] text-white font-lato text-[16px] leading-[24px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeIcon className="w-6 h-6" />
                ) : (
                  <EyeClosedIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 h-[56px] rounded-[12px] bg-[#965CDF] text-white hover:bg-[#8549c9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-[16px] font-roboto"
            disabled={!phoneNumber.trim() || !password || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-[56px] rounded-[12px] bg-[#131313] border border-[#965cdf] text-white hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-[16px] font-roboto"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

