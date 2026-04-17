import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import AdminLayout from './components/admin/AdminLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import Orders from './pages/admin/Orders'
import Stock from './pages/admin/Stock'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminLayout><Dashboard /></AdminLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/products" element={
            <PrivateRoute>
              <AdminLayout><Products /></AdminLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/orders" element={
            <PrivateRoute>
              <AdminLayout><Orders /></AdminLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/stock" element={
            <PrivateRoute>
              <AdminLayout><Stock /></AdminLayout>
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}