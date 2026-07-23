import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSession, setDemoSession } from './lib/session'
import PhoneInput from './components/auth/PhoneInput'
import GiftsCapture from './components/gifts-profile/GiftsCapture'
import TradeExchange from './components/trade-exchange/TradeExchange'
import StewardDashboard from './components/steward-dashboard/StewardDashboard'
import Marketplace from './components/marketplace/Marketplace'
import GrounderOfferings from './components/marketplace/GrounderOfferings'
import GrounderRequests from './components/marketplace/GrounderRequests'

const DEMO_PARAM = 'demo'

function useDemoMode(): boolean {
  const [params] = useSearchParams()
  return params.has(DEMO_PARAM)
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const demo = useDemoMode()
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    if (demo) {
      setDemoSession().then(() => setAuthed(true))
    } else {
      getSession().then((s) => setAuthed(!!s))
    }
  }, [demo])

  if (authed === null) return null
  if (!authed) return <Navigate to={`/join${demo ? '?demo' : ''}`} replace />
  return <>{children}</>
}

// Redirects to /trade after profile check
function HomePage() {
  const demo = useDemoMode()
  return <Navigate to={`/trade${demo ? '?demo' : ''}`} replace />
}

function JoinPage() {
  const demo = useDemoMode()
  const [role, setRole] = useState<string | null>(null)

  if (role) return <Navigate to={`/profile${demo ? '?demo' : ''}`} replace />
  return <PhoneInput onSuccess={(r) => setRole(r)} />
}

function DemoBanner() {
  return (
    <div style={{
      background: '#E6A854', color: '#2C2A29', textAlign: 'center',
      padding: '6px 12px', fontSize: '12px', fontWeight: 500,
      fontFamily: 'var(--font-body, sans-serif)',
    }}>
      ⚠️ Demo mode — backend not connected. Data shown is mock/empty.
    </div>
  )
}

function DemoApp() {
  const demo = useDemoMode()

  return (
    <>
      {demo && <DemoBanner />}
      <Routes>
        <Route path="/join" element={<JoinPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><GiftsCapture /></ProtectedRoute>} />
        <Route path="/trade"   element={<ProtectedRoute><TradeExchange /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        <Route path="/support/new" element={<ProtectedRoute><GrounderOfferings /></ProtectedRoute>} />
        <Route path="/support/requests" element={<ProtectedRoute><GrounderRequests /></ProtectedRoute>} />
        <Route path="/steward" element={<ProtectedRoute><StewardDashboard /></ProtectedRoute>} />
        <Route path="/admin"   element={<div>Node Admin — Phase 2</div>} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <DemoApp />
    </BrowserRouter>
  )
}
