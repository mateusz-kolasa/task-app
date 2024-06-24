import { ListFullData } from 'shared-types'

export const SAMPLE_LISTS: ListFullData[] = [
  {
    id: 1,
    title: 'list 1',
    boardId: 1,
    position: 1,
    cards: [
      {
        id: 1,
        title: 'card 1',
        description: '',
        listId: 1,
        position: 1,
      },
    ],
  },
  {
    id: 2,
    title: 'list 2',
    boardId: 1,
    position: 2,
    cards: [],
  },
  {
    id: 3,
    title: 'list 3',
    boardId: 1,
    position: 3,
    cards: [
      {
        id: 2,
        title: 'card 2',
        description: '',
        listId: 3,
        position: 1,
      },
      {
        id: 3,
        title: 'card 3',
        description: '',
        listId: 3,
        position: 2,
      },
      {
        id: 4,
        title: 'card 4',
        description: '',
        listId: 3,
        position: 3,
      },
      {
        id: 5,
        title: 'card 5',
        description: '',
        listId: 3,
        position: 4,
      },
    ],
  },
]
