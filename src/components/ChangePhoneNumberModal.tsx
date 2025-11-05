import { useState, useEffect } from 'react';
import CloseIcon from '../assets/icons/close';
import { Button } from './Button';

interface ChangePhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoneNumber?: string;
  onSave?: (phoneNumber: string) => void;
}

export const ChangePhoneNumberModal: React.FC<ChangePhoneNumberModalProps> = ({
  isOpen,
  onClose,
  currentPhoneNumber = '',
  onSave,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber);

  useEffect(() => {
    if (isOpen) {
      setPhoneNumber(currentPhoneNumber);
    }
  }, [isOpen, currentPhoneNumber]);

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
    if (phoneNumber) {
      onSave?.(phoneNumber);
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
            Change Phone Number
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition"
            aria-label="Close modal"
          >
            <CloseIcon width={24} height={24} color="#fff" />
          </button>
        </div>

        {/* Form Fields */}
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
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="(323) 456-7899"
            className="w-full h-[56px] px-4 bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] text-white font-lato text-[16px] leading-[24px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={!phoneNumber}
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

