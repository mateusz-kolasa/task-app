import { Test, TestingModule } from '@nestjs/testing'
import { CardService } from './card.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ListModule } from 'src/list/list.module'
import { PrismaService } from 'src/prisma/prisma.service'
import { ListService } from 'src/list/list.service'

describe('CardService', () => {
  let service: CardService
  let prisma: PrismaService
  let listService: ListService

  const cardData = {
    title: 'card',
    listId: 100,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardService],
      imports: [ListModule, PrismaModule],
    }).compile()

    service = module.get<CardService>(CardService)
    prisma = module.get<PrismaService>(PrismaService)
    listService = module.get<ListService>(ListService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('Creates card at end of list', async () => {
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
      await service.create(cardData)
      expect(prisma.card.create).toHaveBeenCalledWith({
        data: {
          ...cardData,
          position: 2,
        },
      })
    })

    it('Creates card at start of list with no existing cards', async () => {
      prisma.card.create = jest.fn()
      listService.getFull = jest.fn().mockReturnValueOnce({
        id: 1,
        title: 'list',
        position: 1,
        boardId: 1,
        cards: [],
      })
      await service.create(cardData)
      expect(prisma.card.create).toHaveBeenCalledWith({
        data: {
          ...cardData,
          position: 1,
        },
      })
    })

    it('Returns list with created card', async () => {
      listService.getFull = jest.fn()
      const list = {
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
      }
      listService.getFull = jest
        .fn()
        .mockReturnValueOnce({ id: 1, title: 'list', position: 1, boardId: 1, cards: [] })
        .mockReturnValueOnce(list)
      prisma.card.create = jest.fn().mockReturnValueOnce(list)

      const response = await service.create(cardData)
      expect(response).toBe(list)
    })
  })
})
