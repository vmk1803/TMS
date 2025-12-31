"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserById } from "../../services/viewUserService";
import CreateUserForm from "../../new/components/CreateUserForm";

export default function EditUserPage() {
  const { guid } = useParams() as { guid?: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!guid) { setError("Missing user id"); setLoading(false); return; }
      try {
        setLoading(true);
        const res = await getUserById(guid);
        // API returns res.data? Inspect usage; fallback to res.
        const candidate = (res?.data) || res;
        setUser(candidate);
      } catch (e: any) {
        setError(e?.message || "Failed to load user");
      } finally { setLoading(false); }
    }
    fetchUser();
  }, [guid]);

  if (loading) return <div className="p-6">Loading user...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">User not found.</div>;

  return (
    <div className="p-4">
      <CreateUserForm mode="edit" initialUser={user} onCancel={() => router.back()} />
    </div>
  );
}
