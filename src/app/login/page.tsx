"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../../components/AuthLayout";
import Image from "next/image";
import { login } from "../../components/services/authService";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Email and password required");
      return;
    }
    try {
      setLoading(true);
      const res = await login(email, password, 'web');
      const token = res.data.accessToken;
      const user = res.data.user;
      if (token) {
        localStorage.setItem("authToken", token);
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.setItem("user", JSON.stringify(res.data));
      }

      // First login redirect
      if (user?.login_count === 1) {
        router.push(`/login/create-new-password?email=${encodeURIComponent(email)}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#BDE2CA] p-8 rounded-[32px] shadow-md w-full max-w-md relative z-10"
      >
        <Image
          src="/images/dashboard/login-logo.png"
          width={300}
          height={40}
          alt="Mobile Lab Xpress Logo"
          className="mx-auto mb-2 object-contain"
        />

        <p className="text-center text-[#65758B] text-lg mt-4">Welcome to Mobile Lab Xpress</p>
        <h3 className="text-center text-[24px] text-[#344256] font-bold mb-8">Sign in</h3>



        {/* Email Field */}
        <label className="block mb-2 text-[#344256] text-sm font-normal">Email ID</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your Email"
          className="w-full mb-4 h-[45px] px-3 bg-[#F8FAFC] border border-[#ACB5BD] rounded-2xl outline-none focus:ring-1 focus:ring-green-600"
          {...({} as any)}
          suppressHydrationWarning={true}
          autoComplete="off"
        />

        {/* Password Field */}
        <label className="block mb-2 text-[#344256] text-sm font-normal">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your Password"
            className="w-full mb-2 h-[45px] px-3 bg-[#F8FAFC] border border-[#ACB5BD] rounded-2xl outline-none focus:ring-1 focus:ring-green-600"
            {...({} as any)}
            suppressHydrationWarning={true}
            autoComplete="off"
          />

          {/* Show / Hide Password Button */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[25px] -translate-y-1/2 text-gray-600 hover:text-gray-800"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        {/* Forgot Password */}
        <div
          className="text-right text-sm text-[#009728] mb-6 cursor-pointer"
          onClick={() => router.push("/login/forgot-password")}
        >
          Forgot Password?
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[45px] bg-[#009728] rounded-[32px] disabled:opacity-60 text-white font-semibold hover:bg-[#009728] transition-all shadow-[0_4px_24px_rgba(47,170,80,0.30)]"
        >
          {loading ? "Verifying..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}
