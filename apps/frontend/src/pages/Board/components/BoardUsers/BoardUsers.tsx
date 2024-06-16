import { Divider, Grid, GridCol, Text } from '@mantine/core'
import useBoardPermissionsText from 'hooks/useBoardPermissionsText'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'

function BoardUsers() {
  const { boardId } = useParams()

  const { users } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      return { users: data?.users }
    },
  })

  const { t } = useTranslation()
  const boardPermissionText = useBoardPermissionsText()

  return (
    <>
      <Text ta='center' size='lg' fw='bold'>
        {t('board.users.list')}
      </Text>
      <Grid p='md'>
        {users?.map(user => (
          <>
            <GridCol span={8} data-testid='board-user'>
              <Text>{user.user.username}</Text>
            </GridCol>
            <GridCol span={4}>
              <Text>{t(boardPermissionText[user.permissions])}</Text>
            </GridCol>

            <GridCol span={12}>
              <Divider m='md' />
            </GridCol>
          </>
        ))}
      </Grid>
    </>
  )
}

export default BoardUsers
