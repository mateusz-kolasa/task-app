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
import { Card } from 'prisma/prisma-client'
import ChangeCardPositionData from 'src/dtos/card-change-position.data.dto'

describe('CardService', () => {
  let service: CardService
  let prisma: PrismaService
  let listService: ListService
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
      imports: [ListModule, PrismaModule, UsersModule],
    }).compile()

    service = module.get<CardService>(CardService)
    prisma = module.get<PrismaService>(PrismaService)
    listService = module.get<ListService>(ListService)
    usersService = module.get<UsersService>(UsersService)
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
      prisma.$transaction = jest.fn()

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
      prisma.$transaction = jest.fn()

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
      prisma.$transaction = jest.fn()

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

      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.card.findUnique = jest.fn().mockResolvedValueOnce(originalCard)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.card.update = jest.fn()
      prisma.card.updateMany = jest.fn()
      prisma.card.findMany = jest.fn().mockResolvedValueOnce(updatedPositions)
      prisma.$transaction = jest.fn()

      const result = await service.changePosition(request, changePositionFrontData)
      expect(result).toBe(updatedPositions)
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
})
