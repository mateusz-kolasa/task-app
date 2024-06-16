import { Stack, Text } from '@mantine/core'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'

function BoardMenu() {
  const { boardId } = useParams()

  const { title = '', description = '' } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      return { title: data?.title, description: data?.description }
    },
  })

  return (
    <Stack mt='md'>
      <Text ta='center' fw='bold' size='lg'>
        {title}
      </Text>
      <Text ta='center'>{description}</Text>
    </Stack>
  )
}

export default BoardMenu
