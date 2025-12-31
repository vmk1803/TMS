'use client'

import { useEffect, useState } from 'react'
import ProfileScreen from '../components/profile'
import { getUserById } from '../../records/users/services/viewUserService'

interface PageProps { params: { user: string } }

export default function DynamicProfilePage({ params }: PageProps) {
  const guid = params.user
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function fetchUser() {
      try {
        setLoading(true)
        const res = await getUserById(guid)
        if (!active) return
        const data = res?.data || res
        if (!data) {
          setError('User not found')
        } else {
          setUserData(data)
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load user')
      } finally {
        if (active) setLoading(false)
      }
    }
    if (guid) fetchUser()
    return () => { active = false }
  }, [guid])

  return <ProfileScreen userData={userData} loading={loading} error={error} />
}
