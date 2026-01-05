"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "../../../components/AuthLayout";
import Image from "next/image";
import { updatePassword } from "../service/login";
import { Eye, EyeOff } from "lucide-react";

export default function CreateNewPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get("email") || "";
  const [email] = useState<string>(initialEmail);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);

    if (!email) return setError("Email missing");
    if (!password) return setError("Password required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");

    try {
      setLoading(true);
      await updatePassword(email, confirmPassword);
      setSuccess("Password updated successfully");
      setTimeout(() => router.push("/login/success"), 350);
    } catch (e: any) {
      setError(e?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="bg-white border border-[#BDE2CA] p-8 rounded-[32px] shadow-md w-full max-w-md relative z-10">
        <Image
          src={"/images/dashboard/login-logo.png"}
          width={300}
          height={50}
          alt="Mobile Lab Xpress Logo"
          className="mx-auto mb-8 object-contain"
        />

        <p className="text-center text-[24px] text-[#344256] font-bold mb-4">Create New Password</p>

        <label className="block text-[#344256] text-sm font-normal mb-2">Create Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-full mb-4 h-[45px] px-3 bg-[#F8FAFC] border border-[#ACB5BD] rounded-2xl outline-none focus:ring-1 focus:ring-green-600"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[25px] -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <label className="block text-[#344256] text-sm font-normal mb-2">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full mb-8 h-[45px] px-3 bg-[#F8FAFC] border border-[#ACB5BD] rounded-2xl outline-none focus:ring-1 focus:ring-green-600"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[25px] -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-[45px] bg-[#009728] rounded-[32px] disabled:opacity-60 text-white font-semibold hover:bg-[#009728] transition-all shadow-[0_4px_24px_rgba(47,170,80,0.30)]"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
        {success && <p className="mt-4 text-sm text-green-600 text-center">{success}</p>}
      </div>
    </AuthLayout>
  );
}
