import { UsersInBoards } from './prisma-import'

interface UserUsername {
  username: string
}

export interface UsersInBoardsWithUsername extends UsersInBoards {
  user: UserUsername
}
