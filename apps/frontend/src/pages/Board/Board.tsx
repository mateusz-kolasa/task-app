import { Group, ScrollArea } from '@mantine/core'
import { Outlet, useParams } from 'react-router-dom'
import { useBoardDataQuery } from '../../store/slices/api/board-api-slice'
import ListButton from './components/ListButton/ListButton'
import ListCard from './components/ListCard/ListCard'
import { APP_SHELL_MAIN_HEIGHT } from 'consts/style-consts'
import BaseLayout from '../../components/BaseLayout/BaseLayout'
import BoardHeader from './components/BoardHeader/BoardHeader'
import { useDisclosure } from '@mantine/hooks'
import BoardMenu from './components/BoardMenu/BoardMenu'

function Board() {
  const { boardId } = useParams()

  const { listIds = [] } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      return { listIds: data?.lists.ids }
    },
  })

  const [isMenuOpened, { toggle }] = useDisclosure(false)

  return (
    <BaseLayout
      SpecialHeader={<BoardHeader toggleMenu={toggle} />}
      Aside={<BoardMenu />}
      isAsideCollapsed={!isMenuOpened}
    >
      <ScrollArea h={APP_SHELL_MAIN_HEIGHT}>
        <Group wrap='nowrap' align='flex-start' data-testid='board-group'>
          {listIds.map(listId => (
            <ListCard listId={listId} key={listId} />
          ))}
          <ListButton />
        </Group>
      </ScrollArea>
      <Outlet />
    </BaseLayout>
  )
}

export default Board
