import { Suspense } from "react";
import OTPVerificationForm from "./OtpVerificationForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />}>
      <OTPVerificationForm />
    </Suspense>
  );
}
