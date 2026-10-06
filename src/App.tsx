import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Landing from './pages/Landing'

// Landing is the entry point for every visitor, so it stays in the initial
// bundle. Everything else is split out and fetched only when navigated to.
const Path = lazy(() => import('./pages/Path'))
const Play = lazy(() => import('./pages/Play'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Affiliate = lazy(() => import('./pages/Affiliate'))
const Admin = lazy(() => import('./pages/Admin'))
const SignUp = lazy(() => import('./pages/SignUp'))
const SignIn = lazy(() => import('./pages/SignIn'))

function RouteFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-violet-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/main" element={<Path />} />
        <Route path="/main/play/:lessonId" element={<Play />} />
        <Route path="/daftar" element={<SignUp />} />
        <Route path="/daftar/bayar" element={<Checkout />} />
        <Route path="/masuk" element={<SignIn />} />
        <Route path="/affiliate" element={<Affiliate />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
