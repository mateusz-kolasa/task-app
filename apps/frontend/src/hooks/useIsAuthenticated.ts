import { useGetUserStatusQuery } from '../store/slices/api/auth-api-slice'

const useIsAuthenticated = () => {
  const { data: user } = useGetUserStatusQuery()

  return user?.username !== undefined
}

export default useIsAuthenticated
