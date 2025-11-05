import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-gray-200 text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full h-[56px] px-4 bg-[#131313] border ${
          error ? 'border-red-500' : className.includes('border-') ? '' : 'border-gray-700'
        } ${className.includes('border-') ? className : ''} rounded-[16px] text-white placeholder-[#616161] font-lato text-[16px] leading-[24px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

