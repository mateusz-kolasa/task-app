import { Center, Group } from '@mantine/core'
import LanguagePicker from '../LanguagePicker/LanguagePicker'
import LightModeSwitch from '../LightModeSwitch/LightModeSwitch'

function Header() {
  return (
    <Center>
      <Group>
        <LanguagePicker />
        <LightModeSwitch />
      </Group>
    </Center>
  )
}

export default Header
