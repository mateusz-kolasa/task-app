import { Outlet, useNavigate } from 'react-router-dom'
import useIsAuthenticated from '../../hooks/useIsAuthenticated'
import { useEffect } from 'react'
import BaseLayout from 'components/BaseLayout/BaseLayout'

function AuthenticationRoutes() {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  )
}

export default AuthenticationRoutes
