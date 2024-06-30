import { Test, TestingModule } from '@nestjs/testing'
import { CardService } from './card.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ListModule } from 'src/list/list.module'
import { PrismaService } from 'src/prisma/prisma.service'
import { ListService } from 'src/list/list.service'
import { UsersService } from 'src/users/users.service'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { UsersModule } from 'src/users/users.module'
import { ListFullData } from 'shared-types'
import { Card, List } from 'prisma/prisma-client'
import ChangeCardPositionData from 'src/dtos/card-change-position.data.dto'
import ChangeCardTitleData from 'src/dtos/card-change-title-data.dto'
import { BoardGateway } from 'src/board/board.gateway'
import { ConfigModule } from '@nestjs/config'
import { BoardModule } from 'src/board/board.module'

describe('CardService', () => {
  let service: CardService
  let prisma: PrismaService
  let listService: ListService
  let boardGateway: BoardGateway
  let usersService: UsersService

  const request = {
    user: {
      id: 1,
    },
  } as AuthRequest

  const cardData = {
    title: 'card',
    listId: 100,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardService],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ListModule,
        PrismaModule,
        UsersModule,
        BoardModule,
      ],
    }).compile()

    service = module.get<CardService>(CardService)
    prisma = module.get<PrismaService>(PrismaService)
    listService = module.get<ListService>(ListService)
    usersService = module.get<UsersService>(UsersService)
    boardGateway = module.get<BoardGateway>(BoardGateway)

    boardGateway.sendMessage = jest.fn()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('creates card at end of list', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.create = jest.fn()
      listService.getFull = jest.fn().mockReturnValueOnce({
        id: 1,
        title: 'list',
        position: 1,
        boardId: 1,
        cards: [
          {
            id: 1,
            title: 'card',
            position: 1,
          },
        ],
      })
      await service.create(request, cardData)
      expect(prisma.card.create).toHaveBeenCalledWith({
        data: {
          ...cardData,
          position: 2,
        },
      })
    })

    it('creates card at start of list with no existing cards', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.create = jest.fn()
      listService.getFull = jest.fn().mockReturnValueOnce({
        id: 1,
        title: 'list',
        position: 1,
        boardId: 1,
        cards: [],
      })
      await service.create(request, cardData)
      expect(prisma.card.create).toHaveBeenCalledWith({
        data: {
          ...cardData,
          position: 1,
        },
      })
    })

    it('returns list with created card', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      listService.getFull = jest
        .fn()
        .mockReturnValueOnce({ id: 1, title: 'list', position: 1, boardId: 1, cards: [] })

      const card = {
        id: 1,
        title: 'card',
        position: 1,
      }

      prisma.card.create = jest.fn().mockReturnValueOnce(card)

      const response = await service.create(request, cardData)
      expect(response).toBe(card)
    })

    it('throws forbidden exception for unathorized user', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(false)
      listService.getFull = jest
        .fn()
        .mockReturnValueOnce({ id: 1, title: 'list', position: 1, boardId: 1, cards: [] })

      const card = {
        id: 1,
        title: 'card',
        position: 1,
      }

      prisma.card.create = jest.fn().mockReturnValueOnce(card)

      expect(service.create(request, cardData)).rejects.toThrow(ForbiddenException)
    })
  })

  describe('changePosition', () => {
    const changePositionFrontData: ChangeCardPositionData = {
      cardId: 1,
      position: 1,
    }

    const originalCard: Card = {
      id: 1,
      position: 3,
      title: '',
      listId: 1,
      description: '',
    }

    const originalList: ListFullData = {
      boardId: 1,
      id: 1,
      position: 1,
      title: '',
      cards: [1, 2, 3, 4, 5].map(position => ({
        position,
        id: position,
        title: '',
        listId: 1,
        description: '',
      })),
    }

    const changedPositionListData: ChangeCardPositionData = {
      cardId: 1,
      position: 3,
      newListId: 2,
    }

    const otherList = {
      ...originalList,
      position: 2,
      id: 2,
    }

    it('changes position towards front', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.update = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn().mockResolvedValueOnce([null, null, null])

      await service.changePosition(request, changePositionFrontData)

      expect(prisma.card.update).toHaveBeenCalledWith({
        data: {
          position: changePositionFrontData.position,
        },
        where: {
          id: changePositionFrontData.cardId,
        },
      })
      expect(prisma.card.updateMany).toHaveBeenCalledWith({
        data: {
          position: {
            increment: 1,
          },
        },
        where: {
          position: {
            gte: changePositionFrontData.position,
            lt: originalCard.position,
          },
          listId: originalCard.listId,
        },
      })
    })

    it('changes position towards end', async () => {
      const changePositionData: ChangeCardPositionData = {
        cardId: 1,
        position: 5,
      }
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.update = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn().mockResolvedValueOnce([null, null, null])

      await service.changePosition(request, changePositionData)

      expect(prisma.card.update).toHaveBeenCalledWith({
        data: {
          position: changePositionData.position,
        },
        where: {
          id: changePositionData.cardId,
        },
      })
      expect(prisma.card.updateMany).toHaveBeenCalledWith({
        data: {
          position: {
            decrement: 1,
          },
        },
        where: {
          position: {
            lte: changePositionData.position,
            gt: originalCard.position,
          },
          listId: originalCard.listId,
        },
      })
    })

    it('moves card to other list', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest
        .fn()
        .mockResolvedValueOnce(originalList)
        .mockResolvedValueOnce(otherList)
      prisma.card.update = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn().mockResolvedValueOnce([null, null, null])

      await service.changePosition(request, changedPositionListData)

      expect(prisma.card.update).toHaveBeenCalledWith({
        data: {
          position: changedPositionListData.position,
          listId: changedPositionListData.newListId,
        },
        where: {
          id: changedPositionListData.cardId,
        },
      })
      expect(prisma.card.updateMany).toHaveBeenCalledWith({
        data: {
          position: {
            increment: 1,
          },
        },
        where: {
          position: {
            gte: changedPositionListData.position,
          },
          listId: changedPositionListData.newListId,
        },
      })
      expect(prisma.card.updateMany).toHaveBeenCalledWith({
        data: {
          position: {
            decrement: 1,
          },
        },
        where: {
          position: {
            gt: originalCard.position,
          },
          listId: originalCard.listId,
        },
      })
    })

    it('returns updated positions', async () => {
      const updatedPositions = [
        {
          id: 3,
          position: 1,
        },
        {
          id: 1,
          position: 2,
        },
        {
          id: 2,
          position: 3,
        },
        {
          id: 4,
          position: 4,
        },
        {
          id: 5,
          position: 5,
        },
      ]

      const updatedCard = { ...originalCard, position: 5 }

      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.update = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.card.findMany = jest.fn().mockResolvedValueOnce(updatedPositions)
      prisma.$transaction = jest.fn().mockResolvedValueOnce([null, updatedCard])

      const result = await service.changePosition(request, changePositionFrontData)
      expect(result).toStrictEqual({
        sourceCard: originalCard,
        targetCard: updatedCard,
        updatedCards: updatedPositions,
      })
    })

    it('throws not found if card doesnt exist', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(null)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.update = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      expect(service.changePosition(request, changePositionFrontData)).rejects.toThrow(
        NotFoundException
      )
    })

    it('throws bad request if position is same as current', async () => {
      const changePositionData: ChangeCardPositionData = { cardId: 1, position: 3 }

      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.update = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      expect(service.changePosition(request, changePositionData)).rejects.toThrow(
        BadRequestException
      )
    })

    it('throws not found if new list doesnt exist', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest
        .fn()
        .mockResolvedValueOnce(originalList)
        .mockResolvedValueOnce(null)
      prisma.card.update = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      expect(service.changePosition(request, changedPositionListData)).rejects.toThrow(
        NotFoundException
      )
    })

    it('throws bad request if new list is in other board', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest
        .fn()
        .mockResolvedValueOnce(originalList)
        .mockResolvedValueOnce({
          ...otherList,
          boardId: 3,
        })
      prisma.card.update = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      expect(service.changePosition(request, changedPositionListData)).rejects.toThrow(
        BadRequestException
      )
    })

    it('throws forbidden for user without permissions', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(false)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.update = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      expect(service.changePosition(request, changePositionFrontData)).rejects.toThrow(
        ForbiddenException
      )
    })

    it('throws bad request if new position is beyond current bounds', async () => {
      const changePositionData: ChangeCardPositionData = {
        cardId: 1,
        position: 7,
      }

      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.update = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      expect(service.changePosition(request, changePositionData)).rejects.toThrow(
        BadRequestException
      )
    })
  })

  describe('changeTitle', () => {
    const originaCard: Card = {
      title: 'old title',
      id: 1,
      listId: 1,
      position: 1,
      description: '',
    }

    const originalList: List = {
      title: '',
      id: 1,
      boardId: 1,
      position: 1,
    }

    const changeTitleData: ChangeCardTitleData = {
      cardId: 1,
      title: 'new title',
    }

    it('updates card with new title', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originaCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.update = jest.fn()

      await service.changeTitle(request, changeTitleData)
      expect(prisma.card.update).toHaveBeenCalledWith({
        data: {
          title: changeTitleData.title,
        },
        where: {
          id: changeTitleData.cardId,
        },
      })
    })

    it('returns updated card', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originaCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.update = jest.fn().mockResolvedValueOnce({
        ...originaCard,
        title: changeTitleData.title,
      })

      const response = await service.changeTitle(request, changeTitleData)
      expect(response).toStrictEqual({
        ...originaCard,
        title: changeTitleData.title,
      })
    })

    it('throws forbidden for unauthorized user', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(false)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originaCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.update = jest.fn()

      expect(service.changeTitle(request, changeTitleData)).rejects.toThrow(ForbiddenException)
    })
  })

  describe('delete', () => {
    const cardId = 1
    const originalCard: Card = {
      id: 1,
      position: 3,
      title: '',
      listId: 1,
      description: '',
    }

    const originalList: List = {
      id: 1,
      boardId: 1,
      position: 3,
      title: '',
    }

    it('deletes card', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.findMany = jest
        .fn()
        .mockResolvedValueOnce(
          [1, 2, 3, 4, 5].map(position => ({
            position,
          }))
        )
        .mockResolvedValueOnce([])
      prisma.card.delete = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      await service.delete(request, cardId)

      expect(prisma.card.delete).toHaveBeenCalledWith({
        where: {
          id: cardId,
        },
      })
      expect(prisma.card.updateMany).toHaveBeenCalledWith({
        data: {
          position: {
            decrement: 1,
          },
        },
        where: {
          position: {
            gt: originalCard.position,
          },
          listId: originalCard.listId,
        },
      })
    })

    it('returns delete data', async () => {
      const updatedPositions = [
        {
          id: 3,
          position: 1,
        },
        {
          id: 2,
          position: 2,
        },
        {
          id: 4,
          position: 3,
        },
        {
          id: 5,
          position: 4,
        },
      ]

      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.findMany = jest.fn().mockResolvedValueOnce(updatedPositions)
      prisma.card.delete = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      const result = await service.delete(request, cardId)
      expect(result).toStrictEqual({
        deleted: originalCard,
        remaining: updatedPositions,
      })
    })

    it('throws not found if card doesnt exist', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(null)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.findMany = jest
        .fn()
        .mockResolvedValueOnce(
          [1, 2, 3, 4, 5].map(position => ({
            position,
          }))
        )
        .mockResolvedValueOnce([])
      prisma.card.delete = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      expect(service.delete(request, cardId)).rejects.toThrow(NotFoundException)
    })

    it('throws forbidden for user without permissions', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(false)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.findMany = jest
        .fn()
        .mockResolvedValueOnce(
          [1, 2, 3, 4, 5].map(position => ({
            position,
          }))
        )
        .mockResolvedValueOnce([])
      prisma.card.delete = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      expect(service.delete(request, cardId)).rejects.toThrow(ForbiddenException)
    })
  })
})
