import { Card } from './prisma-import'

export interface DeleteCardData {
  deleted: Card
  remaining: Card[]
}
