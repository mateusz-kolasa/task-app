import { Test, TestingModule } from '@nestjs/testing'
import { CardService } from './card.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ListModule } from 'src/list/list.module'
import { PrismaService } from 'src/prisma/prisma.service'
import { ListService } from 'src/list/list.service'
import { UsersService } from 'src/users/users.service'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { ForbiddenException } from '@nestjs/common'
import { UsersModule } from 'src/users/users.module'

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
})
