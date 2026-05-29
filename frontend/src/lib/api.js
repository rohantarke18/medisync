// src/lib/api.js — typed API client

const BASE = import.meta.env.VITE_API_URL || '/api'

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  // Stats
  getStats: () => req('GET', '/stats'),

  // Patients
  getPatients: (q = '') => req('GET', `/patients${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getPatient: (id) => req('GET', `/patients/${id}`),
  addPatient: (data) => req('POST', '/patients', data),
  updatePatient: (id, data) => req('PUT', `/patients/${id}`, data),

  // Records
  getRecords: (pid) => req('GET', `/patients/${pid}/records`),
  addRecord: (pid, data) => req('POST', `/patients/${pid}/records`, data),
  deleteRecord: (rid) => req('DELETE', `/records/${rid}`),

  // Bills
  getBills: (pid) => req('GET', `/patients/${pid}/bills`),
  addBill: (pid, data) => req('POST', `/patients/${pid}/bills`, data),
  updateBillStatus: (bid, status) => req('PUT', `/bills/${bid}/status`, { status }),
}
