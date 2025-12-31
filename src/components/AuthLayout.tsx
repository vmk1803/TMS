"use client";
import React from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#F7F9FB] grid grid-cols-1 md:grid-cols-[60%_30%] min-h-screen loginbg relative">
      {/* Left Section */}
{/* Left Section — visible only on lg (>=1024px) */}
<div className="hidden lg:flex flex-col justify-top w-[80%] mx-auto text-white relative overflow-hidden">
  <div className="z-10 flex flex-col items-left absolute top-[30%] left-[15%]">
    <h1 className="text-4xl font-semibold mb-3">Mobile Lab Xpress</h1>
    <div className="w-full">
      <p className="text-gray-200 leading-relaxed w-[90%] text-sm">
        Experience a unified platform that simplifies logistics, streamlines dispatch and routing, and optimizes fleet tracking to accelerate patient care.
      </p>
    </div>
  </div>

  <div className="absolute bottom-0 left-0 w-full flex justify-center pointer-events-none">
    <Image
      src="/images/dashboard/login_lab_image.png"
      alt="Lab illustration"
      width={1400}       
      height={440}
      priority           
      className="w-[85%] max-w-[1100px] object-contain -mb-6 opacity-50"
    />
  </div>
</div>

      <div className="flex items-center justify-center bg-[#F9FAFB] p-6">
        {children}
      </div>
    </div>
  );
}
