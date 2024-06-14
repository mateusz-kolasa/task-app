import { Test, TestingModule } from '@nestjs/testing'
import { ListService } from './list.service'
import { BoardModule } from 'src/board/board.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PrismaService } from 'src/prisma/prisma.service'
import { BoardService } from 'src/board/board.service'

describe('ListService', () => {
  let service: ListService
  let prisma: PrismaService
  let boardService: BoardService

  const listData = {
    title: 'list',
    boardId: 1,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListService],
      imports: [BoardModule, PrismaModule],
    }).compile()

    service = module.get<ListService>(ListService)
    prisma = module.get<PrismaService>(PrismaService)
    boardService = module.get<BoardService>(BoardService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('Creates list at end of board', async () => {
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

    it('Creates list at start of board with no existing lists', async () => {
      prisma.list.create = jest.fn()
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

    it('Returns created list', async () => {
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

      const response = await service.create(listData)
      expect(response).toBe(list)
    })
  })
})
