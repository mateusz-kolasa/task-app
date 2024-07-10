import { Divider, Stack } from '@mantine/core'
import BoardUsers from '../BoardUsers/BoardUsers'
import BoardTitleText from './BoardTitleText/BoardTitleText'
import BoardDescriptionText from './BoardDescriptionText/BoardDescriptionText'

interface BoardMenuProps {
  toggleMenu: () => void
}

function BoardMenu({ toggleMenu }: Readonly<BoardMenuProps>) {
  return (
    <Stack mt='md' h='100%'>
      <BoardTitleText toggleMenu={toggleMenu} />
      <BoardDescriptionText />
      <Divider m='md' />
      <BoardUsers />
    </Stack>
  )
}

export default BoardMenu
