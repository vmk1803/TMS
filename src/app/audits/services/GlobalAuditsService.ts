import api from '../../../lib/api'

export async function getGlobalAudits(page: number, pageSize: number, filters?: Record<string, any>): Promise<any> {
  try {
    const payload: Record<string, any> = { page, pageSize, filters }
    const res = await api.post('/orders/getGlobalAudits', payload)
    return res.data
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Login failed'
    throw new Error(message)
  }
}
export function formatUTCToCSTString(dateInput: string | Date) {
  const date = new Date(dateInput);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const formatted = new Intl.DateTimeFormat("en-US", options).format(date);
  return formatted.replace(/\//g, "-").replace(",", "");
}
