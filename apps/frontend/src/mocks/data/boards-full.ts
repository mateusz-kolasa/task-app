import { BoardFullData } from 'shared-types'

export const SAMPLE_BOARDS_FULL: Record<string, BoardFullData> = {
  '1': {
    id: 1,
    description: '',
    title: 'board 1',
    users: [],
    lists: [],
  },
  '2': {
    id: 2,
    description: '',
    title: 'board 2',
    users: [],
    lists: [
      {
        id: 1,
        boardId: 2,
        cards: [],
        position: 1,
        title: 'list 1',
      },
    ],
  },
  '3': {
    id: 3,
    description: '',
    title: 'board 3',
    users: [],
    lists: [
      {
        id: 2,
        boardId: 3,
        cards: [],
        position: 1,
        title: 'list 2',
      },
      {
        id: 3,
        boardId: 3,
        cards: [],
        position: 2,
        title: 'list 3',
      },
      {
        id: 4,
        boardId: 3,
        cards: [],
        position: 3,
        title: 'list 3',
      },
    ],
  },
}
