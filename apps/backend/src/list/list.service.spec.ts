import { Test, TestingModule } from '@nestjs/testing'
import { ListService } from './list.service'
import { BoardModule } from 'src/board/board.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PrismaService } from 'src/prisma/prisma.service'
import { BoardService } from 'src/board/board.service'
import { BadRequestException } from '@nestjs/common'
import ChangeListPositionData from 'src/dtos/list-change-position.data.dto'
import { List } from '@prisma/client'
import { ChangeListTitleData } from 'shared-types'
import { ConfigModule } from '@nestjs/config'
import { ListAuthRequest } from 'src/types/user-jwt-payload'

describe('ListService', () => {
  let service: ListService
  let prisma: PrismaService
  let boardService: BoardService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListService],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        BoardModule,
        PrismaModule,
      ],
    }).compile()

    service = module.get<ListService>(ListService)
    prisma = module.get<PrismaService>(PrismaService)
    boardService = module.get<BoardService>(BoardService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    const listData = {
      title: 'list',
      boardId: 1,
    }

    const list = {
      id: 1,
      title: 'list',
      position: 1,
      boardId: 1,
      cards: [],
    }

    it('creates list at end of board', async () => {
      prisma.list.create = jest.fn().mockResolvedValueOnce(list)
      boardService.getWithLists = jest.fn().mockResolvedValueOnce({
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
      await service.create(listData)
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
      prisma.list.create = jest.fn().mockReturnValueOnce(list)
      boardService.getWithLists = jest.fn().mockReturnValueOnce({
        id: 1,
        title: 'board',
        lists: [],
      })

      await service.create(listData)
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
      boardService.getWithLists = jest.fn().mockReturnValueOnce({
        id: 1,
        title: 'board',
        lists: [],
      })

      prisma.list.create = jest.fn().mockReturnValueOnce(list)

      const response = await service.create(listData)
      expect(response).toBe(list)
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

    const request = {
      list: originalList,
    } as ListAuthRequest

    it('changes position towards front', async () => {
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

    it('throws bad request if position is same as current', async () => {
      const changePositionData: ChangeListPositionData = { listId: 1, position: 3 }

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

    it('throws bad request if new position is beyond current bounds', async () => {
      const changePositionData: ChangeListPositionData = {
        listId: 1,
        position: 7,
      }

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

  describe('changeTitle', () => {
    const originaList: List = {
      title: 'old title',
      id: 1,
      boardId: 1,
      position: 1,
    }

    const changeTitleData: ChangeListTitleData = {
      listId: 1,
      title: 'new title',
    }

    const request = {
      boardId: 1,
    } as ListAuthRequest

    it('updates list with new title', async () => {
      prisma.list.update = jest.fn().mockResolvedValueOnce({
        ...originaList,
        title: changeTitleData.title,
      })

      await service.changeTitle(request, changeTitleData)
      expect(prisma.list.update).toHaveBeenCalledWith({
        data: {
          title: changeTitleData.title,
        },
        where: {
          id: changeTitleData.listId,
        },
      })
    })

    it('returns updated list', async () => {
      prisma.list.update = jest.fn().mockResolvedValueOnce({
        ...originaList,
        title: changeTitleData.title,
      })

      const response = await service.changeTitle(request, changeTitleData)
      expect(response).toStrictEqual({
        ...originaList,
        title: changeTitleData.title,
      })
    })
  })

  describe('delete', () => {
    const listId = 1
    const originalList: List = {
      id: 1,
      boardId: 1,
      position: 3,
      title: '',
    }

    const request = {
      list: originalList,
    } as ListAuthRequest

    it('deletes list', async () => {
      prisma.list.findMany = jest
        .fn()
        .mockResolvedValueOnce(
          [1, 2, 3, 4, 5].map(position => ({
            position,
          }))
        )
        .mockResolvedValueOnce([])
      prisma.list.delete = jest.fn()
      prisma.card.deleteMany = jest.fn()
      prisma.list.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      await service.delete(request, listId)

      expect(prisma.list.delete).toHaveBeenCalledWith({
        where: {
          id: listId,
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
          },
          boardId: originalList.boardId,
        },
      })
      expect(prisma.card.deleteMany).toHaveBeenCalledWith({
        where: {
          listId: listId,
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

      prisma.list.findMany = jest.fn().mockResolvedValueOnce(updatedPositions)
      prisma.list.delete = jest.fn()
      prisma.card.deleteMany = jest.fn()
      prisma.list.updateMany = jest.fn()
      prisma.$transaction = jest.fn()

      const result = await service.delete(request, listId)
      expect(result).toStrictEqual({
        deleted: originalList,
        remaining: updatedPositions,
      })
    })
  })
})
