"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { updatePassword } from "../../login/service/login";
import { CreateNewPasswordModalProps } from "../../../types/user";

export default function CreateNewPasswordModal({ isOpen, onClose, onSuccess, email: propEmail }: CreateNewPasswordModalProps) {
  const searchParams = useSearchParams();
  const initialEmail = propEmail || searchParams.get('email') || '';
  const [email, setEmail] = useState<string>(initialEmail);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (propEmail && propEmail !== email) {
      setEmail(propEmail);
      return;
    }
    if (!email) {
      const stored = localStorage.getItem('password_reset_email') || localStorage.getItem('resetEmail');
      if (stored) {
        setEmail(stored);
        return;
      }
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setEmail(u?.email || u?.user_email || '');
      }
    }
  }, [propEmail, email]);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    if (!email) { setError('Email missing'); return; }
    if (!password) { setError('Password required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    try {
      setLoading(true);
      await updatePassword(email, confirmPassword);
      setSuccess('Password updated successfully')
      // clearing the localstorage once the user moved to create new password after otp verification done by email
      localStorage.removeItem('password_reset_email');
      localStorage.removeItem('resetEmail');
      setTimeout(() => { onSuccess?.(); }, 400);
    } catch (e: any) {
      setError(e?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
          <motion.div className="bg-white w-[95%] md:w-[450px] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 bg-[#E6F5EC]">
              <h2 className="text-base font-semibold md:text-xl text-primaryText">Change Password</h2>
              <button onClick={onClose}>
                <X />
              </button>
            </div>

            <div className="p-8">
              <h3 className="text-center md:mb-6 text-xl font-bold mb-4 md:text-[32px] text-primaryText">Create New Password</h3>
              {!email && (
                <>
                  <label className="block mb-2 text-gray-700 font-medium">Email ID</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your Email"
                    className="w-full mb-4 h-[50px] px-3 bg-[#F3F4F6] rounded-xl outline-none focus:ring-2 focus:ring-green-600"
                  />
                </>
              )}
              <label className="block mb-2 text-gray-700 font-medium">Create Password</label>
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full h-[50px] px-3 pr-12 bg-[#F3F4F6] rounded-xl outline-none focus:ring-2 focus:ring-green-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <label className="block mb-2 text-gray-700 font-medium">Confirm Password</label>
              <div className="relative mb-6">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full h-[50px] px-3 pr-12 bg-[#F3F4F6] rounded-xl outline-none focus:ring-2 focus:ring-green-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
              {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-[50px] bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl hover:bg-green-700 transition-all"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
