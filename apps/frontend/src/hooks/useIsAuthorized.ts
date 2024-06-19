import { useParams } from 'react-router-dom'
import { useGetUserStatusQuery } from '../store/slices/api/auth-api-slice'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import { useCallback } from 'react'

const useIsAuthorized = () => {
  const { boardId } = useParams()
  const { data: user } = useGetUserStatusQuery()

  const { permissions } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      if (user) {
        return { permissions: data?.users.entities[user?.id].permissions }
      }

      return {}
    },
  })

  const isAuthorized = useCallback(
    (reuiredPermissions: number) => {
      if (permissions !== undefined) {
        return permissions >= reuiredPermissions
      }
    },
    [permissions]
  )

  return isAuthorized
}

export default useIsAuthorized
