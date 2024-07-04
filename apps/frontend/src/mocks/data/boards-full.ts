import { BoardFullData } from 'shared-types'
import { SAMPLE_LISTS } from './lists'

export const SAMPLE_BOARDS_FULL: Record<string, BoardFullData> = {
  '1': {
    id: 1,
    description: 'description',
    title: 'board 1',
    users: [
      {
        boardId: 1,
        permissions: 3,
        id: 1,
        user: {
          username: 'name',
        },
        userId: 1,
      },
    ],
    lists: [],
  },
  '2': {
    id: 2,
    description: '',
    title: 'board 2',
    users: [
      {
        boardId: 1,
        permissions: 3,
        id: 1,
        user: {
          username: 'name',
        },
        userId: 1,
      },
      {
        boardId: 1,
        permissions: 0,
        id: 2,
        user: {
          username: 'username',
        },
        userId: 2,
      },
    ],
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
    description: 'description',
    title: 'board 3',
    users: [
      {
        boardId: 1,
        permissions: 3,
        id: 1,
        user: {
          username: 'name',
        },
        userId: 1,
      },
      {
        boardId: 1,
        permissions: 0,
        id: 2,
        user: {
          username: 'username',
        },
        userId: 2,
      },
      {
        boardId: 1,
        permissions: 1,
        id: 3,
        user: {
          username: 'user 3',
        },
        userId: 3,
      },
      {
        boardId: 1,
        permissions: 2,
        id: 4,
        user: {
          username: 'admin',
        },
        userId: 4,
      },
    ],
    lists: SAMPLE_LISTS,
  },
}
