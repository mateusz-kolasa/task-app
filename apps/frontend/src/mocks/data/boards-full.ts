import { BoardFullData } from 'shared-types'
import { SAMPLE_LISTS } from './lists'

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
    lists: SAMPLE_LISTS,
  },
}
