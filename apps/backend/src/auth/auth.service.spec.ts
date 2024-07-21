import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UsersModule } from 'src/users/users.module'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'
import bcrypt from 'bcrypt'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { Response } from 'express'
import { BadRequestException } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import ms from 'ms'

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

  const requestWithTokens = {
    user: {
      username: 'user',
      id: 1,
    },
    cookies: {
      access_token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1c2VyIiwiaWF0IjoxNzIxNTU0MjMyLCJleHAiOjE3NTMwOTA4MzIsImF1ZCI6IiIsInN1YiI6IjEifQ.UTHdmTd3kWAu1zRT2FNueBHVU-qUff4zqIXHN07xlGs',
      refresh_token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1c2VyIiwiaWF0IjoxNzIxNTU0MjMyLCJleHAiOjE3NTM2OTUwMzIsImF1ZCI6IiIsInN1YiI6IjEifQ.IPTVgHW6tV1vZ7QVYO2GosDqfNwbQpGBDb_6c_CPZGM',
    },
  } as unknown as AuthRequest

  const response = {
    cookie: jest.fn().mockResolvedValue({}),
    clearCookie: jest.fn(),
  } as unknown as Response

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtService],
      imports: [UsersModule, CacheModule.register({ isGlobal: true })],
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
    it('sets tokens on cookie', async () => {
      const now = Date.now()
      Date.now = jest.fn().mockReturnValue(now)

      jwtService.sign = jest
        .fn()
        .mockReturnValueOnce('auth_token_content')
        .mockReturnValueOnce('refresh_token_content')
      service.login(user, response)
      expect(response.cookie).toHaveBeenCalledWith('access_token', 'auth_token_content', {
        expires: new Date(now + ms(process.env.AUTH_TOKEN_DURATION)),
        httpOnly: true,
        sameSite: 'strict',
      })
      expect(response.cookie).toHaveBeenCalledWith('refresh_token', 'refresh_token_content', {
        expires: new Date(now + ms(process.env.REFRESH_TOKEN_DURATION)),
        httpOnly: true,
        sameSite: 'strict',
      })
    })
  })

  describe('logout', () => {
    it('expires tokens on cookie', async () => {
      service.blacklistToken = jest.fn()
      await service.logout(requestWithTokens, response)
      expect(response.clearCookie).toHaveBeenCalledWith('access_token')
      expect(response.clearCookie).toHaveBeenCalledWith('refresh_token')
    })

    it('blacklists old tokens', async () => {
      service.blacklistToken = jest.fn()
      await service.logout(requestWithTokens, response)
      expect(service.blacklistToken).toHaveBeenCalledWith(requestWithTokens.cookies.access_token)
      expect(service.blacklistToken).toHaveBeenCalledWith(requestWithTokens.cookies.refresh_token)
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
      expect(response).toStrictEqual({ username: user.username, id: user.id })
    })
  })

  describe('refreshToken', () => {
    it('sets tokens on cookie', async () => {
      const now = Date.now()
      Date.now = jest.fn().mockReturnValue(now)
      service.blacklistToken = jest.fn().mockResolvedValue({})

      jwtService.sign = jest
        .fn()
        .mockReturnValueOnce('auth_token_content')
        .mockReturnValueOnce('refresh_token_content')
      await service.refreshToken(requestWithTokens, response)
      expect(response.cookie).toHaveBeenNthCalledWith(1, 'access_token', 'auth_token_content', {
        expires: new Date(now + ms(process.env.AUTH_TOKEN_DURATION)),
        httpOnly: true,
        sameSite: 'strict',
      })
      expect(response.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'refresh_token_content', {
        expires: new Date(now + ms(process.env.REFRESH_TOKEN_DURATION)),
        httpOnly: true,
        sameSite: 'strict',
      })
    })

    it('backlists old tokens', async () => {
      service.blacklistToken = jest.fn().mockResolvedValue({})
      jwtService.sign = jest
        .fn()
        .mockReturnValueOnce('auth_token_content')
        .mockReturnValueOnce('refresh_token_content')
      await service.refreshToken(requestWithTokens, response)
      expect(service.blacklistToken).toHaveBeenNthCalledWith(
        1,
        requestWithTokens.cookies.access_token
      )
      expect(service.blacklistToken).toHaveBeenNthCalledWith(
        2,
        requestWithTokens.cookies.refresh_token
      )
    })
  })
})
