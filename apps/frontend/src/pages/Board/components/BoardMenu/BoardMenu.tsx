import BoardUsers from './BoardUsers/BoardUsers'
import { useState } from 'react'
import BoardMenuMain from './BoardMain/BoardMenuMain'
import { Stack } from '@mantine/core'

interface BoardMenuProps {
  toggleMenu: () => void
}

function BoardMenu({ toggleMenu }: Readonly<BoardMenuProps>) {
  const [isInUsersSection, setIsInUsersSection] = useState<boolean>(false)

  return (
    <Stack p='md' h='100%'>
      <BoardUsers
        toggleMenu={toggleMenu}
        isInUsersSection={isInUsersSection}
        setIsInUsersSection={setIsInUsersSection}
      />
      {!isInUsersSection && (
        <BoardMenuMain toggleMenu={toggleMenu} setIsInUsersSection={setIsInUsersSection} />
      )}
    </Stack>
  )
}

export default BoardMenu
