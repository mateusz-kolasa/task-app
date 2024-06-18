import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Prisma, User } from '@prisma/client'
import UserLoginData from 'src/dtos/user-login-data.dto'
import { UsersService } from 'src/users/users.service'
import * as bcrypt from 'bcrypt'
import UserRegisterData from 'src/dtos/user-register-data.dto'
import { Response } from 'express'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { UserInfoData } from 'shared-types'

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
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
    response.cookie('access_token', this.jwtService.sign(payload), {
      expires: new Date(Date.now() + 3600_000),
    })

    return { username: user.username, id: user.id }
  }

  async logout(response: Response): Promise<Record<string, never>> {
    response.cookie('access_token', { expires: new Date(Date.now()) })
    return {}
  }

  async getAuthStatus(request: AuthRequest): Promise<UserInfoData> {
    const user = await this.userService.findById(request.user.id)
    return { username: user.username, id: user.id }
  }
}
