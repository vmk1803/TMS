"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import UserDetailsPage from "./components/UserDetailsPage";
import { getUserById } from "../services/viewUserService";

export default function Page() {
  const search = useSearchParams();
  const userId = search.get("user");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    (async () => {
      try {
        const res = await getUserById(userId);
        setUserData(res?.data || res);
      } catch (e: any) {
        setError(e?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (!userId) return <div className="p-4">No user id provided.</div>;
  if (loading) return <div className="p-4">Loading user...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!userData) return <div className="p-4">No user data found.</div>;

  return <UserDetailsPage userId={userId} userData={userData} />;
}
