import { Center, Group, ScrollArea, Text } from '@mantine/core'
import { Outlet, useParams } from 'react-router-dom'
import { useBoardDataQuery } from '../../store/slices/api/board-api-slice'
import { APP_SHELL_SUBHEADER_MAIN_HEIGHT } from 'consts/style-consts'
import BaseLayout from '../../components/BaseLayout/BaseLayout'
import { useDisclosure } from '@mantine/hooks'
import BoardMenu from './components/BoardMenu/BoardMenu'
import AddListButton from './components/AddListButton/AddListButton'
import BoardDndContext from 'components/BoardDndContext/BoardDndContext'
import { useTranslation } from 'react-i18next'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import AuthenticatedHeader from 'components/AuthenticatedHeader/AuthenticatedHeader'
import BoardSubHeader from './components/BoardSubHeader/BoardSubHeader'
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import SortableListCard from './components/ListCard/SortableListCard'
import { useSelector } from 'react-redux'
import { RootState } from 'store/store'

function Board() {
  const { boardId } = useParams()

  const { listIds = [], error } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data, error }) => {
      return { listIds: data?.lists.ids, error }
    },
  })

  // Force rerender on drag end, otherwise list animates return to original position
  useSelector((state: RootState) => state.draggable.list?.listId)

  const { t } = useTranslation()
  const [isMenuOpened, { toggle }] = useDisclosure(false)

  if (error && (error as FetchBaseQueryError).status === 403) {
    return (
      <BaseLayout>
        <Center>
          <Text size='xl' fw='bold'>
            {t('board.data.fetch.unauthorized')}
          </Text>
        </Center>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout
      SpecialHeader={<AuthenticatedHeader />}
      Aside={<BoardMenu toggleMenu={toggle} />}
      isAsideCollapsed={!isMenuOpened}
    >
      <BoardDndContext>
        <BoardSubHeader isMenuOpened={isMenuOpened} toggleMenu={toggle} />
        <ScrollArea
          h={APP_SHELL_SUBHEADER_MAIN_HEIGHT}
          scrollbars='x'
          style={{ overflowY: 'hidden' }}
        >
          <Group
            wrap='nowrap'
            align='flex-start'
            data-testid='board-group'
            // Apply margin directly in children due to dnd library not recognizing including gap
            gap={0}
          >
            <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
              {listIds.map(listId => (
                <SortableListCard listId={listId} key={listId} />
              ))}
              <AddListButton />
            </SortableContext>
          </Group>
        </ScrollArea>
      </BoardDndContext>
      <Outlet />
    </BaseLayout>
  )
}

export default Board
