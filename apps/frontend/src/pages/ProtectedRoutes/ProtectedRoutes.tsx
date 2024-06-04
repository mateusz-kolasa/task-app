import { Outlet, useNavigate } from 'react-router-dom'
import useIsAuthenticated from '../../hooks/useIsAuthenticated'
import { useEffect } from 'react'

function ProtectedRoutes() {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  return <Outlet />
}

export default ProtectedRoutes
