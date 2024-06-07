import { Board, UsersInBoards } from './prisma-import'
import { ListFullData } from './list-full-data.dto'

export type BoardFullData = Board & {
  users: UsersInBoards[]
  lists: ListFullData[]
}
