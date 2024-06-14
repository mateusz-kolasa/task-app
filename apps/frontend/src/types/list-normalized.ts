import { EntityState } from '@reduxjs/toolkit'
import { Card, ListFullData } from 'shared-types'

export interface ListNormalized extends Omit<ListFullData, 'cards'> {
  cards: EntityState<Card, number>
}
