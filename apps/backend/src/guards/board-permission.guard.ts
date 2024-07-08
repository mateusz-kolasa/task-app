import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { BoardPermissions } from 'src/decorators/board-permission.decorator'
import { PrismaService } from 'src/prisma/prisma.service'
import { CardAuthRequest } from 'src/types/user-jwt-payload'

@Injectable()
export class BoardPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get(BoardPermissions, context.getHandler())
    if (requiredPermissions === undefined) {
      return true
    }
    const request: CardAuthRequest = context.switchToHttp().getRequest()
    const boardId = await this.extractBoardId(request)

    if (boardId === undefined) {
      return false
    }

    const userInBoard = await this.prisma.usersInBoards.findFirst({
      where: {
        boardId,
        userId: request.user.id,
      },
    })

    if (!userInBoard) {
      return false
    }

    request.user.permissions = userInBoard.permissions
    request.boardId = boardId
    return userInBoard.permissions >= requiredPermissions
  }

  private async extractBoardId(request: CardAuthRequest): Promise<number> {
    // Try to extract boardId directly from request
    let boardId = parseInt(request.params.boardId) || request.body.boardId

    // If none present, try to get boardId from list
    if (boardId === undefined) {
      let listId = parseInt(request.params.listId) || request.body.listId

      // If listId isn't in request, try geting list by card
      if (listId === undefined) {
        const cardId = parseInt(request.params.cardId) || request.body.cardId

        if (cardId === undefined) {
          throw new NotFoundException()
        }

        const card = await this.prisma.card.findUnique({ where: { id: cardId } })
        if (!card) {
          throw new NotFoundException()
        }

        request.card = card
        listId = card.listId
      }

      if (listId === undefined) {
        throw new NotFoundException()
      }

      const list = await this.prisma.list.findUnique({ where: { id: listId } })
      if (!list) {
        throw new NotFoundException()
      }

      request.list = list
      boardId = list.boardId
    }

    return boardId
  }
}
