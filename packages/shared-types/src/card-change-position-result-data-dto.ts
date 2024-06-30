import { Card } from './prisma-import'

export interface ChangeCardPositionResultData {
  sourceCard: Card
  targetCard: Card
  updatedCards: Card[]
}
