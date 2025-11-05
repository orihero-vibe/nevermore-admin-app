import { useState } from 'react';
import EditIcon from '../assets/icons/edit';
import { ChangeEmailModal } from '../components/ChangeEmailModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { ChangePhoneNumberModal } from '../components/ChangePhoneNumberModal';

export const Settings = () => {
  const [email, setEmail] = useState('adminname@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState('(123) 456-7890');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const handleEmailEdit = () => {
    setIsEmailModalOpen(true);
  };

  const handlePhoneEdit = () => {
    setIsPhoneModalOpen(true);
  };

  const handlePasswordEdit = () => {
    setIsPasswordModalOpen(true);
  };

  const handleEmailSave = (newEmail: string, currentPassword: string) => {
    // TODO: Implement API call to save email
    console.log('Saving email:', { newEmail, currentPassword });
    setEmail(newEmail);
  };

  const handlePasswordSave = (currentPassword: string, newPassword: string) => {
    // TODO: Implement API call to save password
    console.log('Saving password:', { currentPassword, newPassword });
  };

  const handlePhoneSave = (newPhoneNumber: string) => {
    // TODO: Implement API call to save phone number
    console.log('Saving phone number:', newPhoneNumber);
    setPhoneNumber(newPhoneNumber);
  };

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password page
    console.log('Forgot password clicked');
  };

  return (
    <div className="bg-neutral-950 min-h-screen p-8">
      {/* Page Title */}
      <h1 
        className="text-white text-[24px] leading-[normal] mb-8"
        style={{ fontFamily: 'Cinzel, serif', fontWeight: 400 }}
      >
        My Account
      </h1>

      {/* Profile Card */}
      <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[24px] p-8 w-[536px] flex flex-col items-center gap-16">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-2">
          {/* Avatar with Online Status */}
          <div className="relative">
            <div className="w-[120px] h-[120px] rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-4xl text-gray-400">
                S
              </span>
            </div>
            {/* Online Status Indicator */}
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-[#131313]"></div>
          </div>
          
          {/* Name */}
          <p 
            className="text-white text-[16px] leading-[24px] font-medium"
            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
          >
            Super Admin
          </p>
          
          {/* Account Created Date */}
          <p 
            className="text-[#8f8f8f] text-[12px] leading-[16px]"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Account Created: 06-15-2023
          </p>
        </div>

        {/* Account Information Section */}
        <div className="w-full flex flex-col gap-4">
          {/* Section Title */}
          <h2 
            className="text-white text-[16px] leading-[24px]"
            style={{ fontFamily: 'Cinzel, serif', fontWeight: 550 }}
          >
            Account Information
          </h2>

          {/* Form Fields */}
          <div className="flex flex-col gap-6">
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="email"
                className="text-white text-[14px] leading-[20px]"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Email
              </label>
              <div className="relative">
                <div className="w-full h-[56px] px-4 pr-12 bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] flex items-center relative">
                  <p className="flex-1 text-white font-lato text-[16px] leading-[24px]">
                    {email}
                  </p>
                  <button
                    onClick={handleEmailEdit}
                    className="absolute right-4 p-1 hover:opacity-70 transition"
                    aria-label="Edit email"
                  >
                    <EditIcon width={24} height={24} color="#fff" />
                  </button>
                </div>
              </div>
            </div>

            {/* Phone Number Field */}
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="phone"
                className="text-white text-[14px] leading-[20px]"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="w-full h-[56px] px-4 pr-12 bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] flex items-center relative">
                  <p className="flex-1 text-white font-lato text-[16px] leading-[24px]">
                    {phoneNumber}
                  </p>
                  <button
                    onClick={handlePhoneEdit}
                    className="absolute right-4 p-1 hover:opacity-70 transition"
                    aria-label="Edit phone number"
                  >
                    <EditIcon width={24} height={24} color="#fff" />
                  </button>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="password"
                className="text-white text-[14px] leading-[20px]"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Password
              </label>
              <div className="relative">
                <div className="w-full h-[56px] px-4 pr-12 bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] flex items-center relative">
                  <p className="flex-1 text-white font-lato text-[16px] leading-[24px]">
                    •••••••••
                  </p>
                  <button
                    onClick={handlePasswordEdit}
                    className="absolute right-4 p-1 hover:opacity-70 transition"
                    aria-label="Edit password"
                  >
                    <EditIcon width={24} height={24} color="#fff" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangeEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        currentEmail={email}
        onSave={handleEmailSave}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={handlePasswordSave}
        onForgotPassword={handleForgotPassword}
      />

      <ChangePhoneNumberModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        currentPhoneNumber={phoneNumber}
        onSave={handlePhoneSave}
      />
    </div>
  );
};

