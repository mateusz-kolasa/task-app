import { Injectable } from '@nestjs/common'
import { Board } from '@prisma/client'
import { BOARD_PERMISSIONS } from 'src/consts/user.consts'
import BoardCreateData from 'src/dtos/board-create-data.dto'
import { PrismaService } from 'src/prisma.service'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class BoardService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService
  ) {}
  async getForUser(request: AuthRequest): Promise<Board[]> {
    return this.prisma.board.findMany({
      where: {
        users: {
          some: {
            userId: request.user.id,
          },
        },
      },
    })
  }

  async create(request: AuthRequest, boardData: BoardCreateData): Promise<Board> {
    return this.prisma.board.create({
      data: {
        ...boardData,
        users: {
          create: [
            {
              permissions: BOARD_PERMISSIONS.owner,
              user: {
                connect: {
                  id: request.user.id,
                },
              },
            },
          ],
        },
      },
    })
  }
}
