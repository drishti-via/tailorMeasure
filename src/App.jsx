import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './i18n/index.js'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PatternList from './pages/PatternList'
import PatternWizard from './pages/PatternWizard'
import ClientList from './pages/ClientList'
import ClientNew from './pages/ClientNew'
import ClientDetail from './pages/ClientDetail'
import MeasureClient from './pages/MeasureClient'

export default function App() {
  return (
    <BrowserRouter basename="/tailorMeasure">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/patterns" element={<ProtectedRoute><PatternList /></ProtectedRoute>} />
        <Route path="/patterns/new" element={<ProtectedRoute><PatternWizard /></ProtectedRoute>} />
        <Route path="/patterns/:id" element={<ProtectedRoute><PatternWizard /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
        <Route path="/clients/new" element={<ProtectedRoute><ClientNew /></ProtectedRoute>} />
        <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
        <Route path="/clients/:id/measure" element={<ProtectedRoute><MeasureClient /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
