"use client";

import { useState } from "react";
import { getPhysicianByNpi } from "../../services/physiciansService";

export function useNpiVerification() {
  const [npi, setNpi] = useState("");
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fields, setFields] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    specialization: "",
  });

  const updateField = (key: string, value: any) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const resetVerification = () => {
    setRes(null)
    setFields({
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      country: "",
      zip: "",
      specialization: "",
    })
    setError(null)
    setLoading(false)
    setNpi("")
  }

  const verifyNpi = async (npiArg?: string) => {
    const npiToUse = typeof npiArg === 'string' ? npiArg : npi
    if (!npiToUse || npiToUse.length !== 10) return

    try {
      setLoading(true)
      setError(null)

      const response = await getPhysicianByNpi(npiToUse)
      const payload = response?.data ?? response
      setRes(payload)

      const data = payload?.data ?? payload
      if (!data) return

      const basic = data.basic ?? data
      const addresses = data.addresses || []
      const practice = data.practiceLocations || []

      const addr =
        (addresses.find && addresses.find((a: any) => a.address_purpose === 'LOCATION')) ||
        (addresses.find && addresses.find((a: any) => a.address_purpose === 'MAILING')) ||
        (practice && practice[0]) ||
        {}

      const taxonomy =
        (data.taxonomies && (data.taxonomies.find((t: any) => t.primary) || data.taxonomies[0])) || {}

      updateField('firstName', basic?.first_name || '')
      updateField('middleName', basic?.middle_name || '')
      updateField('lastName', basic?.last_name || '')
      updateField('phone_number', (addr?.telephone_number || '').replace(/\D/g, ''))
      updateField('address1', addr?.address_1 || '')
      updateField('address2', addr?.address_2 || '')
      updateField('city', addr?.city || '')
      updateField('state', addr?.state || '')
      updateField('country', addr?.country_name || '')
      updateField('zip', addr?.postal_code || '')
      updateField('specialization', taxonomy?.desc || data.specialization || '')
    } catch (e: any) {
      setError('Failed to verify NPI')
    } finally {
      setLoading(false)
    }
  }

  return {npi,setNpi,loading,error,res,fields,verifyNpi,resetVerification,};
}
