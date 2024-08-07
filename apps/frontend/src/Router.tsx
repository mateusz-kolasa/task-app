import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import { useGetUserStatusQuery } from './store/slices/api/auth-api-slice'
import { Center, Loader } from '@mantine/core'
import ProtectedRoutes from './pages/ProtectedRoutes/ProtectedRoutes'
import AuthenticationRoutes from './pages/AuthenticationRoutes/AuthenticationRoutes'
import Board from './pages/Board/Board'
import BaseLayout from 'components/BaseLayout/BaseLayout'
import CardDialog from 'pages/CardDialog/CardDialog'

const router = createBrowserRouter([
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/board/:boardId',
        element: <Board />,
        children: [
          {
            path: 'card/:cardId',
            element: <CardDialog />,
          },
        ],
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
    return (
      <BaseLayout>
        <Center>
          <Loader />
        </Center>
      </BaseLayout>
    )
  }

  return <RouterProvider router={router} />
}
