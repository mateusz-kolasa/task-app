import { Divider, Stack } from '@mantine/core'
import BoardUsers from '../BoardUsers/BoardUsers'
import BoardTitleText from './BoardTitleText/BoardTitleText'
import BoardDescriptionText from './BoardDescriptionText/BoardDescriptionText'

function BoardMenu() {
  return (
    <Stack mt='md' h='100%'>
      <BoardTitleText />
      <BoardDescriptionText />
      <Divider m='md' />
      <BoardUsers />
    </Stack>
  )
}

export default BoardMenu
