import { Test, TestingModule } from '@nestjs/testing'
import { ListService } from './list.service'
import { BoardModule } from 'src/board/board.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PrismaService } from 'src/prisma/prisma.service'
import { BoardService } from 'src/board/board.service'
import { UsersService } from 'src/users/users.service'
import { UsersModule } from 'src/users/users.module'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { ForbiddenException } from '@nestjs/common'

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
})
