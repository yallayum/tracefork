import { Link, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
import { LotSelector } from './LotSelector'
import { Footer } from './Footer'
import { ThemeToggle } from './ThemeToggle'

const NAV = [
  { path: '/', label: 'Command Center', icon: 'dashboard' },
  { path: '/explorer', label: 'Trace Explorer', icon: 'art_track' },
  { path: '/simulator', label: 'Recall Simulator', icon: 'emergency_home' },
  { path: '/monitor', label: 'Cold Chain Monitor', icon: 'ac_unit' },
  { path: '/demo', label: 'Demo Scenarios', icon: 'science' },
  { path: '/agent', label: 'AI Agent', icon: 'smart_toy' },
]

export function SideNav() {
  const { pathname } = useLocation()
  return (
    <nav className="bg-surface-container border-r border-outline-variant h-screen w-64 fixed left-0 top-0 hidden md:flex flex-col py-6 px-4 z-50">
      <div className="mb-8 flex items-center gap-3 px-2">
        <img
          src="/favicon.png"
          alt="TraceFork"
          className="w-10 h-10 rounded-lg object-contain shrink-0"
        />
        <div>
          <h1 className="text-lg font-bold text-primary leading-none tracking-tight">TraceFork</h1>
          <p className="text-[10px] text-on-surface-variant uppercase mt-1 tracking-wider">
            Supply Intelligence
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-1 flex-grow">
        {NAV.map((item) => {
          const active = pathname === item.path
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-surface-container-high text-primary shadow-sm border-l-2 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <Icon name={item.icon} size={20} filled={active} />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="mt-auto pt-4 border-t border-border-subtle px-2">
        <p className="text-[10px] text-text-muted">Capstone 2026</p>
        <p className="text-[10px] font-mono text-primary/70">tracefork-3f5ac</p>
      </div>
    </nav>
  )
}

export function MobileNav() {
  const { pathname } = useLocation()
  const items = [
    NAV[0],
    NAV[1],
    NAV[2],
    NAV[3],
    NAV[4],
  ]
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-14 bg-surface-container-high/95 backdrop-blur border-t border-outline-variant">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-0.5 px-1 text-[9px] ${
            pathname === item.path ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <Icon name={item.icon} size={20} filled={pathname === item.path} />
          {item.label.split(' ')[0]}
        </Link>
      ))}
    </nav>
  )
}

const LOT_PAGES = ['/explorer', '/simulator', '/monitor']

export function TopBar() {
  const { pathname } = useLocation()
  const showLot = LOT_PAGES.includes(pathname)

  return (
    <header className="h-16 sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant flex justify-between items-center w-full px-4 md:px-6 md:pl-[17rem] gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="text-lg font-bold text-primary md:hidden shrink-0 flex items-center gap-2">
          <img src="/favicon.png" alt="" className="w-7 h-7 rounded object-contain" />
          TraceFork
        </h2>
        {showLot && (
          <div className="flex items-center gap-2">
            <Icon name="qr_code_2" className="text-text-muted hidden sm:block" size={18} />
            <LotSelector />
          </div>
        )}
        {!showLot && (
          <div className="hidden md:flex items-center gap-2 text-sm text-text-muted">
            <Icon name="hub" size={18} />
            <span>Food Supply Chain Command Center</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-success bg-success/10 px-2 py-1 rounded-full border border-success/20">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          LIVE
        </span>
        <a
          href="https://github.com/yallayum/tracefork"
          target="_blank"
          rel="noreferrer"
          className="text-text-muted hover:text-primary transition-colors"
          title="GitHub"
        >
          <Icon name="code" size={20} />
        </a>
      </div>
    </header>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SideNav />
      <div className="md:pl-64 min-h-screen pb-16 md:pb-0 flex flex-col">
        <TopBar />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
      <MobileNav />
    </div>
  )
}
