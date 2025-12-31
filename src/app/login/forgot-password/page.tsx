"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../../../components/AuthLayout";
import Image from "next/image";
import { forgotPassword } from "../service/login";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  async function handleSendOtp() {
    setError(null);
    setSuccess(null);
    if (!email) {
      setError('Email required');
      return;
    }
    try {
      setSending(true);
      await forgotPassword(email);
      setSuccess('OTP sent successfully');
      // Navigate to OTP verification after short delay or immediately
      router.push(`/login/otp-verification?email=${encodeURIComponent(email)}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to send OTP');
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthLayout>
      <div className="bg-white border border-[#BDE2CA] p-8 rounded-[32px] shadow-md w-full max-w-md relative z-10">
        <Image src={'/images/dashboard/login-logo.png'} width={300} height={50} alt="Mobile Lab Xpress Logo" className="mx-auto mb-2 object-contain" />
        <p className="text-center text-[24px] text-[#344256] font-bold mb-8">Forgot Password</p>

        <label className="block mb-2 text-[#344256] text-sm font-normal">Email ID</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your Email"
          className="w-full mb-4 h-[45px] px-3 bg-[#F8FAFC] border border-[#ACB5BD] rounded-2xl outline-none focus:ring-1 focus:ring-green-600"
        />

        <button
          onClick={handleSendOtp}
          disabled={sending}
          className="w-full h-[45px] bg-[#009728] rounded-[32px] disabled:opacity-60 text-white font-semibold hover:bg-[#009728] transition-all shadow-[0_4px_24px_rgba(47,170,80,0.30)]"
        >
          {sending ? 'Sending...' : 'Send OTP'}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-3 text-sm text-green-600">{success}</p>}

        <div
          className="text-center text-sm text-[#009728] mt-4 cursor-pointer"
          onClick={() => router.push("/")}
        >
          Login
        </div>
      </div>
    </AuthLayout>
  );
}
