import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Card } from 'prisma/prisma-client'
import { ChangeCardPositionResultData, DeleteCardData, ListFullData } from 'shared-types'
import CardAssignUserData from 'src/dtos/card-assign-user-data.dto'
import ChangeCardDescriptionData from 'src/dtos/card-change-description-data.dto'
import ChangeCardPositionData from 'src/dtos/card-change-position.data.dto'
import ChangeCardTitleData from 'src/dtos/card-change-title-data.dto'
import CardCreateData from 'src/dtos/card-create-data.dto'
import { ListService } from 'src/list/list.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { CardAuthRequest } from 'src/types/user-jwt-payload'

@Injectable()
export class CardService {
  constructor(
    private prisma: PrismaService,
    private listService: ListService
  ) {}

  async create(cardData: CardCreateData): Promise<Card> {
    const list = await this.listService.getFull(cardData.listId)

    const lastListPosition = Math.max(...list.cards.map(card => card.position), 0)
    return this.prisma.card.create({
      data: {
        title: cardData.title,
        listId: cardData.listId,
        position: lastListPosition + 1,
      },
    })
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
    request: CardAuthRequest,
    changePositionData: ChangeCardPositionData
  ): Promise<ChangeCardPositionResultData> {
    const { card } = request

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

    return {
      sourceCard: card,
      targetCard,
      updatedCards,
    }
  }

  async changeTitle(request: CardAuthRequest, changeTitleData: ChangeCardTitleData): Promise<Card> {
    return this.prisma.card.update({
      data: {
        title: changeTitleData.title,
      },
      where: {
        id: changeTitleData.cardId,
      },
    })
  }

  async changeDescription(
    request: CardAuthRequest,
    changeDescriptionData: ChangeCardDescriptionData
  ): Promise<Card> {
    return await this.prisma.card.update({
      data: {
        description: changeDescriptionData.description,
      },
      where: {
        id: changeDescriptionData.cardId,
      },
    })
  }

  async assignUser(request: CardAuthRequest, assignUserData: CardAssignUserData) {
    if (assignUserData.userId !== null) {
      const assignedUserInBoard = await this.prisma.usersInBoards.findFirst({
        where: {
          boardId: request.boardId,
          userId: assignUserData.userId,
        },
      })

      if (!assignedUserInBoard) {
        throw new BadRequestException()
      }
    }

    return this.prisma.card.update({
      data: {
        userId: assignUserData.userId,
      },
      where: {
        id: assignUserData.cardId,
      },
    })
  }

  async delete(request: CardAuthRequest, cardId: number): Promise<DeleteCardData> {
    const { card } = request

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

    return {
      deleted: card,
      remaining: updatedCards,
    }
  }
}
