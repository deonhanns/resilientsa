import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSession } from './lib/session'
import PhoneInput from './components/auth/PhoneInput'
import GiftsCapture from './components/gifts-profile/GiftsCapture'
import TradeExchange from './components/trade-exchange/TradeExchange'
import StewardDashboard from './components/steward-dashboard/StewardDashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    getSession().then((s) => setAuthed(!!s))
  }, [])

  if (authed === null) return null
  if (!authed) return <Navigate to="/join" replace />
  return <>{children}</>
}

// Redirects to /trade after profile check
function HomePage() {
  return <Navigate to="/trade" replace />
}

function JoinPage() {
  const [role, setRole] = useState<string | null>(null)

  if (role) return <Navigate to="/profile" replace />
  return <PhoneInput onSuccess={(r) => setRole(r)} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/join" element={<JoinPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><GiftsCapture /></ProtectedRoute>} />
        <Route path="/trade"   element={<ProtectedRoute><TradeExchange /></ProtectedRoute>} />
        <Route path="/support" element={<div>Community Marketplace — ORDER 008</div>} />
        <Route path="/steward" element={<ProtectedRoute><StewardDashboard /></ProtectedRoute>} />
        <Route path="/admin"   element={<div>Node Admin — Phase 2</div>} />
      </Routes>
    </BrowserRouter>
  )
}
