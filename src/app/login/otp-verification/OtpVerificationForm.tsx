"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "../../../components/AuthLayout";
import { forgotPassword, verifyOTP } from "../service/login";
import Image from "next/image";

export default function OTPVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get("email") || "";
  const [email] = useState(initialEmail);

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    inputsRef.current = Array.from({ length: 6 }, () => null as any);

    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 20);
  }, []);

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
    if (!/^[0-9]?$/.test(value)) return;

    const next = [...digits];
    next[idx] = value;
    setDigits(next);

    if (value && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      const prevIdx = idx - 1;

      const next = [...digits];
      next[prevIdx] = "";
      setDigits(next);

      inputsRef.current[prevIdx]?.focus();
    }
  };

  async function handleVerify() {
    setError(null);
    setSuccess(null);

    const code = digits.join("");

    if (code.length !== 6) {
      setError("Enter 6-digit code");
      return;
    }

    if (!email) {
      setError("Email missing");
      return;
    }

    try {
      setVerifying(true);
      await verifyOTP(email, code);
      setSuccess("Code verified");
      router.push(`/login/create-new-password?email=${encodeURIComponent(email)}`);
    } catch (e: any) {
      setError(e?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return; //block repeated clicks

    if (!email) {
      setError("Email missing");
      return;
    }

    try {
      setResending(true);
      await forgotPassword(email);
      setSuccess("OTP resent");
      setDigits(Array(6).fill(""));
      inputsRef.current[0]?.focus();

      startCooldown(60); //30 sec cooldown
    } catch (e: any) {
      setError(e?.message || "Failed to resend");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout>
      <div className="bg-white border border-[#BDE2CA] p-8 rounded-[32px] shadow-md w-full max-w-md relative z-10">
       <Image src={'/images/dashboard/login-logo.png'} width={300} height={50} alt="Mobile Lab Xpress Logo" className="mx-auto object-contain mb-8" />
        <p className="text-center text-[24px] text-[#344256] font-bold mb-2">Verification Code</p>
        <p className="text-center text-[#65758B] font-normal leading-tight text-md mb-6">
          We have sent a verification <br /> code to your Email ID
        </p>

        <div className="flex justify-between gap-2 mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el!;
              }}
              value={d}
              onChange={(e) => handleChangeDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              className="w-[50px] h-[50px] text-center text-lg font-semibold border rounded-[20px] border-[#7A8DA7] focus:ring-2 focus:ring-green-600 outline-none"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={verifying}
          className="w-full h-[45px] bg-[#009728] rounded-[32px] disabled:opacity-60 text-white font-semibold hover:bg-[#009728] transition-all shadow-[0_4px_24px_rgba(47,170,80,0.30)]"
        >
          {verifying ? "Verifying..." : "Submit"}
        </button>

        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
        {success && <p className="mt-4 text-sm text-green-600 text-center">{success}</p>}

        <div
          className={`text-center text-sm mt-4 cursor-pointer ${
            cooldown > 0 ? "opacity-40 cursor-not-allowed" : "text-[#009728]"
          }`}
          onClick={handleResend}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
        </div>
      </div>
    </AuthLayout>
  );
}
