import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PrismaService } from 'src/prisma/prisma.service'

describe('UsersService', () => {
  let service: UsersService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
      imports: [PrismaModule],
    }).compile()

    service = module.get<UsersService>(UsersService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findById', () => {
    it('Finds user by id', async () => {
      prisma.user.findUnique = jest.fn()
      await service.findById(1)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      })
    })

    it('Returns user', async () => {
      const user = {
        username: 'login',
        psswordHash: 'hash',
        id: 1,
      }

      prisma.user.findUnique = jest.fn().mockReturnValueOnce(user)
      const response = await service.findById(1)
      expect(response).toBe(user)
    })
  })

  describe('findByUsername', () => {
    it('Finds user by username', async () => {
      prisma.user.findUnique = jest.fn()
      await service.findByUsername('login')
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          username: 'login',
        },
      })
    })

    it('Returns user', async () => {
      const user = {
        username: 'login',
        psswordHash: 'hash',
        id: 1,
      }

      prisma.user.findUnique = jest.fn().mockReturnValueOnce(user)
      const response = await service.findByUsername('login')
      expect(response).toBe(user)
    })
  })

  describe('create', () => {
    const userData = {
      username: 'login',
      passwordHash: 'password',
    }

    it('Creates user with data', async () => {
      prisma.user.create = jest.fn()
      await service.create(userData)
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
      })
    })

    it('Returns created board', async () => {
      prisma.user.create = jest.fn().mockReturnValueOnce(userData)
      const response = await service.create(userData)
      expect(response).toBe(userData)
    })
  })

  describe('isUserAuthorized', () => {
    it('returns user permissions', async () => {
      prisma.usersInBoards.findFirst = jest.fn().mockReturnValueOnce({
        permissions: 2,
      })

      const response = await service.isUserAuthorized(1, 1, 1)
      expect(response).toBeTruthy()
    })

    it('returns false for user with not high enough permissions', async () => {
      prisma.usersInBoards.findFirst = jest.fn().mockReturnValueOnce({
        permissions: 1,
      })

      const response = await service.isUserAuthorized(1, 1, 2)
      expect(response).toBeFalsy()
    })

    it('returns null if user doesnt belong to board', async () => {
      prisma.usersInBoards.findFirst = jest.fn().mockReturnValueOnce(null)

      const response = await service.isUserAuthorized(1, 1, 1)
      expect(response).toBeFalsy()
    })
  })
})
