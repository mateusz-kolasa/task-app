import { Test, TestingModule } from '@nestjs/testing'
import { BoardService } from './board.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { Board, UsersInBoards } from '@prisma/client'
import { BoardWithListsData } from 'src/dtos/board-lists-data.dto'
import { BoardFullData } from 'shared-types'
import { BOARD_PERMISSIONS } from 'src/consts/user.consts'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersModule } from 'src/users/users.module'
import { UsersService } from 'src/users/users.service'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { BoardGateway } from './board.gateway'
import { CoreModule } from 'src/core/core.module'
import { ConfigModule } from '@nestjs/config'

describe('BoardService', () => {
  let service: BoardService
  let prisma: PrismaService
  let usersService: UsersService

  const request = {
    user: {
      id: 1,
    },
  } as AuthRequest

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardService, BoardGateway],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        PrismaModule,
        UsersModule,
        CoreModule,
      ],
    }).compile()

    service = module.get<BoardService>(BoardService)
    prisma = module.get<PrismaService>(PrismaService)
    usersService = module.get<UsersService>(UsersService)
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

      prisma.board.findMany = jest.fn().mockResolvedValueOnce(boards)
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

      prisma.board.findUnique = jest.fn().mockResolvedValueOnce(board)
      const response = await service.getWithLists(1)
      expect(response).toBe(board)
    })
  })

  describe('getFull', () => {
    it('Selects board by id', async () => {
      prisma.board.findUnique = jest.fn()
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      await service.getFull(request, 1)
      expect(prisma.board.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        include: {
          users: {
            include: {
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
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
        users: [{ id: 1, userId: 1, boardId: 1, user: { username: 'name' } }],
      } as BoardFullData

      prisma.board.findUnique = jest.fn().mockResolvedValueOnce(board)
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      const response = await service.getFull(request, 1)
      expect(response).toBe(board)
    })

    it('throws forbidden exception for user not in board', async () => {
      prisma.board.findUnique = jest.fn()
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(false)
      expect(service.getFull(request, 1)).rejects.toThrow(ForbiddenException)
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
      prisma.board.create = jest.fn().mockResolvedValueOnce(board)
      const response = await service.create(request, { title: 'new board' })
      expect(response).toBe(board)
    })
  })

  describe('addUser', () => {
    it('adds user to board', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.usersInBoards.findFirst = jest.fn().mockResolvedValueOnce(null)
      prisma.usersInBoards.create = jest.fn()
      usersService.findByUsername = jest.fn().mockResolvedValue({
        id: 1,
      })

      await service.addUser(request, {
        boardId: 1,
        username: 'user',
        permissions: 0,
      })

      expect(prisma.usersInBoards.create).toHaveBeenCalledWith({
        data: {
          permissions: 0,
          boardId: 1,
          userId: 1,
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      })
    })

    it('returns added user in board', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      const userInBoard: UsersInBoards = {
        boardId: 1,
        userId: 1,
        id: 1,
        permissions: 0,
      }

      prisma.usersInBoards.findFirst = jest.fn().mockResolvedValueOnce(null)
      prisma.usersInBoards.create = jest.fn().mockResolvedValueOnce(userInBoard)
      usersService.findByUsername = jest.fn().mockResolvedValue({
        id: 1,
      })

      const response = await service.addUser(request, {
        boardId: 1,
        username: 'user',
        permissions: 0,
      })

      expect(response).toBe(userInBoard)
    })

    it('throws not found if user doesnt exists', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.usersInBoards.findFirst = jest.fn().mockResolvedValueOnce(null)
      prisma.usersInBoards.create = jest.fn()
      usersService.findByUsername = jest.fn().mockResolvedValue(null)

      expect(
        service.addUser(request, {
          boardId: 1,
          username: 'user',
          permissions: 0,
        })
      ).rejects.toThrow(NotFoundException)
    })

    it('throws bad request if user is already in board', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(true)
      prisma.usersInBoards.findFirst = jest.fn().mockResolvedValueOnce({
        id: 1,
        userId: 1,
        boardId: 1,
        permissions: 0,
      })
      prisma.usersInBoards.create = jest.fn()
      usersService.findByUsername = jest.fn().mockResolvedValue({
        id: 1,
      })

      expect(
        service.addUser(request, {
          boardId: 1,
          username: 'user',
          permissions: 0,
        })
      ).rejects.toThrow(BadRequestException)
    })

    it('throws forbidden if request is not from admin', async () => {
      usersService.isUserAuthorized = jest.fn().mockResolvedValueOnce(false)

      expect(
        service.addUser(request, {
          boardId: 1,
          username: 'user',
          permissions: 0,
        })
      ).rejects.toThrow(ForbiddenException)
    })

    it('throws forbidden if trying to set owners permissions', async () => {
      expect(
        service.addUser(request, {
          boardId: 1,
          username: 'user',
          permissions: 3,
        })
      ).rejects.toThrow(ForbiddenException)
    })
  })
})
