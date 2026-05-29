// src/pages/PatientDashboard.jsx
import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Sidebar } from '../components/Sidebar'
import { Badge, EmptyState, Spinner, StatCard, useToast } from '../components/ui'

const NAV = [
  { id: 'overview',  icon: '🏠', label: 'Overview' },
  { id: 'history',   icon: '📋', label: 'History' },
  { id: 'summary',   icon: '💊', label: 'Summary' },
  { id: 'bills',     icon: '💰', label: 'Bills' },
]

export function PatientDashboard({ patient, onLogout }) {
  const [page, setPage] = useState('overview')
  const { show: showToast, el: toastEl } = useToast()

  const pages = {
    overview: <OverviewPage patient={patient}/>,
    history:  <HistoryPage patient={patient}/>,
    summary:  <SummaryPage patient={patient}/>,
    bills:    <BillsPage patient={patient}/>,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-main">
      <Sidebar
        items={NAV}
        active={page}
        onSelect={setPage}
        footer={
          <div>
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <div className="w-7 h-7 rounded-full bg-accent-blue/15 flex items-center justify-center text-accent-blue text-xs font-bold">
                {patient.name?.[0] ?? 'P'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{patient.name}</p>
                <p className="text-xs text-text-muted font-mono">{patient.id}</p>
              </div>
            </div>
            <button onClick={onLogout} className="btn-ghost w-full text-left text-text-muted text-sm">← Logout</button>
          </div>
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

// ── Overview ──────────────────────────────────────────────────────────────────

function OverviewPage({ patient: p }) {
  const [records, setRecords] = useState([])
  const [bills, setBills] = useState([])

  useEffect(() => {
    api.getRecords(p.id).then(setRecords)
    api.getBills(p.id).then(setBills)
  }, [p.id])

  const totalBills = bills.reduce((s, b) => s + (b.total || 0), 0)
  const pending = bills.filter(b => b.status === 'Pending').reduce((s, b) => s + (b.total || 0), 0)

  return (
    <div className="p-8">
      <div className="mb-7">
        <p className="text-text-muted text-sm mb-1">Good day,</p>
        <h1 className="text-2xl font-bold text-text-primary">{p.name}</h1>
      </div>

      {/* Emergency alert */}
      {p.allergies && p.allergies !== 'None' && (
        <div className="flex items-center gap-3 bg-accent-red/5 border border-accent-red/20 rounded-card px-4 py-3 mb-6">
          <span className="text-accent-red">⚠️</span>
          <p className="text-sm text-accent-red"><span className="font-semibold">Allergy alert:</span> {p.allergies}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📋" label="Total Records" value={records.length} color="text-accent-blue"/>
        <StatCard icon="💰" label="Total Bills (₹)" value={totalBills.toLocaleString()} color="text-accent-amber"/>
        <StatCard icon="⏳" label="Pending (₹)" value={pending.toLocaleString()} color="text-accent-red"/>
        <StatCard icon="📅" label="Last Visit" value={records[0]?.date?.slice(0,10) ?? '—'} color="text-accent-teal"/>
      </div>

      {/* Profile card */}
      <div className="card">
        <h3 className="font-semibold text-text-primary mb-4">Profile</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
          {[
            ['Patient ID', p.id],
            ['Age', p.age || '—'],
            ['Blood Group', p.blood_group],
            ['Phone', p.phone || '—'],
            ['Emergency Contact', p.emergency_contact || '—'],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-text-primary font-medium">{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── History ───────────────────────────────────────────────────────────────────

function HistoryPage({ patient }) {
  const [records, setRecords] = useState(null)

  useEffect(() => { api.getRecords(patient.id).then(setRecords) }, [patient.id])

  return (
    <div className="p-8">
      <PageHeader title="Medical History" subtitle="Your complete record timeline"/>
      {records === null && <div className="flex justify-center py-20"><Spinner/></div>}
      {records?.length === 0 && <EmptyState icon="📋" title="No records yet" subtitle="Your doctor will add records after each visit"/>}
      {records?.map((r, i) => {
        const isRecent = i === 0
        return (
          <div key={r.id} className="flex gap-4 mb-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center flex-shrink-0 pt-1">
              <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${isRecent ? 'bg-accent-teal border-accent-teal' : 'bg-transparent border-text-muted'}`}/>
              {i < records.length - 1 && <div className="w-0.5 flex-1 bg-bg-border mt-1"/>}
            </div>
            <div className="card flex-1 mb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-text-muted font-mono">{r.date}</span>
                {isRecent && <Badge variant="blue">Recent</Badge>}
                {r.doctor_name && <span className="text-xs text-text-muted">· {r.doctor_name}</span>}
              </div>
              <p className="font-semibold text-text-primary mb-2">🩺 {r.diagnosis || '—'}</p>
              <div className="space-y-1 text-sm">
                {r.treatment && <p className="text-text-secondary"><span className="text-text-muted">Treatment: </span>{r.treatment}</p>}
                {r.prescription && <p className="text-text-secondary"><span className="text-text-muted">Prescription: </span>{r.prescription}</p>}
                {r.notes && <p className="text-text-muted italic pt-1 border-t border-bg-border mt-1">{r.notes}</p>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Summary ───────────────────────────────────────────────────────────────────

const CONDITION_MAP = {
  'Diabetes': ['diabetes','diabetic','insulin','glucose'],
  'Hypertension': ['hypertension','blood pressure','bp'],
  'Fever': ['fever','pyrexia'],
  'Respiratory': ['asthma','bronchitis','pneumonia','cough'],
  'Cardiac': ['heart','cardiac','angina'],
  'Infection': ['infection','bacterial','viral','antibiotic'],
  'Allergy': ['allergy','allergic','anaphylaxis'],
  'Gastro': ['gastritis','ulcer','ibs','nausea','diarrhea'],
  'Ortho': ['arthritis','fracture','sprain','joint','back pain'],
  'Neuro': ['migraine','headache','vertigo','seizure'],
}

function SummaryPage({ patient }) {
  const [records, setRecords] = useState(null)

  useEffect(() => { api.getRecords(patient.id).then(setRecords) }, [patient.id])

  if (records === null) return <div className="flex justify-center py-20"><Spinner/></div>

  const text = records.map(r => r.diagnosis || '').join(' ').toLowerCase()
  const detected = Object.entries(CONDITION_MAP)
    .filter(([, kws]) => kws.some(k => text.includes(k)))
    .map(([name]) => name)

  return (
    <div className="p-8 max-w-2xl">
      <PageHeader title="Health Summary" subtitle="AI-powered analysis of your medical history"/>

      <div className="card mb-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📊</span>
          <h3 className="font-semibold text-text-primary">Based on {records.length} record(s)</h3>
        </div>

        {detected.length > 0 ? (
          <>
            <p className="text-sm text-text-secondary mb-3">Conditions detected in your history:</p>
            <div className="flex flex-wrap gap-2">
              {detected.map(c => <span key={c} className="badge-teal">{c}</span>)}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 text-accent-teal">
            <span className="text-xl">✅</span>
            <p className="text-sm font-medium">No specific chronic conditions detected in keyword scan.</p>
          </div>
        )}
      </div>

      <div className="card bg-accent-amber/5 border-accent-amber/20">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-accent-amber">ℹ Note:</span> This summary is auto-generated from your diagnoses. Always consult your doctor for medical advice.
        </p>
      </div>
    </div>
  )
}

// ── Bills ─────────────────────────────────────────────────────────────────────

function BillsPage({ patient }) {
  const [bills, setBills] = useState(null)

  useEffect(() => { api.getBills(patient.id).then(setBills) }, [patient.id])

  const total = bills?.reduce((s, b) => s + (b.total || 0), 0) ?? 0
  const paid  = bills?.filter(b => b.status === 'Paid').reduce((s, b) => s + b.total, 0) ?? 0
  const pending = total - paid

  if (bills === null) return <div className="flex justify-center py-20"><Spinner/></div>

  return (
    <div className="p-8">
      <PageHeader title="Bills & Payments" subtitle="Your billing history"/>

      <div className="grid grid-cols-3 gap-4 mb-7">
        <StatCard icon="💰" label="Grand Total (₹)" value={total.toLocaleString()} color="text-accent-amber"/>
        <StatCard icon="✅" label="Paid (₹)" value={paid.toLocaleString()} color="text-accent-teal"/>
        <StatCard icon="⏳" label="Pending (₹)" value={pending.toLocaleString()} color="text-accent-red"/>
      </div>

      {bills.length === 0 && <EmptyState icon="💰" title="No bills yet" subtitle="Bills will appear here after your visit"/>}

      <div className="space-y-3">
        {bills.map(b => (
          <div key={b.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted font-mono">{b.date}</span>
              <Badge variant={b.status === 'Paid' ? 'teal' : 'amber'}>{b.status}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              {[['Consultation','consultation_fee'],['Medicine','medicine_fee'],['Tests','test_fee']].map(([l,k]) => (
                <div key={k}>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">{l}</p>
                  <p className="text-text-primary font-medium">₹{(b[k]||0).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-bg-border flex justify-end">
              <span className="text-text-muted text-sm mr-2">Total</span>
              <span className="font-bold text-accent-amber">₹{(b.total||0).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-bold text-text-primary mb-1">{title}</h1>
      {subtitle && <p className="text-text-secondary text-sm">{subtitle}</p>}
    </div>
  )
}
