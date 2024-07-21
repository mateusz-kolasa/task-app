import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Prisma, User } from '@prisma/client'
import UserLoginData from 'src/dtos/user-login-data.dto'
import { UsersService } from 'src/users/users.service'
import bcrypt from 'bcrypt'
import UserRegisterData from 'src/dtos/user-register-data.dto'
import { Response } from 'express'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { UserInfoData } from 'shared-types'
import ms from 'ms'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import {
  extractAccessTokenFromCookies,
  extractRefreshTokenFromCookies,
} from 'src/util/cookies.util'

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async validateUser(userData: UserLoginData): Promise<User> | null {
    const user = await this.userService.findByUsername(userData.username)
    if (user) {
      const isCorrect = await bcrypt.compare(userData.password, user.passwordHash)

      if (isCorrect) {
        return user
      }
    }

    return null
  }

  async register(userData: UserRegisterData, response: Response): Promise<UserInfoData> {
    const existingUser = await this.userService.findByUsername(userData.username)

    if (existingUser) {
      throw new BadRequestException('username already exists')
    }

    const passwordHash = await bcrypt.hash(
      userData.password,
      parseInt(process.env.PASSWORD_HASH_ROUNDS)
    )
    const newUser: Prisma.UserCreateInput = { username: userData.username, passwordHash }
    const addedUser = await this.userService.create(newUser)

    return this.login(addedUser, response)
  }

  async login(user: User, response: Response): Promise<UserInfoData> {
    const payload = { username: user.username, sub: user.id }
    this.generateNewTokens(response, payload)
    return { username: user.username, id: user.id }
  }

  async logout(request: AuthRequest, response: Response): Promise<Record<string, never>> {
    await this.blacklistToken(extractAccessTokenFromCookies(request))
    await this.blacklistToken(extractRefreshTokenFromCookies(request))

    response.clearCookie('access_token')
    response.clearCookie('refresh_token')
    return {}
  }

  async getAuthStatus(request: AuthRequest): Promise<UserInfoData> {
    const user = await this.userService.findById(request.user.id)
    return { username: user.username, id: user.id }
  }

  async refreshToken(request: AuthRequest, response: Response): Promise<UserInfoData> {
    const payload = { username: request.user.username, sub: request.user.id }
    await this.blacklistToken(extractAccessTokenFromCookies(request))
    await this.blacklistToken(extractRefreshTokenFromCookies(request))

    this.generateNewTokens(response, payload)
    return { username: request.user.username, id: request.user.id }
  }

  async blacklistToken(token: string) {
    if (!token) {
      return
    }

    const expirationTime = this.jwtService.decode(token).exp * 1000
    const remainingDuration = expirationTime - Date.now()
    await this.cacheManager.set(token, true, remainingDuration)
  }

  generateNewTokens(response: Response, payload: any) {
    response.cookie(
      'access_token',
      this.jwtService.sign(payload, { expiresIn: process.env.AUTH_TOKEN_DURATION }),
      {
        expires: new Date(Date.now() + ms(process.env.AUTH_TOKEN_DURATION)),
        httpOnly: true,
        sameSite: 'strict',
      }
    )

    response.cookie(
      'refresh_token',
      this.jwtService.sign(payload, {
        expiresIn: process.env.REFRESH_TOKEN_DURATION,
        secret: process.env.JWT_REFRESH_SECRET,
      }),
      {
        expires: new Date(Date.now() + ms(process.env.REFRESH_TOKEN_DURATION)),
        httpOnly: true,
        sameSite: 'strict',
      }
    )
  }
}
