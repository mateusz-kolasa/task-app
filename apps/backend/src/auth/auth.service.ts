import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Prisma, User } from '@prisma/client'
import UserLoginData from 'src/dtos/user-login-data.dto'
import { UsersService } from 'src/users/users.service'
import * as bcrypt from 'bcrypt'
import UserRegisterData from 'src/dtos/user-register-data.dto'
import { AccessToken } from 'src/types/access-token'

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(userData: UserLoginData): Promise<User> | null {
    const user = await this.userService.find(userData.username)
    if (user) {
      const isCorrect = await bcrypt.compare(userData.password, user.passwordHash)

      if (isCorrect) {
        return user
      }
    }

    return null
  }

  async register(userData: UserRegisterData): Promise<AccessToken> {
    const existingUser = await this.userService.find(userData.username)

    if (existingUser) {
      throw new BadRequestException('username already exists')
    }

    const passwordHash = await bcrypt.hash(
      userData.password,
      parseInt(process.env.PASSWORD_HASH_ROUNDS)
    )
    const newUser: Prisma.UserCreateInput = { username: userData.username, passwordHash }
    const addedUser: User = await this.userService.create(newUser)

    return this.login(addedUser)
  }

  async login(user: User): Promise<AccessToken> {
    const payload = { username: user.username, sub: user.id }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
