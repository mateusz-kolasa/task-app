import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Card } from 'prisma/prisma-client'
import { ListFullData } from 'shared-types'
import { BOARD_PERMISSIONS } from 'src/consts/user.consts'
import ChangeCardPositionData from 'src/dtos/card-change-position.data.dto'
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

  async moveBetweenLists(changePositionData: ChangeCardPositionData, currentCardData: Card) {
    return this.prisma.$transaction([
      this.prisma.card.update({
        data: {
          position: changePositionData.position,
          listId: changePositionData.newListId,
        },
        where: {
          id: changePositionData.cardId,
        },
      }),
      // Increase position of cards in new list
      this.prisma.card.updateMany({
        data: {
          position: {
            increment: 1,
          },
        },
        where: {
          position: {
            gte: changePositionData.position,
          },
          listId: changePositionData.newListId,
        },
      }),
      // Decrease positions of cards in old list
      this.prisma.card.updateMany({
        data: {
          position: {
            decrement: 1,
          },
        },
        where: {
          position: {
            gt: currentCardData.position,
          },
          listId: currentCardData.listId,
        },
      }),
    ])
  }

  async movePositionInList(changePositionData: ChangeCardPositionData, currentCardData: Card) {
    if (changePositionData.position < currentCardData.position) {
      return this.prisma.$transaction([
        this.prisma.card.update({
          data: {
            position: changePositionData.position,
          },
          where: {
            id: changePositionData.cardId,
          },
        }),
        // If moving card towards front, shift cards between one step to back
        this.prisma.card.updateMany({
          data: {
            position: {
              increment: 1,
            },
          },
          where: {
            position: {
              gte: changePositionData.position,
              lt: currentCardData.position,
            },
            listId: currentCardData.listId,
          },
        }),
      ])
    } else {
      return this.prisma.$transaction([
        this.prisma.card.update({
          data: {
            position: changePositionData.position,
          },
          where: {
            id: changePositionData.cardId,
          },
        }),
        // If moving card towards end, shift cards between one step to front
        this.prisma.card.updateMany({
          data: {
            position: {
              decrement: 1,
            },
          },
          where: {
            position: {
              gt: currentCardData.position,
              lte: changePositionData.position,
            },
            listId: currentCardData.listId,
          },
        }),
      ])
    }
  }

  async changePosition(
    request: AuthRequest,
    changePositionData: ChangeCardPositionData
  ): Promise<Card[]> {
    const card = await this.prisma.card.findUnique({
      where: {
        id: changePositionData.cardId,
      },
    })

    if (!card) {
      throw new NotFoundException()
    }

    if (
      card.position === changePositionData.position &&
      (!changePositionData.newListId || card.listId === changePositionData.newListId)
    ) {
      throw new BadRequestException()
    }

    const list = await this.prisma.list.findUnique({
      where: {
        id: card.listId,
      },
      include: {
        cards: true,
      },
    })

    let newList: ListFullData
    if (changePositionData.newListId) {
      newList = await this.prisma.list.findUnique({
        where: {
          id: changePositionData.newListId,
        },
        include: {
          cards: true,
        },
      })

      if (!newList) {
        throw new NotFoundException()
      }

      if (newList.boardId !== list.boardId) {
        throw new BadRequestException()
      }
    }

    const isAuthorized = await this.usersService.isUserAuthorized(
      request.user.id,
      list.boardId,
      BOARD_PERMISSIONS.edit
    )

    if (!isAuthorized) {
      throw new ForbiddenException()
    }

    // Make sure new position is within current bounds
    const cards = changePositionData.newListId ? newList.cards : list.cards
    const maxPosition = Math.max(...cards.map(card => card.position))
    if (changePositionData.position > maxPosition) {
      throw new BadRequestException()
    }

    if (changePositionData.newListId) {
      await this.moveBetweenLists(changePositionData, card)
      return this.prisma.card.findMany({
        where: {
          listId: {
            in: [card.listId, changePositionData.newListId],
          },
        },
      })
    } else {
      await this.movePositionInList(changePositionData, card)
      return this.prisma.card.findMany({
        where: {
          listId: card.listId,
        },
      })
    }
  }
}
