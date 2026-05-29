// src/components/Sidebar.jsx
export function Sidebar({ items, active, onSelect, footer }) {
  return (
    <aside className="flex flex-col h-full w-56 bg-bg-card border-r border-bg-border flex-shrink-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-teal flex items-center justify-center text-white font-bold text-sm">
            ⚕
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary leading-none">MediSync</p>
            <p className="text-xs text-text-muted mt-0.5">Pro</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`nav-item w-full text-left ${active === item.id ? 'active' : ''}`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-xs font-semibold bg-accent-teal/20 text-accent-teal px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="px-3 py-4 border-t border-bg-border">
          {footer}
        </div>
      )}
    </aside>
  )
}
