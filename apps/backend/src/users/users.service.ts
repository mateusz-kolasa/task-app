import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    })
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        username,
      },
    })
  }

  async create(userData: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data: userData,
    })
  }

  async isUserAuthorized(
    userId: number,
    boardId: number,
    requiredPermission: number
  ): Promise<boolean> {
    const userInBoard = await this.prisma.usersInBoards.findFirst({
      where: {
        userId,
        boardId,
      },
      select: {
        permissions: true,
      },
    })

    return userInBoard && userInBoard.permissions >= requiredPermission
  }
}
