import { useState } from 'react'
import { updatePartner } from '../services/partnersService'

export const useUpdatePartner = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const update = async (guid: string, payload: any) => {
        setLoading(true)
        setError(null)
        try {
            const res = await updatePartner(guid, payload)
            if (res.success === false) {
                throw new Error(res.message || 'Failed to update partner')
            }
            return res
        } catch (err: any) {
            setError(err.message || 'An error occurred')
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { update, loading, error }
}
