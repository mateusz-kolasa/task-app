import { Test, TestingModule } from '@nestjs/testing'
import { BoardService } from './board.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { Board } from '@prisma/client'
import { BoardWithListsData } from 'src/dtos/board-lists-data.dto'
import { BoardFullData } from 'shared-types'
import { BOARD_PERMISSIONS } from 'src/consts/user.consts'
import { PrismaModule } from 'src/prisma/prisma.module'

describe('BoardService', () => {
  let service: BoardService
  let prisma: PrismaService

  const request = {
    user: {
      id: 1,
    },
  } as AuthRequest

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardService],
      imports: [PrismaModule],
    }).compile()

    service = module.get<BoardService>(BoardService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getForUser', () => {
    it('Selects user boards', async () => {
      prisma.board.findMany = jest.fn()
      await service.getForUser(request)
      expect(prisma.board.findMany).toHaveBeenCalledWith({
        where: {
          users: {
            some: {
              userId: 1,
            },
          },
        },
      })
    })

    it('Returns user boards', async () => {
      const boards = [
        {
          id: 1,
          title: 'test board',
        },
        {
          id: 2,
          title: 'test board 2',
          description: 'description',
        },
      ] as Board[]

      prisma.board.findMany = jest.fn().mockReturnValueOnce(boards)
      const response = await service.getForUser(request)
      expect(response).toBe(boards)
    })
  })

  describe('getWithLists', () => {
    it('Selects board by id', async () => {
      prisma.board.findUnique = jest.fn()
      await service.getWithLists(1)
      expect(prisma.board.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        include: {
          lists: true,
        },
      })
    })

    it('Returns board with lists', async () => {
      const board = {
        title: 'board',
        id: 1,
        lists: [
          {
            id: 1,
            title: 'list',
            boardId: 1,
            position: 1,
          },
        ],
      } as BoardWithListsData

      prisma.board.findUnique = jest.fn().mockReturnValueOnce(board)
      const response = await service.getWithLists(1)
      expect(response).toBe(board)
    })
  })

  describe('getFull', () => {
    it('Selects board by id', async () => {
      prisma.board.findUnique = jest.fn()
      await service.getFull('1')
      expect(prisma.board.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        include: {
          users: true,
          lists: {
            include: {
              cards: true,
            },
          },
        },
      })
    })

    it('Returns full board data', async () => {
      const board = {
        title: 'board',
        id: 1,
        lists: [
          {
            id: 1,
            title: 'list',
            boardId: 1,
            position: 1,
            cards: [],
          },
        ],
        users: [{ id: 1, userId: 1, boardId: 1 }],
      } as BoardFullData

      prisma.board.findUnique = jest.fn().mockReturnValueOnce(board)
      const response = await service.getFull('1')
      expect(response).toBe(board)
    })
  })

  describe('create', () => {
    it('Creates board with data', async () => {
      prisma.board.create = jest.fn()
      await service.create(request, { title: 'new board' })
      expect(prisma.board.create).toHaveBeenCalledWith({
        data: {
          title: 'new board',
          users: {
            create: [
              {
                permissions: BOARD_PERMISSIONS.owner,
                user: {
                  connect: {
                    id: 1,
                  },
                },
              },
            ],
          },
        },
      })
    })

    it('Returns created board', async () => {
      const board = {
        id: 1,
        title: 'new board',
      }
      prisma.board.create = jest.fn().mockReturnValueOnce(board)
      const response = await service.create(request, { title: 'new board' })
      expect(response).toBe(board)
    })
  })
})
