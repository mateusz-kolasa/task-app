import {
  ActionIcon,
  Button,
  Divider,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Text,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconUserCircle } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useGetUserStatusQuery, useLogoutMutation } from 'store/slices/api/auth-api-slice'

function UserAccount() {
  const { data: user } = useGetUserStatusQuery()
  const { t } = useTranslation()

  const navigate = useNavigate()
  const [logout, { isLoading }] = useLogoutMutation()

  const handleLogoutClick = () => {
    logout()
      .unwrap()
      .then(() => {
        navigate('/login')
      })
      .catch(() => {
        notifications.show({
          title: t('signout.error.title'),
          message: t('error.general.message'),
          color: 'red',
        })
      })
  }

  return (
    <Popover>
      <PopoverTarget>
        <ActionIcon mx='md' variant='subtle'>
          <IconUserCircle />
        </ActionIcon>
      </PopoverTarget>
      <PopoverDropdown maw={250}>
        <Text fw='bold' ta='center' style={{ wordBreak: 'break-all' }}>
          {user?.username}
        </Text>
        <Divider my='xs' />
        <Button variant='subtle' onClick={handleLogoutClick} disabled={isLoading}>
          {t('signout.button')}
        </Button>
      </PopoverDropdown>
    </Popover>
  )
}

export default UserAccount
