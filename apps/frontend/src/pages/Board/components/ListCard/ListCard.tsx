import { Stack, Text } from '@mantine/core'
import ListCardBase from 'components/ListCardBase/ListCardBase'
import { ListFullData } from 'shared-types'

interface ListCardProps {
  list: ListFullData
}

function ListCard({ list }: Readonly<ListCardProps>) {
  return (
    <ListCardBase>
      <Stack>
        <Text>{list.title}</Text>
      </Stack>
    </ListCardBase>
  )
}

export default ListCard
