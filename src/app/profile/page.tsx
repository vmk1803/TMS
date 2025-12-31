'use client';
import React, { useEffect, useState } from "react";
import ProfilePage from "./components/profile";
import { useSearchParams } from 'next/navigation';
import { getUserById } from '../records/users/services/viewUserService';

export default function ProfileScreen() {
  const searchParams = useSearchParams();
  const paramGuid = searchParams.get('user');

  const [guid, setGuid] = useState<string | null>(paramGuid);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (guid) return;
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        const fallbackGuid = parsed.guid || parsed.user_guid || parsed.id || parsed.user_id || parsed.user?.guid;
        if (fallbackGuid) {
          setGuid(fallbackGuid);
          return;
        }
      }
      setError('User GUID not found');
      setLoading(false);
    } catch {
      setError('Corrupted user data');
      setLoading(false);
    }
  }, [guid]);

  useEffect(() => {
    function handleUserUpdated(e: any) {
      const detail = e?.detail;
      if (!detail || typeof detail !== 'object') return;
      const updatedGuid = detail.guid || detail.user_guid || detail.id || detail.user_id;
      if (updatedGuid && (!guid || updatedGuid === guid)) {
        setGuid(updatedGuid);
        setUserData(detail);
        setLoading(false);
        setError(null);
      }
    }
    window.addEventListener('user-updated', handleUserUpdated);
    return () => window.removeEventListener('user-updated', handleUserUpdated);
  }, [guid]);

  useEffect(() => {
    if (!guid) return;

    let active = true;

    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await getUserById(guid);
        const data = res?.data ?? res;

        if (!active) return;

        if (!data) setError("User not found");
        else setUserData(data);
      } catch (err: any) {
        if (active) setError(err?.message || "Error fetching user");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProfile();

    return () => { active = false };
  }, [guid]);

  return <ProfilePage userData={userData} loading={loading} error={error} />;
}
