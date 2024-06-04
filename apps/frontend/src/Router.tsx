import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import { useGetUserStatusQuery } from './store/slices/auth-api-slice'
import { Loader } from '@mantine/core'
import ProtectedRoutes from './pages/ProtectedRoutes/ProtectedRoutes'
import AuthenticationRoutes from './pages/AuthenticationRoutes/AuthenticationRoutes'

const router = createBrowserRouter([
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
    ],
  },
  {
    element: <AuthenticationRoutes />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },
  {
    path: '*',
    loader: () => {
      throw redirect('/login')
    },
  },
])

export function Router() {
  const { isLoading } = useGetUserStatusQuery()

  if (isLoading) {
    return <Loader />
  }

  return <RouterProvider router={router} />
}
