// src/pages/DoctorDashboard.jsx
import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { Sidebar } from '../components/Sidebar'
import { StatCard, Modal, Input, Select, Textarea, Spinner, Badge, EmptyState, useToast, SearchIcon, PlusIcon, TrashIcon, ChevronRight } from '../components/ui'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const NAV = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'patients',  icon: '👥', label: 'Patients' },
  { id: 'records',   icon: '📋', label: 'Add Record' },
  { id: 'billing',   icon: '💰', label: 'Billing' },
]

export function DoctorDashboard({ onLogout }) {
  const [page, setPage] = useState('dashboard')
  const { show: showToast, el: toastEl } = useToast()

  const pages = {
    dashboard: <DashboardPage showToast={showToast}/>,
    patients:  <PatientsPage showToast={showToast}/>,
    records:   <AddRecordPage showToast={showToast}/>,
    billing:   <BillingPage showToast={showToast}/>,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-main">
      <Sidebar
        items={NAV}
        active={page}
        onSelect={setPage}
        footer={
          <button onClick={onLogout} className="btn-ghost w-full text-left text-text-muted">
            ← Logout
          </button>
        }
      />
      <main className="flex-1 overflow-y-auto">
        <div className="page-enter" key={page}>
          {pages[page]}
        </div>
      </main>
      {toastEl}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function DashboardPage({ showToast }) {
  const [stats, setStats] = useState(null)
  const [patients, setPatients] = useState([])

  useEffect(() => {
    api.getStats().then(setStats)
    api.getPatients().then(p => setPatients(p.slice(0, 8)))
  }, [])

  // Fake trend data for chart
  const trend = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
    patients: Math.floor(Math.random() * 8) + 2,
  }))

  return (
    <div className="p-8">
      <PageHeader title="Dashboard" subtitle="Welcome back, Doctor"/>

      {stats ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard icon="👥" label="Total Patients" value={stats.total_patients} color="text-accent-teal"/>
          <StatCard icon="📋" label="Total Records" value={stats.total_records} color="text-accent-blue"/>
          <StatCard icon="💰" label="Revenue" value={`₹${Number(stats.total_revenue).toLocaleString()}`} color="text-accent-amber"/>
          <StatCard icon="📅" label="Today's Records" value={stats.today_records} color="text-accent-purple"/>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[0,1,2,3].map(i => <div key={i} className="card h-24 animate-pulse bg-bg-hover"/>)}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Chart */}
        <div className="col-span-2 card">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Weekly Patient Activity</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false}/>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={24}/>
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: '#14b8a6' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="patients" stroke="#14b8a6" strokeWidth={2} fill="url(#tg)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent patients */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Recent Patients</h3>
          <div className="space-y-1">
            {patients.length === 0 && <p className="text-text-muted text-sm py-4 text-center">No patients yet</p>}
            {patients.map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-bg-border last:border-0">
                <div className="w-8 h-8 rounded-full bg-accent-teal/10 flex items-center justify-center text-accent-teal text-xs font-bold flex-shrink-0">
                  {p.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                  <p className="text-xs text-text-muted font-mono">{p.id}</p>
                </div>
                <span className="ml-auto text-xs badge-teal">{p.blood_group}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Patients ──────────────────────────────────────────────────────────────────

function PatientsPage({ showToast }) {
  const [patients, setPatients] = useState([])
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getPatients().then(setPatients)
  }, [])

  const filtered = q
    ? patients.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()))
    : patients

  async function selectPatient(p) {
    setSelected(p)
    setLoading(true)
    const recs = await api.getRecords(p.id)
    setRecords(recs)
    setLoading(false)
  }

  async function deleteRecord(rid) {
    await api.deleteRecord(rid)
    setRecords(r => r.filter(x => x.id !== rid))
    showToast('Record deleted')
  }

  return (
    <div className="flex h-full min-h-screen">
      {/* List */}
      <div className="w-80 flex-shrink-0 border-r border-bg-border flex flex-col">
        <div className="p-4 border-b border-bg-border">
          <h2 className="font-semibold text-text-primary mb-3">Patients</h2>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <SearchIcon size={14}/>
            </div>
            <input
              className="input-field pl-8 text-sm"
              placeholder="Search by name or ID…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-text-muted text-sm text-center py-8">No patients found</p>
          )}
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => selectPatient(p)}
              className={`w-full text-left px-4 py-3.5 border-b border-bg-border flex items-center gap-3 transition-colors hover:bg-bg-hover ${selected?.id === p.id ? 'bg-bg-hover border-l-2 border-l-accent-teal' : ''}`}
            >
              <div className="w-9 h-9 rounded-full bg-accent-teal/10 flex items-center justify-center text-accent-teal font-bold text-sm flex-shrink-0">
                {p.name[0]}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-text-primary truncate">{p.name}</p>
                <p className="text-xs text-text-muted font-mono">{p.id} · {p.blood_group}</p>
              </div>
              <ChevronRight size={14} className="ml-auto text-text-muted flex-shrink-0"/>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto p-8">
        {!selected ? (
          <EmptyState icon="🔍" title="Select a patient" subtitle="Click any patient from the list to view their profile and records"/>
        ) : (
          <div className="page-enter">
            <PatientProfile patient={selected}/>
            <div className="mt-6">
              <h3 className="font-semibold text-text-primary mb-4">Medical Records ({records.length})</h3>
              {loading && <div className="flex justify-center py-8"><Spinner/></div>}
              {!loading && records.length === 0 && (
                <EmptyState icon="📋" title="No records yet" subtitle="Add a record from the Add Record tab"/>
              )}
              {!loading && records.map(r => (
                <RecordCard key={r.id} record={r} onDelete={() => deleteRecord(r.id)}/>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PatientProfile({ patient: p }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-accent-teal/15 flex items-center justify-center text-accent-teal font-bold text-xl">
            {p.name[0]}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">{p.name}</h3>
            <p className="text-sm text-text-muted font-mono">{p.id}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="teal">{p.blood_group}</Badge>
          {p.allergies && p.allergies !== 'None' && <Badge variant="red">⚠ {p.allergies}</Badge>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-bg-border text-sm">
        {[
          ['Age', p.age || '—'],
          ['Phone', p.phone || '—'],
          ['Emergency', p.emergency_contact || '—'],
        ].map(([label, val]) => (
          <div key={label}>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-text-primary font-medium">{val}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecordCard({ record: r, onDelete }) {
  const isRecent = new Date(r.date) > new Date(Date.now() - 7 * 86400000)
  return (
    <div className="card mb-3 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-mono">{r.date}</span>
          {isRecent && <Badge variant="blue">Recent</Badge>}
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 btn-ghost text-accent-red/70 hover:text-accent-red p-1.5 transition-opacity"
        >
          <TrashIcon size={14}/>
        </button>
      </div>
      <p className="font-semibold text-text-primary mb-2">🩺 {r.diagnosis || '—'}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-text-secondary">
        {r.treatment && <span><span className="text-text-muted">Treatment: </span>{r.treatment}</span>}
        {r.prescription && <span><span className="text-text-muted">Rx: </span>{r.prescription}</span>}
        {r.doctor_name && <span><span className="text-text-muted">Doctor: </span>{r.doctor_name}</span>}
      </div>
      {r.notes && <p className="mt-2 text-sm text-text-muted italic border-t border-bg-border pt-2">{r.notes}</p>}
    </div>
  )
}

// ── Add Record ────────────────────────────────────────────────────────────────

function AddRecordPage({ showToast }) {
  const [form, setForm] = useState({ patient_id: '', diagnosis: '', treatment: '', prescription: '', notes: '', doctor_name: 'Dr. Smith' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  async function handleSubmit() {
    if (!form.patient_id.trim()) { setError('Patient ID is required'); return }
    if (!form.diagnosis.trim()) { setError('Diagnosis is required'); return }
    setLoading(true)
    try {
      await api.addRecord(form.patient_id, form)
      showToast('Record saved successfully')
      setForm(f => ({ ...f, diagnosis: '', treatment: '', prescription: '', notes: '' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <PageHeader title="Add Medical Record" subtitle="Log a new patient visit"/>
      <div className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Patient ID *" placeholder="PT001" value={form.patient_id} onChange={e => set('patient_id', e.target.value)}/>
          <Input label="Doctor Name" placeholder="Dr. Smith" value={form.doctor_name} onChange={e => set('doctor_name', e.target.value)}/>
        </div>
        <Input label="Diagnosis *" placeholder="e.g. Type 2 Diabetes" value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)}/>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Treatment" placeholder="e.g. Rest & medication" value={form.treatment} onChange={e => set('treatment', e.target.value)}/>
          <Input label="Prescription" placeholder="e.g. Metformin 500mg" value={form.prescription} onChange={e => set('prescription', e.target.value)}/>
        </div>
        <Textarea label="Notes" placeholder="Additional observations…" value={form.notes} onChange={e => set('notes', e.target.value)}/>
        {error && <p className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-lg px-4 py-3">{error}</p>}
        <button className="btn-primary flex items-center gap-2 px-6" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner size={16}/> : <PlusIcon size={16}/>}
          {loading ? 'Saving…' : 'Save Record'}
        </button>
      </div>
    </div>
  )
}

// ── Billing ───────────────────────────────────────────────────────────────────

function BillingPage({ showToast }) {
  const [form, setForm] = useState({ patient_id: '', consultation_fee: '', medicine_fee: '', test_fee: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const set = (k, v) => {
    const u = { ...form, [k]: v }
    setForm(u)
    const t = (+u.consultation_fee || 0) + (+u.medicine_fee || 0) + (+u.test_fee || 0)
    setTotal(t)
    setError('')
  }

  async function handleSubmit() {
    if (!form.patient_id.trim()) { setError('Patient ID is required'); return }
    setLoading(true)
    try {
      await api.addBill(form.patient_id, {
        consultation_fee: +form.consultation_fee || 0,
        medicine_fee: +form.medicine_fee || 0,
        test_fee: +form.test_fee || 0,
      })
      showToast(`Bill of ₹${total.toLocaleString()} generated`)
      setForm({ patient_id: '', consultation_fee: '', medicine_fee: '', test_fee: '' })
      setTotal(0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <PageHeader title="Billing" subtitle="Generate patient bills"/>
      <div className="card space-y-5">
        <Input label="Patient ID *" placeholder="PT001" value={form.patient_id} onChange={e => set('patient_id', e.target.value)}/>
        <div className="grid grid-cols-3 gap-4">
          {[['consultation_fee','Consultation Fee (₹)'],['medicine_fee','Medicine Fee (₹)'],['test_fee','Test Fee (₹)']].map(([k,l]) => (
            <Input key={k} label={l} placeholder="0" value={form[k]} onChange={e => set(k, e.target.value)}/>
          ))}
        </div>

        {/* Total preview */}
        <div className="flex items-center justify-between bg-bg-hover rounded-lg px-4 py-3 border border-bg-border">
          <span className="text-sm text-text-secondary font-medium">Grand Total</span>
          <span className="text-xl font-bold text-accent-amber">₹{total.toLocaleString()}</span>
        </div>

        {error && <p className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-lg px-4 py-3">{error}</p>}
        <button className="btn-primary flex items-center gap-2 px-6" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner size={16}/> : '💾'}
          {loading ? 'Saving…' : 'Generate Bill'}
        </button>
      </div>
    </div>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────

function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-bold text-text-primary mb-1">{title}</h1>
      {subtitle && <p className="text-text-secondary text-sm">{subtitle}</p>}
    </div>
  )
}
