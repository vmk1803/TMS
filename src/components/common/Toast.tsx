"use client";
import React, { useEffect } from "react";

interface ToastProps {
  open: boolean;
  type?: "success" | "error" | "info";
  message: string;
  onClose: () => void;
  durationMs?: number;
  offsetY?: number; // NEW  Controls how high/low toast appears
}

const Toast: React.FC<ToastProps> = ({
  open,
  type = "success",
  message,
  onClose,
  durationMs = 3000,
  offsetY = 80,
}) => {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [open, durationMs, onClose]);

  if (!open) return null;

  const bg =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-400"
      : "bg-gray-800";

  return (
    <div
      className="fixed right-5 z-[10000]"
      style={{ top: offsetY }}  //  Controls UP/DOWN position
    >
      <div className={`${bg} text-white px-5 py-4 rounded-lg shadow-lg text-base`}>
        {message}
      </div>
    </div>
  );
};

export default Toast;
