import { List } from './prisma-import'

export interface DeleteListData {
  deleted: List
  remaining: List[]
}
