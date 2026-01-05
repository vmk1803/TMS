import React, { useState, useRef, useCallback, useLayoutEffect, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Check, ChevronDown } from 'lucide-react';

interface StatusFilterDropdownProps {
    selectedStatuses: string[];
    onChange: (statuses: string[]) => void;
    options?: string[];
}

const DEFAULT_OPTIONS = ["PERFORMED", "DELIVERED TO LAB", "ARRIVED"];

const StatusFilterDropdown: React.FC<StatusFilterDropdownProps> = ({
    selectedStatuses,
    onChange,
    options = DEFAULT_OPTIONS,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);

    const computeAndSetPosition = useCallback(() => {
        if (!buttonRef.current) return;
        const triggerRect = buttonRef.current.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;

        const dd = dropdownRef.current;
        const ddWidth = dd ? dd.offsetWidth : 200;
        const ddHeight = dd ? dd.offsetHeight : 200;

        const space = {
            top: triggerRect.top,
            bottom: viewportH - triggerRect.bottom,
            left: triggerRect.left,
            right: viewportW - triggerRect.right,
        };

        let top = 0;
        if (space.bottom >= ddHeight + 8) {
            top = triggerRect.bottom + 6;
        } else if (space.top >= ddHeight + 8) {
            top = triggerRect.top - ddHeight - 6;
        } else {
            if (space.bottom >= space.top) {
                top = triggerRect.bottom + 6;
                const maxTop = viewportH - ddHeight - 8;
                top = Math.min(top, maxTop);
            } else {
                top = Math.max(8, triggerRect.top - ddHeight - 6);
            }
        }

        const triggerCenterX = triggerRect.left + triggerRect.width / 2;
        let left = Math.round(triggerCenterX - ddWidth / 2);
        const minLeft = 8;
        const maxLeft = Math.max(8, viewportW - ddWidth - 8);
        left = Math.min(Math.max(left, minLeft), maxLeft);

        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;
        setPosition({
            top: Math.round(top + scrollY),
            left: Math.round(left + scrollX),
            width: Math.max(ddWidth, triggerRect.width),
        });
    }, []);

    useLayoutEffect(() => {
        if (!isOpen) return;
        const handleChange = () => computeAndSetPosition();
        window.addEventListener('resize', handleChange, { passive: true });
        window.addEventListener('scroll', handleChange, { passive: true });

        let ro: ResizeObserver | null = null;
        try {
            ro = new ResizeObserver(() => handleChange());
            if (dropdownRef.current) ro.observe(dropdownRef.current);
        } catch (err) { }

        handleChange();

        return () => {
            window.removeEventListener('resize', handleChange);
            window.removeEventListener('scroll', handleChange);
            if (ro && dropdownRef.current) ro.unobserve(dropdownRef.current);
        };
    }, [isOpen, computeAndSetPosition]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-52" ref={buttonRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between rounded-full border border-gray-200 bg-white px-4 py-2 text-sm cursor-pointer"
            >
                <span className="text-[#344256] uppercase truncate">
                    {selectedStatuses.length === 0
                        ? "SELECT"
                        : selectedStatuses.length === 1
                            ? selectedStatuses[0]
                            : `${selectedStatuses[0]} +${selectedStatuses.length - 1}`}
                </span>

                <div className="flex items-center gap-1">
                    {selectedStatuses.length > 0 && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange([]);
                            }}
                            className="p-0.5 hover:bg-gray-100 rounded-full cursor-pointer"
                        >
                            <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                        </div>
                    )}
                    <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                </div>
            </div>

            {isOpen && position && ReactDOM.createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        top: position.top,
                        left: position.left,
                        width: position.width,
                    }}
                    className="z-[99999] rounded-2xl bg-white border border-gray-100 shadow-xl max-h-64 overflow-y-auto py-3 scrollbar-custom"
                >
                    <ul className="space-y-1 px-3">
                        {options.map((status, i) => {
                            const isSelected = selectedStatuses.includes(status);
                            return (
                                <li
                                    key={i}
                                    onClick={() => {
                                        const newStatuses = isSelected
                                            ? selectedStatuses.filter((s) => s !== status)
                                            : [...selectedStatuses, status];
                                        onChange(newStatuses);
                                    }}
                                    className="cursor-pointer rounded-md px-3 py-2 text-sm text-[#344256] hover:bg-[#EDF3EF] flex items-center gap-2"
                                >
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    {status}
                                </li>
                            );
                        })}
                    </ul>
                </div>,
                document.body
            )}
        </div>
    );
};

export default StatusFilterDropdown;
