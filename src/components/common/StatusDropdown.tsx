"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { X, Check } from "lucide-react";

interface StatusDropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  dropdownWidth?: number;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  value,
  options,
  onChange,
  placeholder = "Select",
  className = "",
  disabled = false,
  dropdownWidth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Toggle dropdown */
  const handleToggle = () => {
    if (disabled) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  /* Select item */
  const handleSelect = (selected: string) => {
    onChange(selected === value ? "" : selected);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const selectedOption = options.find((o) => o === value);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={disabled}
        className={`rounded-full font-normal px-3 py-1.5 w-full text-sm bg-white
                    border border-gray-300 text-left flex items-center justify-between
                    focus:outline-none appearance-none 
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="truncate">{selectedOption || placeholder}</span>

        {/* Clear or arrow */}
        {value && !disabled ? (
          <X
            className="w-3 h-3 text-gray-400 hover:text-gray-600 flex-shrink-0"
            onClick={handleClear}
          />
        ) : (
          <svg
            className="w-3 h-3 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {isOpen &&
        position &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
              width: dropdownWidth ? dropdownWidth : position.width,   
            }}
            className="z-[99999] bg-white border border-gray-200 
                       rounded-xl shadow-lg max-h-64 overflow-y-auto 
                       min-w-[150px] py-1"
          >
            {options.map((opt) => {
              return (
                <div
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className="px-3 py-2 text-sm flex items-center 
                             gap-3 hover:bg-green-50 cursor-pointer"
                >
                  <span className="text-gray-700">{opt}</span>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};

export default StatusDropdown;