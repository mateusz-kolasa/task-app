import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { Card } from 'prisma/prisma-client'
import { BOARD_PERMISSIONS } from 'src/consts/user.consts'
import CardCreateData from 'src/dtos/card-create-data.dto'
import { ListService } from 'src/list/list.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class CardService {
  constructor(
    private prisma: PrismaService,
    private listService: ListService,
    private usersService: UsersService
  ) {}

  async create(request: AuthRequest, cardData: CardCreateData): Promise<Card> {
    const list = await this.listService.getFull(cardData.listId)
    if (!list) {
      throw new BadRequestException('List not found')
    }

    const isAuthorized = await this.usersService.isUserAuthorized(
      request.user.id,
      list.boardId,
      BOARD_PERMISSIONS.edit
    )
    if (!isAuthorized) {
      throw new ForbiddenException()
    }

    const lastListPosition = Math.max(...list.cards.map(card => card.position), 0)
    return this.prisma.card.create({
      data: {
        title: cardData.title,
        listId: cardData.listId,
        position: lastListPosition + 1,
      },
    })
  }
}
