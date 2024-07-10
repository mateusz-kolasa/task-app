import { Button, Center, Group } from '@mantine/core'
import LanguagePicker from '../LanguagePicker/LanguagePicker'
import LightModeSwitch from '../LightModeSwitch/LightModeSwitch'
import { IconLayoutDashboard } from '@tabler/icons-react'

function Header() {
  return (
    <Center>
      <Button
        ml='md'
        variant='subtle'
        size='md'
        style={{ pointerEvents: 'none' }}
        leftSection={<IconLayoutDashboard />}
      >
        Task App
      </Button>{' '}
      <Group ml='auto' mr='md'>
        <LanguagePicker />
        <LightModeSwitch />
      </Group>
    </Center>
  )
}

export default Header
