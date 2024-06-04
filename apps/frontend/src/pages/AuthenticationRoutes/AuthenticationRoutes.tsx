import { Outlet, useNavigate } from 'react-router-dom'
import useIsAuthenticated from '../../hooks/useIsAuthenticated'
import { useEffect } from 'react'

function AuthenticationRoutes() {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  return <Outlet />
}

export default AuthenticationRoutes
