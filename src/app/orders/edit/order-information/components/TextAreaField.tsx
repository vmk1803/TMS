"use client";
import React from "react";

interface BaseFieldProps {
  label: string;
  required?: boolean;
  colspan?: string;
}

export const TextAreaField: React.FC<BaseFieldProps> = ({
  label,
  required,
  colspan = "",
}) => {
  return (
    <div className={colspan}>
      <label className="block text-sm text-primaryText mb-2 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <textarea
        rows={3}
        placeholder="Important warning or special instructions..."
        className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-3
        text-sm text-primaryText focus:border-green-600 resize-none"
      />
    </div>
  );
};
