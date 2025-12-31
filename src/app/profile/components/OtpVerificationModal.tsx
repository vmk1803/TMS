"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { forgotPassword, verifyOTP } from "../../login/service/login";
import { OtpVerificationModalProps } from "../../../types/user";

export default function OtpVerificationModal({ isOpen, onClose, onNext, email }: OtpVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [effectiveEmail, setEffectiveEmail] = useState<string>(email || "");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (email) setEffectiveEmail(email);
  }, [email]);

  useEffect(() => {
    if (isOpen) {
      if (!effectiveEmail) {
        const stored =
          localStorage.getItem("password_reset_email") ||
          localStorage.getItem("resetEmail");
        if (stored) setEffectiveEmail(stored);
        else {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const u = JSON.parse(userStr);
            setEffectiveEmail(u?.email || u?.user_email || "");
          }
        }
      }

      setDigits(Array(6).fill(""));
      setError(null);
      setSuccess(null);

      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 20);
    }
  }, [isOpen, effectiveEmail]);

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChangeDigit = (idx: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const char = value.slice(-1);

    const next = [...digits];
    next[idx] = char;
    setDigits(next);

    if (char && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "Enter") handleVerify();
  };

  async function handleVerify() {
    setError(null);
    setSuccess(null);

    const code = digits.join("");
    if (code.length !== 6) return setError("Enter 6-digit code");
    if (!effectiveEmail) return setError("Email missing");

    try {
      setVerifying(true);
      await verifyOTP(effectiveEmail, code);
      setSuccess("Code verified");

      onNext?.(effectiveEmail);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return; //block repeated spam clicks

    setError(null);
    setSuccess(null);

    if (!effectiveEmail) return setError("Email missing");

    try {
      setResending(true);
      await forgotPassword(effectiveEmail);
      setSuccess("OTP resent");

      setDigits(Array(6).fill(""));
      inputsRef.current[0]?.focus();

      startCooldown(60); // start cooldown
    } catch (e: any) {
      setError(e?.message || "Failed to resend");
    } finally {
      setResending(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
          <motion.div className="bg-white w-[95%] md:w-[450px] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 bg-[#E6F5EC]">
              <h2 className="text-base font-semibold md:text-xl text-primaryText">
                Change Password
              </h2>
              <button onClick={onClose}>
                <X />
              </button>
            </div>

            <div className="p-8 text-center">
              <h3 className="text-center md:mb-6 text-xl font-bold mb-4 md:text-[32px] text-primaryText">
                Verification Code
              </h3>
              <p className="text-gray-600">We have sent the verification code to your Email</p>

              <div className="flex justify-center gap-3 mt-6">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { inputsRef.current[i] = el; }}
                    value={d}
                    onChange={(e) => handleChangeDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    maxLength={1}
                    inputMode="numeric"
                    className="w-12 h-12 border rounded-xl text-center text-lg outline-none focus:ring-2 focus:ring-green-600"
                  />
                ))}
              </div>

              {error && <div className="mt-4 text-xs text-red-600">{error}</div>}
              {success && <div className="mt-4 text-xs text-green-600">{success}</div>}

              <button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full h-[50px] bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl hover:bg-green-700 transition-all mt-4"
              >
                {verifying ? "Verifying..." : "Submit"}
              </button>

              <button
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="text-green-700 text-sm mt-4 disabled:opacity-60"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Resending..." : "Resend Code"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
