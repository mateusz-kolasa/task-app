import { User, UsersInBoards } from './prisma-import'

export type UsersInBoardsFullData = UsersInBoards & {
  user: User
}
