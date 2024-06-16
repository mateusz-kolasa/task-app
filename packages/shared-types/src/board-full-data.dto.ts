import { Board, UsersInBoards } from './prisma-import'
import { ListFullData } from './list-full-data.dto'

interface UserUsername {
  username: string
}

interface UsersInBoardsWithUsername extends UsersInBoards {
  user: UserUsername
}

export interface BoardFullData extends Board {
  users: UsersInBoardsWithUsername[]
  lists: ListFullData[]
}
