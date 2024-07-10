import { Test, TestingModule } from '@nestjs/testing'
import { BoardService } from './board.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthRequest, BoardAuthRequest } from 'src/types/user-jwt-payload'
import { Board, UsersInBoards } from '@prisma/client'
import { BoardWithListsData } from 'src/dtos/board-lists-data.dto'
import { BoardFullData } from 'shared-types'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersModule } from 'src/users/users.module'
import { UsersService } from 'src/users/users.service'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { BoardGateway } from './board.gateway'
import { CoreModule } from 'src/core/core.module'
import { ConfigModule } from '@nestjs/config'
import ChangeBoardDescriptionData from 'src/dtos/board-change-description-data.dto'
import ChangeBoardTitleData from 'src/dtos/board-change-title-data.dto'
import { BOARD_PERMISSIONS } from 'shared-consts'

describe('BoardService', () => {
  let service: BoardService
  let prisma: PrismaService
  let usersService: UsersService

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
    const request = {
      user: {
        id: 1,
      },
    } as AuthRequest

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
      await service.getFull(1)
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
      const response = await service.getFull(1)
      expect(response).toBe(board)
    })
  })

  describe('create', () => {
    const request = {
      user: {
        id: 1,
      },
    } as AuthRequest

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
      prisma.usersInBoards.findFirst = jest.fn().mockResolvedValueOnce(null)
      prisma.usersInBoards.create = jest.fn()
      usersService.findByUsername = jest.fn().mockResolvedValue({
        id: 1,
      })

      await service.addUser({
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

      const response = await service.addUser({
        boardId: 1,
        username: 'user',
        permissions: 0,
      })

      expect(response).toBe(userInBoard)
    })

    it('throws not found if user doesnt exists', async () => {
      prisma.usersInBoards.findFirst = jest.fn().mockResolvedValueOnce(null)
      prisma.usersInBoards.create = jest.fn()
      usersService.findByUsername = jest.fn().mockResolvedValue(null)

      expect(
        service.addUser({
          boardId: 1,
          username: 'user',
          permissions: 0,
        })
      ).rejects.toThrow(NotFoundException)
    })

    it('throws bad request if user is already in board', async () => {
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
        service.addUser({
          boardId: 1,
          username: 'user',
          permissions: 0,
        })
      ).rejects.toThrow(BadRequestException)
    })

    it('throws forbidden if trying to set owners permissions', async () => {
      expect(
        service.addUser({
          boardId: 1,
          username: 'user',
          permissions: 3,
        })
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('changeTitle', () => {
    const originalBoard: Board = {
      title: 'old title',
      id: 1,
      description: '',
    }

    const changeTitleData: ChangeBoardTitleData = {
      boardId: 1,
      title: 'new title',
    }

    it('updates board with new title', async () => {
      prisma.board.update = jest.fn()

      await service.changeTitle(changeTitleData)
      expect(prisma.board.update).toHaveBeenCalledWith({
        data: {
          title: changeTitleData.title,
        },
        where: {
          id: changeTitleData.boardId,
        },
      })
    })

    it('returns updated board', async () => {
      prisma.board.update = jest.fn().mockResolvedValueOnce({
        ...originalBoard,
        title: changeTitleData.title,
      })

      const response = await service.changeTitle(changeTitleData)
      expect(response).toStrictEqual({
        ...originalBoard,
        title: changeTitleData.title,
      })
    })
  })

  describe('changeDescription', () => {
    const originalBoard: Board = {
      title: '',
      id: 1,
      description: 'old description',
    }

    const changeDescriptionData: ChangeBoardDescriptionData = {
      boardId: 1,
      description: 'new description',
    }

    it('updates board with new title', async () => {
      prisma.board.update = jest.fn()

      await service.changeDescription(changeDescriptionData)
      expect(prisma.board.update).toHaveBeenCalledWith({
        data: {
          description: changeDescriptionData.description,
        },
        where: {
          id: changeDescriptionData.boardId,
        },
      })
    })

    it('returns updated board', async () => {
      prisma.board.update = jest.fn().mockResolvedValueOnce({
        ...originalBoard,
        description: changeDescriptionData.description,
      })

      const response = await service.changeDescription(changeDescriptionData)
      expect(response).toStrictEqual({
        ...originalBoard,
        description: changeDescriptionData.description,
      })
    })
  })

  describe('delete', () => {
    it('deletes board by id', async () => {
      prisma.board.delete = jest.fn()
      await service.delete(1)
      expect(prisma.board.delete).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      })
    })
  })

  describe('leave', () => {
    it('leaves board by id', async () => {
      const request = {
        user: {
          id: 1,
          permissions: BOARD_PERMISSIONS.view,
        },
      } as BoardAuthRequest

      prisma.usersInBoards.deleteMany = jest.fn()
      await service.leave(request, 1)
      expect(prisma.usersInBoards.deleteMany).toHaveBeenCalledWith({
        where: {
          boardId: 1,
          userId: request.user.id,
        },
      })
    })

    it('throws bad request if user is owner', async () => {
      const request = {
        user: {
          id: 1,
          permissions: BOARD_PERMISSIONS.owner,
        },
      } as BoardAuthRequest

      prisma.usersInBoards.deleteMany = jest.fn()
      expect(service.leave(request, 1)).rejects.toThrow(BadRequestException)
    })
  })
})
