// src/pages/Home.jsx
export function Home({ onDoctor, onPatient }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 page-enter"
         style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(20,184,166,0.08) 0%, transparent 70%), #0b1120' }}>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}/>

      <div className="relative z-10 text-center max-w-2xl w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill border border-accent-teal/30 bg-accent-teal/5 text-accent-teal text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-teal pulse-teal"/>
          Healthcare Record System
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-text-primary mb-4 tracking-tight">
          MediSync <span className="text-accent-teal">Pro</span>
        </h1>
        <p className="text-text-secondary text-lg mb-12 max-w-md mx-auto leading-relaxed">
          Smart, modern healthcare records. Manage patients, records, and billing with elegance.
        </p>

        {/* Portal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <PortalCard
            icon="🩺"
            title="Doctor Portal"
            desc="Manage patients, add records & billing"
            cta="Enter Portal"
            color="teal"
            onClick={onDoctor}
          />
          <PortalCard
            icon="👤"
            title="Patient Portal"
            desc="View your health history & bills"
            cta="Sign In"
            color="blue"
            onClick={onPatient}
          />
        </div>

        {/* Footer */}
        <p className="mt-12 text-text-muted text-xs">
          Secure • Private • No data shared externally
        </p>
      </div>
    </div>
  )
}

function PortalCard({ icon, title, desc, cta, color, onClick }) {
  const accent = color === 'teal' ? 'accent-teal' : 'accent-blue'
  const hoverBorder = color === 'teal' ? 'hover:border-accent-teal/40' : 'hover:border-accent-blue/40'
  const ctaClass = color === 'teal'
    ? 'bg-accent-teal hover:bg-teal-500 text-white'
    : 'bg-accent-blue hover:bg-blue-500 text-white'
  const iconBg = color === 'teal' ? 'bg-accent-teal/10 text-accent-teal' : 'bg-accent-blue/10 text-accent-blue'

  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer text-left transition-all duration-200 ${hoverBorder} hover:bg-bg-hover group`}
      style={{ transform: 'translateY(0)' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 ${iconBg}`}>
        {icon}
      </div>
      <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-text-muted text-sm mb-5 leading-relaxed">{desc}</p>
      <button
        className={`w-full py-2.5 rounded-btn font-semibold text-sm transition-all duration-150 active:scale-95 ${ctaClass}`}
        onClick={onClick}
      >
        {cta} →
      </button>
    </div>
  )
}
