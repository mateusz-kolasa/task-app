import { Test, TestingModule } from '@nestjs/testing'
import { ListService } from './list.service'
import { BoardModule } from 'src/board/board.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PrismaService } from 'src/prisma/prisma.service'
import { BoardService } from 'src/board/board.service'
import { UsersService } from 'src/users/users.service'
import { UsersModule } from 'src/users/users.module'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import ChangeListPositionData from 'src/dtos/list-change-position.data.dto'
import { List } from '@prisma/client'

const request = {
  user: {
    id: 1,
  },
} as AuthRequest

describe('ListService', () => {
  let service: ListService
  let prisma: PrismaService
  let boardService: BoardService
  let usersService: UsersService

  const listData = {
    title: 'list',
    boardId: 1,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListService],
      imports: [BoardModule, PrismaModule, UsersModule],
    }).compile()

    service = module.get<ListService>(ListService)
    prisma = module.get<PrismaService>(PrismaService)
    boardService = module.get<BoardService>(BoardService)
    usersService = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('creates list at end of board', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.list.create = jest.fn()
      boardService.getWithLists = jest.fn().mockReturnValueOnce({
        id: 1,
        title: 'board',
        lists: [
          {
            id: 1,
            title: 'list',
            position: 1,
          },
        ],
      })
      await service.create(request, listData)
      expect(prisma.list.create).toHaveBeenCalledWith({
        data: {
          ...listData,
          position: 2,
        },
        include: {
          cards: true,
        },
      })
    })

    it('creates list at start of board with no existing lists', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.list.create = jest.fn()
      boardService.getWithLists = jest.fn().mockReturnValueOnce({
        id: 1,
        title: 'board',
        lists: [],
      })
      await service.create(request, listData)
      expect(prisma.list.create).toHaveBeenCalledWith({
        data: {
          ...listData,
          position: 1,
        },
        include: {
          cards: true,
        },
      })
    })

    it('returns created list', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      boardService.getWithLists = jest.fn().mockReturnValueOnce({
        id: 1,
        title: 'board',
        lists: [],
      })

      const list = {
        id: 1,
        title: 'list',
        position: 1,
        boardId: 1,
        cards: [],
      }
      prisma.list.create = jest.fn().mockReturnValueOnce(list)

      const response = await service.create(request, listData)
      expect(response).toBe(list)
    })

    it('throws forbidden for unauthorized user', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(false)
      boardService.getWithLists = jest.fn().mockReturnValueOnce({
        id: 1,
        title: 'board',
        lists: [],
      })

      expect(service.create(request, listData)).rejects.toThrow(ForbiddenException)
    })
  })

  describe('changePosition', () => {
    const changePositionFrontData: ChangeListPositionData = {
      listId: 1,
      position: 1,
    }

    const originalList: List = {
      id: 1,
      boardId: 1,
      position: 3,
      title: '',
    }

    it('changes position towards front', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.list.findMany = jest
        .fn()
        .mockResolvedValueOnce(
          [1, 2, 3, 4, 5].map(position => ({
            position,
          }))
        )
        .mockResolvedValueOnce([])
      prisma.list.update = jest.fn()
      prisma.list.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      await service.changePosition(request, changePositionFrontData)

      expect(prisma.list.update).toHaveBeenCalledWith({
        data: {
          position: changePositionFrontData.position,
        },
        where: {
          id: changePositionFrontData.listId,
        },
      })
      expect(prisma.list.updateMany).toHaveBeenCalledWith({
        data: {
          position: {
            increment: 1,
          },
        },
        where: {
          position: {
            gte: changePositionFrontData.position,
            lt: originalList.position,
          },
          boardId: originalList.boardId,
        },
      })
    })

    it('changes position towards end', async () => {
      const changePositionEndData: ChangeListPositionData = {
        listId: 1,
        position: 5,
      }

      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.list.findMany = jest
        .fn()
        .mockResolvedValueOnce(
          [1, 2, 3, 4, 5].map(position => ({
            position,
          }))
        )
        .mockResolvedValueOnce([])
      prisma.list.update = jest.fn()
      prisma.list.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      await service.changePosition(request, changePositionEndData)

      expect(prisma.list.update).toHaveBeenCalledWith({
        data: {
          position: changePositionEndData.position,
        },
        where: {
          id: changePositionEndData.listId,
        },
      })
      expect(prisma.list.updateMany).toHaveBeenCalledWith({
        data: {
          position: {
            decrement: 1,
          },
        },
        where: {
          position: {
            gt: originalList.position,
            lte: changePositionEndData.position,
          },
          boardId: originalList.boardId,
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
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)

      prisma.list.findMany = jest
        .fn()
        .mockResolvedValueOnce(
          [1, 2, 3, 4, 5].map(position => ({
            position,
          }))
        )
        .mockResolvedValueOnce(updatedPositions)
      prisma.list.update = jest.fn()
      prisma.list.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      const result = await service.changePosition(request, changePositionFrontData)
      expect(result).toBe(updatedPositions)
    })

    it('throws not found if list doesnt exist', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(null)
      prisma.list.findMany = jest
        .fn()
        .mockResolvedValueOnce(
          [1, 2, 3, 4, 5].map(position => ({
            position,
          }))
        )
        .mockResolvedValueOnce([])
      prisma.list.update = jest.fn()
      prisma.list.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      expect(service.changePosition(request, changePositionFrontData)).rejects.toThrow(
        NotFoundException
      )
    })

    it('throws bad request if position is same as current', async () => {
      const changePositionData: ChangeListPositionData = { listId: 1, position: 3 }

      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.list.findMany = jest
        .fn()
        .mockResolvedValueOnce(
          [1, 2, 3, 4, 5].map(position => ({
            position,
          }))
        )
        .mockResolvedValueOnce([])
      prisma.list.update = jest.fn()
      prisma.list.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      expect(service.changePosition(request, changePositionData)).rejects.toThrow(
        BadRequestException
      )
    })

    it('throws forbidden for user without permissions', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(false)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.list.findMany = jest
        .fn()
        .mockResolvedValueOnce(
          [1, 2, 3, 4, 5].map(position => ({
            position,
          }))
        )
        .mockResolvedValueOnce([])
      prisma.list.update = jest.fn()
      prisma.list.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      expect(service.changePosition(request, changePositionFrontData)).rejects.toThrow(
        ForbiddenException
      )
    })

    it('throws bad request if new position is beyond current bounds', async () => {
      const changePositionData: ChangeListPositionData = {
        listId: 1,
        position: 7,
      }

      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.list.findUnique = jest.fn().mockResolvedValueOnce(originalList)
      prisma.list.findMany = jest
        .fn()
        .mockResolvedValueOnce(
          [1, 2, 3, 4, 5].map(position => ({
            position,
          }))
        )
        .mockResolvedValueOnce([])
      prisma.list.update = jest.fn()
      prisma.list.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      expect(service.changePosition(request, changePositionData)).rejects.toThrow(
        BadRequestException
      )
    })
  })
})
