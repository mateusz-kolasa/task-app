import { EntityState } from '@reduxjs/toolkit'
import { BoardFullData } from 'shared-types'
import { ListNormalized } from './list-normalized'

export interface BoardNormalized extends Omit<BoardFullData, 'lists'> {
  lists: EntityState<ListNormalized, number>
}
