import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Card } from 'prisma/prisma-client'
import { BOARD_SOCKET_MESSAGES } from 'shared-consts'
import { ChangeCardPositionResultData, DeleteCardData, ListFullData } from 'shared-types'
import { BoardGateway } from 'src/board/board.gateway'
import { BOARD_PERMISSIONS } from 'src/consts/user.consts'
import ChangeCardPositionData from 'src/dtos/card-change-position.data.dto'
import ChangeCardTitleData from 'src/dtos/card-change-title-data.dto'
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
    private usersService: UsersService,
    private boardGateway: BoardGateway
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
    const createdCard = await this.prisma.card.create({
      data: {
        title: cardData.title,
        listId: cardData.listId,
        position: lastListPosition + 1,
      },
    })

    this.boardGateway.sendMessage(list.boardId, BOARD_SOCKET_MESSAGES.AddCard, {
      boardId: list.boardId,
      payload: createdCard,
    })
    return createdCard
  }

  async moveBetweenLists(
    changePositionData: ChangeCardPositionData,
    currentCardData: Card
  ): Promise<Card> {
    const [, , updatedCard] = await this.prisma.$transaction([
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
      this.prisma.card.update({
        data: {
          position: changePositionData.position,
          listId: changePositionData.newListId,
        },
        where: {
          id: changePositionData.cardId,
        },
      }),
    ])

    return updatedCard
  }

  async movePositionInList(
    changePositionData: ChangeCardPositionData,
    currentCardData: Card
  ): Promise<Card> {
    if (changePositionData.position < currentCardData.position) {
      const [, updatedCard] = await this.prisma.$transaction([
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
        this.prisma.card.update({
          data: {
            position: changePositionData.position,
          },
          where: {
            id: changePositionData.cardId,
          },
        }),
      ])

      return updatedCard
    } else {
      const [, updatedCard] = await this.prisma.$transaction([
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
        this.prisma.card.update({
          data: {
            position: changePositionData.position,
          },
          where: {
            id: changePositionData.cardId,
          },
        }),
      ])

      return updatedCard
    }
  }

  async changePosition(
    request: AuthRequest,
    changePositionData: ChangeCardPositionData
  ): Promise<ChangeCardPositionResultData> {
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
    let maxPosition = Math.max(...cards.map(card => card.position), 0)
    if (changePositionData.newListId) {
      maxPosition += 1
    }

    if (changePositionData.position > maxPosition) {
      throw new BadRequestException()
    }

    let updatedCards: Card[]
    let targetCard: Card
    if (changePositionData.newListId) {
      targetCard = await this.moveBetweenLists(changePositionData, card)
      updatedCards = await this.prisma.card.findMany({
        where: {
          listId: {
            in: [card.listId, changePositionData.newListId],
          },
        },
      })
    } else {
      targetCard = await this.movePositionInList(changePositionData, card)
      updatedCards = await this.prisma.card.findMany({
        where: {
          listId: card.listId,
        },
      })
    }

    const positionUpdate: ChangeCardPositionResultData = {
      sourceCard: card,
      targetCard,
      updatedCards,
    }
    this.boardGateway.sendMessage(list.boardId, BOARD_SOCKET_MESSAGES.ChangeCardPosition, {
      boardId: list.boardId,
      payload: positionUpdate,
    })

    return positionUpdate
  }

  async changeTitle(request: AuthRequest, changeTitleData: ChangeCardTitleData): Promise<Card> {
    const card = await this.prisma.card.findUnique({
      where: {
        id: changeTitleData.cardId,
      },
    })

    if (!card) {
      throw new NotFoundException()
    }

    const list = await this.prisma.list.findUnique({
      where: {
        id: card.listId,
      },
    })

    const isAuthorized = await this.usersService.isUserAuthorized(
      request.user.id,
      list.boardId,
      BOARD_PERMISSIONS.edit
    )

    if (!isAuthorized) {
      throw new ForbiddenException()
    }

    const updatedCard = await this.prisma.card.update({
      data: {
        title: changeTitleData.title,
      },
      where: {
        id: changeTitleData.cardId,
      },
    })
    this.boardGateway.sendMessage(list.boardId, BOARD_SOCKET_MESSAGES.ChangeCardTitle, {
      boardId: list.boardId,
      payload: updatedCard,
    })
    return updatedCard
  }

  async delete(request: AuthRequest, cardId: number): Promise<DeleteCardData> {
    const card = await this.prisma.card.findUnique({
      where: {
        id: cardId,
      },
    })

    if (!card) {
      throw new NotFoundException()
    }

    const list = await this.prisma.list.findUnique({
      where: {
        id: card.listId,
      },
    })

    const isAuthorized = await this.usersService.isUserAuthorized(
      request.user.id,
      list.boardId,
      BOARD_PERMISSIONS.edit
    )

    if (!isAuthorized) {
      throw new ForbiddenException()
    }

    await this.prisma.$transaction([
      this.prisma.card.delete({
        where: {
          id: cardId,
        },
      }),
      this.prisma.card.updateMany({
        data: {
          position: {
            decrement: 1,
          },
        },
        where: {
          position: {
            gt: card.position,
          },
          listId: card.listId,
        },
      }),
    ])

    const updatedCards = await this.prisma.card.findMany({
      where: {
        listId: card.listId,
      },
    })

    const deleteCardData = {
      deleted: card,
      remaining: updatedCards,
    }

    this.boardGateway.sendMessage(list.boardId, BOARD_SOCKET_MESSAGES.DeleteCard, {
      boardId: list.boardId,
      payload: deleteCardData,
    })

    return deleteCardData
  }
}
