import { Board } from './prisma-import'
import { ListFullData } from './list-full-data.dto'
import { UsersInBoardsWithUsername } from './board-user-username-data.dto'

export interface BoardFullData extends Board {
  users: UsersInBoardsWithUsername[]
  lists: ListFullData[]
}
