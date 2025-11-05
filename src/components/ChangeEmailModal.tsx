import { useState, useEffect } from 'react';
import CloseIcon from '../assets/icons/close';
import EyeIcon from '../assets/icons/eye';
import EyeClosedIcon from '../assets/icons/eye-closed';
import { Button } from './Button';
import { Input } from './Input';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail?: string;
  onSave?: (newEmail: string, currentPassword: string) => void;
}

export const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
  isOpen,
  onClose,
  currentEmail = '',
  onSave,
}) => {
  const [newEmail, setNewEmail] = useState(currentEmail);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewEmail(currentEmail);
      setCurrentPassword('');
      setShowPassword(false);
    }
  }, [isOpen, currentEmail]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
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
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (newEmail && currentPassword) {
      onSave?.(newEmail, currentPassword);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
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
            Change Email
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition"
            aria-label="Close modal"
          >
            <CloseIcon width={24} height={24} color="#fff" />
          </button>
        </div>

        {/* Description */}
        <p
          className="text-white text-[14px] leading-[24px]"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          To change your email please enter your current password for verification.
        </p>

        {/* Form Fields */}
        <div className="flex flex-col gap-6">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="new-email"
              className="text-white text-[14px] leading-[20px]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Email
            </label>
            <input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="newusername@companyemail.com"
              className="w-full h-[56px] px-4 bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] text-white font-lato text-[16px] leading-[24px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Current Password Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="current-password-email"
              className="text-white text-[14px] leading-[20px]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Current Password
            </label>
            <div className="relative">
              <input
                id="current-password-email"
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="•••••••••"
                className="w-full h-[56px] px-4 pr-12 bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] text-white font-lato text-[16px] leading-[24px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={!newEmail || !currentPassword}
          >
            Save Changes
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1 border-[#965cdf] text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

