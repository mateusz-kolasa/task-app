import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UsersModule } from 'src/users/users.module'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'
import * as bcrypt from 'bcrypt'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { Response } from 'express'
import { BadRequestException } from '@nestjs/common'

describe('AuthService', () => {
  let service: AuthService
  let usersService: UsersService
  let jwtService: JwtService

  const userData = {
    username: 'user',
    password: 'password',
  }

  const user = {
    username: 'user',
    passwordHash: 'passwordHash',
    id: 1,
  }

  const response = {
    cookie: jest.fn(),
  } as unknown as Response

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtService],
      imports: [UsersModule],
    }).compile()

    service = module.get<AuthService>(AuthService)
    usersService = module.get<UsersService>(UsersService)
    jwtService = module.get<JwtService>(JwtService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateUser', () => {
    it('finds user by username', async () => {
      usersService.findByUsername = jest.fn()
      await service.validateUser(userData)
      expect(usersService.findByUsername).toHaveBeenCalledWith(userData.username)
    })

    it('checks user password', async () => {
      usersService.findByUsername = jest.fn().mockReturnValueOnce(user)
      const compare = jest.spyOn(bcrypt, 'compare')

      await service.validateUser(userData)
      expect(compare).toHaveBeenCalledWith(userData.password, user.passwordHash)
    })

    it('returns user', async () => {
      usersService.findByUsername = jest.fn().mockReturnValueOnce(user)
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true)
      const response = await service.validateUser(userData)
      expect(response).toBe(user)
    })

    it('returns empty when user not found', async () => {
      usersService.findByUsername = jest.fn().mockReturnValueOnce(null)
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true)
      const response = await service.validateUser(userData)
      expect(response).toBe(null)
    })

    it('returns empty when password doesnt match', async () => {
      usersService.findByUsername = jest.fn().mockReturnValueOnce(user)
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false)
      const response = await service.validateUser(userData)
      expect(response).toBe(null)
    })
  })

  describe('register', () => {
    it('registers users', async () => {
      usersService.findByUsername = jest.fn()
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'passwordHash')
      usersService.create = jest.fn()
      service.login = jest.fn()

      await service.register(userData, response)
      expect(usersService.create).toHaveBeenCalledWith({
        username: user.username,
        passwordHash: 'passwordHash',
      })
    })

    it('logs user after register', async () => {
      usersService.findByUsername = jest.fn()
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'passwordHash')
      usersService.create = jest.fn().mockResolvedValueOnce(user)
      service.login = jest.fn()

      await service.register(userData, response)
      expect(service.login).toHaveBeenCalledWith(user, response)
    })

    it('throws exception for taken username', async () => {
      usersService.findByUsername = jest.fn().mockResolvedValueOnce(user)
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'passwordHash')
      usersService.create = jest.fn()
      service.login = jest.fn()

      await expect(service.register(userData, response)).rejects.toThrow(BadRequestException)
    })
  })

  describe('login', () => {
    it('Sets access_token cookie', async () => {
      jwtService.sign = jest.fn().mockReturnValueOnce('token_content')
      service.login(user, response)
      expect(response.cookie).toHaveBeenCalledWith('access_token', 'token_content', {
        expires: new Date(Date.now() + 3600_000),
      })
    })
  })

  describe('logout', () => {
    it('expires access_token', async () => {
      jwtService.sign = jest.fn().mockReturnValueOnce('token_content')
      service.logout(response)
      expect(response.cookie).toHaveBeenCalledWith('access_token', {
        expires: new Date(Date.now()),
      })
    })
  })

  describe('getAuthStatus', () => {
    const request = {
      user: {
        id: 1,
      },
    }

    it('finds user by id', async () => {
      usersService.findById = jest.fn().mockReturnValueOnce(user)
      await service.getAuthStatus(request as unknown as AuthRequest)
      expect(usersService.findById).toHaveBeenCalledWith(1)
    })

    it('returns user', async () => {
      usersService.findById = jest.fn().mockReturnValueOnce(user)
      const response = await service.getAuthStatus(request as unknown as AuthRequest)
      expect(response).toStrictEqual({ username: user.username })
    })
  })
})
