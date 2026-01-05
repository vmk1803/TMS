"use client";
import React, { useRef, useState, useEffect } from "react";
import { ExtendedProps, UploadProfilePictureProps } from "../../../../../types/user";

const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const maxSizeMB = 10;


const UploadProfilePicture: React.FC<ExtendedProps> = ({ onSelect, initialUrl, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
  const [error, setError] = useState<string>("");

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const selected = e.target.files?.[0];
    setError("");

    if (!selected) return;

    if (!allowedTypes.includes(selected.type)) {
      setError("Only PNG, JPG, JPEG, WEBP files are allowed.");
      setTimeout(() => setError(""), 5000);
      return;
    }
    if (selected.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB.`);
      setTimeout(() => setError(""), 5000);
      return;
    }
    setFile(selected);
    if (onSelect) onSelect(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };
  const handleRemove = () => {
    if (disabled) return;
    setFile(null);
    if (onSelect) onSelect(null);
    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className={`bg-white rounded-2xl p-2 w-full max-w-sm ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}>
      <h3 className="text-lg font-semibold text-primaryText mb-3">
        Upload Profile Picture
      </h3>

      {/* Upload Box */}
      <div
        onClick={!previewUrl ? handleClick : undefined}
        className={`cursor-pointer border-2 border-dashed ${previewUrl ? "border-green-600" : "border-gray-300"
          } hover:border-green-600 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 transition relative`}
      >
        {/* Preview */}
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover border"
            />

            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 bg-white shadow-md rounded-full p-1 hover:bg-red-600 hover:text-white transition"
            >
              ✕
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="34"
              height="34"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="#009728"
                strokeWidth="2"
                d="M12 16V8m0 0l-4 4m4-4l4 4m5 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2"
              />
            </svg>
          </div>
        )}

        {!previewUrl && (
          <>
            <p className="text-sm text-gray-700 font-medium">Click to upload</p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, JPEG, WEBP — Max {maxSizeMB}MB
            </p>
          </>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFile}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>
      )}
    </div>
  );
};

export default UploadProfilePicture;
