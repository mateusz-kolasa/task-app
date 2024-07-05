import { Center, Group } from '@mantine/core'
import LanguagePicker from 'components/LanguagePicker/LanguagePicker'
import LightModeSwitch from 'components/LightModeSwitch/LightModeSwitch'
import UserAccount from 'components/UserAccount/UserAccount'

function DashboardHeader() {
  return (
    <Center>
      <Group ml='auto'>
        <LanguagePicker />
        <LightModeSwitch />
      </Group>

      <UserAccount />
    </Center>
  )
}

export default DashboardHeader
