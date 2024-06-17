import { BoardFullData } from 'shared-types'

export const SAMPLE_BOARD_USERS: BoardFullData = {
  id: 1,
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
      permissions: 2,
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
        username: 'accoutn name',
      },
      userId: 3,
    },
    {
      boardId: 1,
      permissions: 0,
      id: 4,
      user: {
        username: 'login',
      },
      userId: 4,
    },
  ],
  lists: [],
}
