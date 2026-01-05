"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

export type OptionType = {
    label: string;
    value: string;
};

type Props = {
    label: string;
    value: string;
    options: OptionType[];
    onChange: (value: string) => void;
    required?: boolean;
    disabled?: boolean;
    searchable?: boolean;
};

const CustomSelect: React.FC<Props> = ({
    label,
    value,
    options,
    onChange,
    required,
    disabled,
    searchable = false,
}) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        onChange("");
    };

    const handleSelect = (val: string) => {
        if (disabled) return;
        onChange(val);
        setOpen(false);
        setSearchTerm("");
    };

    // Filter options based on search term
    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
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

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm text-primaryText mb-2 font-medium">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {/* Input box */}
            <div
                onClick={() => !disabled && setOpen(!open)}
                className={`w-full bg-formBg border border-formBorder rounded-2xl px-3 py-2 flex items-center justify-between ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-green-600'}`}>
                <span className={value ? "text-primaryText" : "text-gray-400"}>
                    {value ? options.find((o) => o.value === value)?.label : "Select"}
                </span>

                <div className="flex items-center gap-2">
                    {value && !disabled && (
                        <X
                            size={16}
                            className="text-gray-500 hover:text-red-500 cursor-pointer"
                            onClick={handleClear}
                        />
                    )}
                    <ChevronDown
                        size={18}
                        className={`transition-transform ${open ? "rotate-180 text-green-600" : "text-gray-500"
                            }`}
                    />
                </div>
            </div>

            {/* Dropdown items */}
            {open && !disabled && (
                <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                    {searchable && (
                        <div className="p-2 border-b border-gray-200">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600"
                                autoFocus
                                autoComplete="off"
                            />
                        </div>
                    )}
                    {filteredOptions.length === 0 ? (
                        <div className="flex items-center justify-center h-20 text-sm text-gray-500">
                            No data found
                        </div>
                    ) : (
                        filteredOptions.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`px-4 py-2 cursor-pointer text-sm hover:bg-lightGreen hover:text-secondary ${value === opt.value
                                        ? "bg-lightGreen text-secondary font-medium"
                                        : ""
                                    }`}
                            >
                                {opt.label}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
