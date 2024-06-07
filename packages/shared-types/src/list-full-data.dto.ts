import { Card, List } from './prisma-import'

export type ListFullData = List & {
  cards: Card[]
}
