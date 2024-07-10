import { Group, ScrollArea, Stack } from '@mantine/core'
import ListCardBase from 'components/ListCardBase/ListCardBase'
import TaskCard from '../TaskCard/TaskCard'
import AddCardButton from './AddCard/AddCardButton'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { BOARD_PERMISSIONS } from 'shared-consts'
import ListTitleText from './ListTitleText/ListTitleText'
import ListDeleteButton from './ListDeleteButton/ListDeleteButton'

interface ListCardProps {
  listId: number
}

function ListCard({ listId }: Readonly<ListCardProps>) {
  const { boardId } = useParams()
  const { cardIds, position = 0 } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const list = data?.lists.entities[listId]
      return { title: list?.title, cardIds: list?.cards.ids, position: list?.position }
    },
  })

  const isAuthorized = useIsAuthorized()

  return (
    <Draggable
      draggableId={`list_${listId}`}
      index={position}
      isDragDisabled={!isAuthorized(BOARD_PERMISSIONS.edit)}
    >
      {provided => (
        <ListCardBase draggableProps={provided.draggableProps} innerRef={provided.innerRef}>
          <Group>
            <ListTitleText listId={listId} dragHandleProps={provided.dragHandleProps} />
            <ListDeleteButton listId={listId} />
          </Group>
          <Droppable droppableId={listId.toString()} type='card'>
            {provided => (
              <ScrollArea.Autosize scrollbars='y' type='auto' mt='md' mb='md' flex={1} w='100%'>
                <Stack
                  data-testid='list-stack'
                  mih={20}
                  w='100%'
                  ref={provided.innerRef}
                  // Apply margin directly in children due to dnd library not recognizing including gap
                  gap={0}
                  {...provided.droppableProps}
                >
                  {cardIds?.map(cardId => (
                    <TaskCard listId={listId} cardId={cardId} key={cardId} />
                  ))}
                  {provided.placeholder}
                </Stack>
              </ScrollArea.Autosize>
            )}
          </Droppable>
          <AddCardButton listId={listId} />
        </ListCardBase>
      )}
    </Draggable>
  )
}

export default ListCard
