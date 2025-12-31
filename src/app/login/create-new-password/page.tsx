import { Suspense } from "react";
import CreateNewPasswordForm from "./CreateNewPassword";

export default function Page() {
  return (
    <Suspense fallback={<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />}>
      <CreateNewPasswordForm />
    </Suspense>
  );
}
