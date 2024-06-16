import { ActionIcon, Center, Group } from '@mantine/core'
import { IconMenu2 } from '@tabler/icons-react'
import LanguagePicker from 'components/LanguagePicker/LanguagePicker'
import LightModeSwitch from 'components/LightModeSwitch/LightModeSwitch'

interface BoardHeaderProps {
  toggleMenu: () => void
}

function BoardHeader({ toggleMenu }: Readonly<BoardHeaderProps>) {
  return (
    <Center>
      <Group ml='auto'>
        <LanguagePicker />
        <LightModeSwitch />
      </Group>

      <ActionIcon ml='auto' mr='md' variant='subtle' onClick={toggleMenu}>
        <IconMenu2 />
      </ActionIcon>
    </Center>
  )
}

export default BoardHeader
