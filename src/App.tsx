import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Path from './pages/Path'
import Play from './pages/Play'
import Checkout from './pages/Checkout'
import Affiliate from './pages/Affiliate'
import Admin from './pages/Admin'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'

export default function App() {
  return (
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
  )
}
