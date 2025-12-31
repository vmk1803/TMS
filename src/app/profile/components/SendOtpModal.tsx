"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { forgotPassword } from "../../login/service/login";

export default function SendOtpModal({ isOpen, onClose, onNext }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


  async function handleSendOtp() {
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Email required");
      return;
    }

    try {
      setSending(true);

      await forgotPassword(email);
      try { localStorage.setItem('password_reset_email', email); } catch {}
      setSuccess("OTP sent successfully");
      // Move to OTP entry screen via parent callback, pass the email
      onNext?.(email);
      // Close this modal so OTP modal can appear
      onClose?.();

    } catch (e: any) {
      setError(e?.message || "Failed to send OTP");
    } finally {
      setSending(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-[95%] md:w-[450px] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 bg-[#E6F5EC]">
              <h2 className="text-base font-semibold md:text-xl text-primaryText">
                Change Password
              </h2>
              <button onClick={onClose} className="text-gray-600">
                <X />
              </button>
            </div>

            {/* BODY */}
            <div className="p-6">
              <h3 className="text-center text-xl md:text-[32px] font-bold mb-4 text-primaryText">
                Change Password
              </h3>

              <label className="block mb-2 text-gray-700 font-medium">Email ID</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email"
                className="w-full mb-4 h-[50px] px-3 bg-[#F3F4F6] rounded-xl outline-none focus:ring-2 focus:ring-green-600"
              />

              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
              {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

              <button
                disabled={sending}
                onClick={handleSendOtp}
                className="w-full h-[50px] bg-green-600 text-white rounded-xl font-semibold disabled:opacity-60 hover:bg-green-700 transition-all"
              >
                {sending ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
