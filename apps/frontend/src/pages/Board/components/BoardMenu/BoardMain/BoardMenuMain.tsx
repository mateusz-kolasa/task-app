import { Button, Divider } from '@mantine/core'
import BoardTitleText from '../BoardTitleText/BoardTitleText'
import BoardDescriptionText from '../BoardDescriptionText/BoardDescriptionText'
import LeaveBoard from '../LeaveBoard/LeaveBoard'
import { useTranslation } from 'react-i18next'
import { IconUsers } from '@tabler/icons-react'

interface BoardMenuMainProps {
  toggleMenu: () => void
  setIsInUsersSection: (a: boolean) => void
}

function BoardMenuMain({ toggleMenu, setIsInUsersSection }: Readonly<BoardMenuMainProps>) {
  const { t } = useTranslation()

  const handleOpenUsersSection = () => setIsInUsersSection(true)

  return (
    <>
      <BoardTitleText toggleMenu={toggleMenu} />
      <BoardDescriptionText />
      <Divider mx='md' />
      <Button
        leftSection={<IconUsers />}
        variant='subtle'
        display='flex'
        onClick={handleOpenUsersSection}
      >
        {t('board.users.list.title')}
      </Button>
      <LeaveBoard />
    </>
  )
}

export default BoardMenuMain
