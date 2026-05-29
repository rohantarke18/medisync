// src/pages/PatientAuth.jsx
import { useState } from 'react'
import { api } from '../lib/api'
import { Spinner, Input } from '../components/ui'

export function PatientLogin({ onSuccess, onRegister, onBack }) {
  const [id, setId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!id.trim()) { setError('Please enter your Patient ID'); return }
    setLoading(true); setError('')
    try {
      const patient = await api.getPatient(id.trim())
      onSuccess(patient)
    } catch {
      setError(`No patient found with ID "${id.trim()}". Check your ID or register below.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell onBack={onBack}>
      <div className="mb-7">
        <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center text-2xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-text-primary mb-1">Patient Portal</h2>
        <p className="text-text-secondary text-sm">Sign in with your Patient ID</p>
      </div>

      <div className="space-y-4">
        <Input
          label="Patient ID"
          placeholder="e.g. PT001"
          value={id}
          onChange={e => { setId(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          autoFocus
        />

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg px-4 py-3 text-accent-red text-sm">
            {error}
          </div>
        )}

        <button
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <Spinner size={16}/> : null}
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-bg-border"/>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-bg-card px-3 text-text-muted">or</span>
          </div>
        </div>

        <button
          className="btn-secondary w-full py-3 text-center"
          onClick={onRegister}
        >
          New patient? Register here
        </button>
      </div>
    </AuthShell>
  )
}

export function PatientRegister({ onSuccess, onBack }) {
  const [form, setForm] = useState({
    id: '', name: '', age: '', blood_group: 'Unknown',
    allergies: 'None', phone: '', emergency_contact: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); setApiError('') }

  function validate() {
    const e = {}
    if (!form.id.trim()) e.id = 'Required'
    if (!form.name.trim()) e.name = 'Required'
    if (form.age && (isNaN(form.age) || +form.age < 0 || +form.age > 130)) e.age = 'Must be 0–130'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true); setApiError('')
    try {
      await api.addPatient({ ...form, age: form.age ? +form.age : null })
      const patient = await api.getPatient(form.id)
      onSuccess(patient)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell onBack={onBack} wide>
      <div className="mb-6">
        <div className="w-12 h-12 rounded-xl bg-accent-teal/10 flex items-center justify-center text-2xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-text-primary mb-1">Register New Patient</h2>
        <p className="text-text-secondary text-sm">Fill in the details below to create your profile</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Patient ID *" placeholder="e.g. PT001" value={form.id}
            onChange={e => set('id', e.target.value)} error={errors.id}/>
          <Input label="Full Name *" placeholder="Arjun Sharma" value={form.name}
            onChange={e => set('name', e.target.value)} error={errors.name}/>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Age" placeholder="35" value={form.age}
            onChange={e => set('age', e.target.value)} error={errors.age}/>
          <div>
            <label className="label">Blood Group</label>
            <select className="input-field" value={form.blood_group}
              onChange={e => set('blood_group', e.target.value)}>
              {['Unknown','A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b =>
                <option key={b} value={b}>{b}</option>
              )}
            </select>
          </div>
        </div>

        <Input label="Allergies" placeholder="Penicillin, Pollen (or 'None')"
          value={form.allergies} onChange={e => set('allergies', e.target.value)}/>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" placeholder="+91 9876543210" value={form.phone}
            onChange={e => set('phone', e.target.value)}/>
          <Input label="Emergency Contact" placeholder="Name & number" value={form.emergency_contact}
            onChange={e => set('emergency_contact', e.target.value)}/>
        </div>

        {apiError && (
          <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg px-4 py-3 text-accent-red text-sm">
            {apiError}
          </div>
        )}

        <button
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Spinner size={16}/> : '✓'}
          {loading ? 'Registering…' : 'Register Patient'}
        </button>
      </div>
    </AuthShell>
  )
}

function AuthShell({ children, onBack, wide }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-enter"
         style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%), #0b1120' }}>
      <div className={`w-full ${wide ? 'max-w-lg' : 'max-w-sm'}`}>
        <button onClick={onBack} className="btn-ghost mb-6 flex items-center gap-2 text-text-muted hover:text-text-primary -ml-1">
          ← Back
        </button>
        <div className="card">
          {children}
        </div>
      </div>
    </div>
  )
}
