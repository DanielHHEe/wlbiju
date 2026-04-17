import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { admin } = useAuth()
  return admin ? children : <Navigate to="/login" replace />
}