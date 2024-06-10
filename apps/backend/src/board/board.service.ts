import { Injectable } from '@nestjs/common'
import { Board } from '@prisma/client'
import { BOARD_PERMISSIONS } from 'src/consts/user.consts'
import BoardCreateData from 'src/dtos/board-create-data.dto'
import { BoardWithListsData } from 'src/dtos/board-lists-data.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { BoardFullData } from 'shared-types'

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

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

  async getWithLists(boardId: number): Promise<BoardWithListsData> {
    return this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
      include: {
        lists: true,
      },
    })
  }

  async getFull(boardId: string): Promise<BoardFullData> {
    return this.prisma.board.findUnique({
      where: {
        id: parseInt(boardId),
      },
      include: {
        users: true,
        lists: {
          include: {
            cards: true,
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
