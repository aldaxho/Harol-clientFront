import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import DocenteHorario from './pages/DocenteHorario'
import Aulas from './pages/Aulas'
import Materias from './pages/Materias'
import Docentes from './pages/Docentes'
import Grupos from './pages/Grupos'
import Horarios from './pages/Horarios'
import Gestiones from './pages/Gestiones'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole={"admin"}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/aulas"
          element={
            <ProtectedRoute requiredRole={"admin"}>
              <Aulas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/horario"
          element={
            <ProtectedRoute requiredRole={"docente"}>
              <DocenteHorario />
            </ProtectedRoute>
          }
        />

        <Route
          path="/materias"
          element={
            <ProtectedRoute requiredRole={"admin"}>
              <Materias />
            </ProtectedRoute>
          }
        />

        <Route
          path="/docentes"
          element={
            <ProtectedRoute requiredRole={"admin"}>
              <Docentes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/grupos"
          element={
            <ProtectedRoute requiredRole={"admin"}>
              <Grupos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/horarios"
          element={
            <ProtectedRoute requiredRole={"admin"}>
              <Horarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gestiones"
          element={
            <ProtectedRoute requiredRole={"admin"}>
              <Gestiones />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
