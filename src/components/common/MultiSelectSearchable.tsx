"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search } from "lucide-react";

export type OptionType = {
    label: string;
    value: string;
};

type Props = {
    label: string;
    value: string[];
    options: OptionType[];
    onChange: (value: string[]) => void;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
};

const MultiSelectSearchable: React.FC<Props> = ({
    label,
    value,
    options,
    onChange,
    required,
    disabled,
    placeholder = "Search and select...",
}) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter options based on search term and exclude already selected
    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !value.includes(opt.value)
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Reset search when dropdown opens/closes
    useEffect(() => {
        if (!open) {
            setSearchTerm("");
        }
    }, [open]);

    const handleSelect = (val: string) => {
        if (disabled) return;
        if (!value.includes(val)) {
            onChange([...value, val]);
        }
    };

    const handleRemove = (val: string) => {
        if (disabled) return;
        onChange(value.filter(v => v !== val));
    };

    const selectedLabels = value.map(v => options.find(opt => opt.value === v)?.label).filter(Boolean);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm text-primaryText mb-2 font-medium">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {/* Selected items as pills */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {value.map((val) => {
                        const option = options.find(opt => opt.value === val);
                        return option ? (
                            <span
                                key={val}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
                            >
                                {option.label}
                                <button
                                    onClick={() => handleRemove(val)}
                                    className="hover:bg-secondary/20 rounded-full p-0.5"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ) : null;
                    })}
                </div>
            )}

            {/* Input box */}
            <div
                onClick={() => !disabled && setOpen(!open)}
                className={`w-full bg-formBg border border-formBorder rounded-2xl px-3 py-2 flex items-center justify-between cursor-pointer hover:border-green-600 ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
            >
                <span className={value.length ? "text-primaryText" : "text-gray-400"}>
                    {value.length ? `${value.length} selected` : placeholder}
                </span>

                <ChevronDown
                    size={18}
                    className={`transition-transform ${open ? "rotate-180 text-green-600" : "text-gray-500"}`}
                />
            </div>

            {/* Dropdown items */}
            {open && !disabled && (
                <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full text-gray-400 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600"
                                autoFocus
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="max-h-64 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="flex items-center justify-center h-20 text-sm text-gray-500">
                                {searchTerm ? "No matching options" : "All users selected"}
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className="px-4 py-2 cursor-pointer text-sm hover:bg-lightGreen hover:text-secondary"
                                >
                                    {opt.label}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelectSearchable;
