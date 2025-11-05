import React, { useState, useRef, useEffect } from 'react';
import ChevronDownIcon from '../assets/icons/chevron-down';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[56px] px-4 bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] flex items-center justify-between gap-3 hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <span className={`font-lato text-[16px] leading-[24px] ${
          selectedOption ? 'text-white' : 'text-[#616161]'
        }`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          width={24}
          height={24}
          color="#fff"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition font-lato text-[16px] ${
                value === option.value ? 'bg-gray-800' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

