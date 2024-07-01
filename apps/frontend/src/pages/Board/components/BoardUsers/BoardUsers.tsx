import { Divider, Grid, GridCol, Text } from '@mantine/core'
import useBoardPermissionsText from 'hooks/useBoardPermissionsText'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import AddUserButton from './AddUser/AddUserButton'
import { Fragment } from 'react/jsx-runtime'
import LeaveBoard from './LeaveBoard/LeaveBoard'

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
        {t('board.users.list.title')}
      </Text>
      <Grid p='md'>
        {users?.ids.map(userId => (
          <Fragment key={userId}>
            <GridCol span={8} data-testid='board-user'>
              <Text>{users.entities[userId].user.username}</Text>
            </GridCol>
            <GridCol span={4}>
              <Text>{t(boardPermissionText[users.entities[userId].permissions])}</Text>
            </GridCol>

            <GridCol span={12}>
              <Divider m='md' />
            </GridCol>
          </Fragment>
        ))}
      </Grid>

      <AddUserButton />
      <LeaveBoard />
    </>
  )
}

export default BoardUsers
