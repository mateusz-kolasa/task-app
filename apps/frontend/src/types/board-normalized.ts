import { EntityState } from '@reduxjs/toolkit'
import { BoardFullData, UsersInBoardsWithUsername } from 'shared-types'
import { ListNormalized } from './list-normalized'

export interface BoardNormalized extends Omit<BoardFullData, 'lists' | 'users'> {
  lists: EntityState<ListNormalized, number>
  users: EntityState<UsersInBoardsWithUsername, number>
}
