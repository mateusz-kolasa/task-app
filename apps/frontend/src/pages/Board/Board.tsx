import { Group, ScrollArea } from '@mantine/core'
import { Outlet, useParams } from 'react-router-dom'
import { useBoardDataQuery } from '../../store/slices/api/board-api-slice'
import ListCard from './components/ListCard/ListCard'
import { APP_SHELL_MAIN_HEIGHT } from 'consts/style-consts'
import BaseLayout from '../../components/BaseLayout/BaseLayout'
import BoardHeader from './components/BoardHeader/BoardHeader'
import { useDisclosure } from '@mantine/hooks'
import BoardMenu from './components/BoardMenu/BoardMenu'
import { Droppable } from '@hello-pangea/dnd'
import AddListButton from './components/AddListButton/AddListButton'
import BoardDndContext from 'components/BoardDndContext/BoardDndContext'

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
      <BoardDndContext>
        <Droppable droppableId='board' direction='horizontal' type='list'>
          {provided => (
            <ScrollArea h={APP_SHELL_MAIN_HEIGHT} scrollbars='x' style={{ overflowY: 'hidden' }}>
              <Group
                wrap='nowrap'
                align='flex-start'
                data-testid='board-group'
                ref={provided.innerRef}
                // Apply margin directly in children due to dnd library not recognizing including gap
                gap={0}
                {...provided.droppableProps}
              >
                {listIds.map(listId => (
                  <ListCard listId={listId} key={listId} />
                ))}
                {provided.placeholder}
                <AddListButton />
              </Group>
            </ScrollArea>
          )}
        </Droppable>
      </BoardDndContext>
      <Outlet />
    </BaseLayout>
  )
}

export default Board
