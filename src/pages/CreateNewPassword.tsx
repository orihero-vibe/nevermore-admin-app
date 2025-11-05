import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authBg from '../assets/images/auth-bg.png';
import { PasswordInput } from '../components/PasswordInput';
import { Button } from '../components/Button';
import CheckSmallIcon from '../assets/icons/check-small';

interface ValidationRule {
  id: string;
  label: string;
  validate: (password: string, confirmPassword: string) => boolean;
}

const validationRules: ValidationRule[] = [
  {
    id: 'capital',
    label: 'At least 1 capital letter',
    validate: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'number',
    label: 'At least 1 numerical value',
    validate: (password) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    label: 'At least 1 special character',
    validate: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
  {
    id: 'match',
    label: 'Passwords match',
    validate: (password, confirmPassword) => password === confirmPassword && password.length > 0,
  },
];

export const CreateNewPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all validations pass
    const allValid = validationRules.every((rule) =>
      rule.validate(newPassword, confirmPassword)
    );

    if (!allValid) {
      return;
    }

    // TODO: Implement password reset logic
    console.log('Password reset:', { newPassword, confirmPassword });
    // Navigate to sign in page after successful password reset
    navigate('/signin');
  };

  const getValidationStatus = (rule: ValidationRule) => {
    return rule.validate(newPassword, confirmPassword);
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
          <div className="flex flex-col gap-8">
            {/* Title */}
            <h1 className="text-2xl font-normal text-white tracking-wide">
              Create new password
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* New Password Field */}
              <div className="flex flex-col gap-2">
                <PasswordInput
                  id="new-password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>

              {/* Re-enter Password Field */}
              <div className="flex flex-col gap-2">
                <PasswordInput
                  id="confirm-password"
                  label="Re-enter Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>

              {/* Validation Checklist */}
              <div className="flex flex-col gap-1 px-4 py-0">
                {validationRules.map((rule) => {
                  const isValid = getValidationStatus(rule);
                  return (
                    <div key={rule.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                        {isValid && (
                          <CheckSmallIcon
                            width={16}
                            height={12}
                            color="#965cdf"
                          />
                        )}
                      </div>
                      <p
                        className={`text-sm font-normal ${
                          isValid ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        {rule.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <Button type="submit" fullWidth>
                Submit
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

