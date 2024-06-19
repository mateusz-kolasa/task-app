import { Divider, GridCol, Text } from '@mantine/core'
import useBoardPermissionsText from 'hooks/useBoardPermissionsText'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { Fragment } from 'react/jsx-runtime'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'

interface BoardUserCardProps {
  userId: number
}

function BoardUserCard({ userId }: Readonly<BoardUserCardProps>) {
  const { boardId } = useParams()

  const { user } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      return { user: data?.users.entities[userId] }
    },
  })

  const { t } = useTranslation()
  const boardPermissionText = useBoardPermissionsText()

  return (
    <Fragment key={userId}>
      <GridCol span={8} data-testid='board-user'>
        <Text>{user?.user.username}</Text>
      </GridCol>
      <GridCol span={4}>
        <Text>{t(boardPermissionText[user?.permissions ?? 0])}</Text>
      </GridCol>

      <GridCol span={12}>
        <Divider m='md' />
      </GridCol>
    </Fragment>
  )
}

export default BoardUserCard
