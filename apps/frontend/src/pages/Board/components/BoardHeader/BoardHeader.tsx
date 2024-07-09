import { ActionIcon, Center, Group } from '@mantine/core'
import { IconMenu2 } from '@tabler/icons-react'
import HomeButton from 'components/HomeButton/HomeButton'
import LanguagePicker from 'components/LanguagePicker/LanguagePicker'
import LightModeSwitch from 'components/LightModeSwitch/LightModeSwitch'
import UserAccount from 'components/UserAccount/UserAccount'

interface BoardHeaderProps {
  toggleMenu: () => void
}

function BoardHeader({ toggleMenu }: Readonly<BoardHeaderProps>) {
  return (
    <Center>
      <HomeButton />
      <Group ml='auto'>
        <LanguagePicker />
        <LightModeSwitch />
      </Group>

      <UserAccount />
      <ActionIcon mr='md' variant='subtle' onClick={toggleMenu}>
        <IconMenu2 />
      </ActionIcon>
    </Center>
  )
}

export default BoardHeader
