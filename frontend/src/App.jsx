// src/App.jsx — Screen router
import { useState } from 'react'
import { Home } from './pages/Home'
import { PatientLogin, PatientRegister } from './pages/PatientAuth'
import { DoctorDashboard } from './pages/DoctorDashboard'
import { PatientDashboard } from './pages/PatientDashboard'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [patient, setPatient] = useState(null)

  const nav = {
    home:            () => { setPatient(null); setScreen('home') },
    doctor:          () => setScreen('doctor'),
    patientLogin:    () => setScreen('patientLogin'),
    patientRegister: () => setScreen('patientRegister'),
    patientDash:     (p) => { setPatient(p); setScreen('patientDash') },
  }

  return (
    <>
      {screen === 'home' && (
        <Home onDoctor={nav.doctor} onPatient={nav.patientLogin}/>
      )}
      {screen === 'doctor' && (
        <DoctorDashboard onLogout={nav.home}/>
      )}
      {screen === 'patientLogin' && (
        <PatientLogin
          onSuccess={nav.patientDash}
          onRegister={nav.patientRegister}
          onBack={nav.home}
        />
      )}
      {screen === 'patientRegister' && (
        <PatientRegister
          onSuccess={nav.patientDash}
          onBack={nav.patientLogin}
        />
      )}
      {screen === 'patientDash' && patient && (
        <PatientDashboard patient={patient} onLogout={nav.home}/>
      )}
    </>
  )
}
