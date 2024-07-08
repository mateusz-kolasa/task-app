import { Request as HttpRequest } from 'express'
import { Card, List } from 'shared-types'

interface UserJwtPayload {
  id: number
}

interface BoardPermissionPayload {
  user: {
    id: number
    permissions: number
  }
  boardId: number
}

interface ListPayload {
  list: List
}

interface CardPayload {
  card: Card
}

export type AuthRequest = HttpRequest & { user: UserJwtPayload }
export type BoardAuthRequest = HttpRequest & BoardPermissionPayload
export type ListAuthRequest = BoardAuthRequest & ListPayload
export type CardAuthRequest = ListAuthRequest & CardPayload
