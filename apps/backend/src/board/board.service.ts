import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Board } from '@prisma/client'
import { BOARD_PERMISSIONS } from 'shared-consts'
import BoardCreateData from 'src/dtos/board-create-data.dto'
import { BoardWithListsData } from 'src/dtos/board-lists-data.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthRequest, BoardAuthRequest } from 'src/types/user-jwt-payload'
import { BoardFullData, UsersInBoardsWithUsername } from 'shared-types'
import BoardAddUserData from 'src/dtos/board-add-user-data.dto'
import { UsersService } from 'src/users/users.service'
import ChangeBoardDescriptionData from 'src/dtos/board-change-description-data.dto'
import ChangeBoardTitleData from 'src/dtos/board-change-title-data.dto'

@Injectable()
export class BoardService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService
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

  async getFull(boardId: number): Promise<BoardFullData> {
    return this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
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

  async addUser(userData: BoardAddUserData): Promise<UsersInBoardsWithUsername> {
    if (userData.permissions > BOARD_PERMISSIONS.admin) {
      throw new ForbiddenException()
    }

    const user = await this.usersService.findByUsername(userData.username)

    if (!user) {
      throw new NotFoundException()
    }

    const userInBoard = await this.prisma.usersInBoards.findFirst({
      where: {
        boardId: userData.boardId,
        userId: user.id,
      },
    })

    if (userInBoard) {
      throw new BadRequestException('user already in board')
    }

    return this.prisma.usersInBoards.create({
      data: {
        permissions: userData.permissions,
        boardId: userData.boardId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    })
  }

  async changeTitle(titleData: ChangeBoardTitleData): Promise<Board> {
    return this.prisma.board.update({
      where: {
        id: titleData.boardId,
      },
      data: {
        title: titleData.title,
      },
    })
  }

  async changeDescription(descriptionData: ChangeBoardDescriptionData): Promise<Board> {
    return this.prisma.board.update({
      where: {
        id: descriptionData.boardId,
      },
      data: {
        description: descriptionData.description,
      },
    })
  }

  async delete(boardId: number) {
    await this.prisma.board.delete({
      where: {
        id: boardId,
      },
    })

    return boardId
  }

  async leave(request: BoardAuthRequest, boardId: number) {
    const { permissions } = request.user

    // Owner can't leave board
    if (permissions === BOARD_PERMISSIONS.owner) {
      throw new BadRequestException()
    }

    const lists = await this.prisma.list.findMany({
      where: {
        boardId: boardId,
      },
    })
    const listIds = lists.map(list => list.id)

    // Unassign user from cards
    if (listIds.length > 0) {
      await this.prisma.card.updateMany({
        data: {
          userId: null,
        },
        where: {
          userId: request.user.id,
          listId: {
            in: listIds,
          },
        },
      })
    }

    await this.prisma.usersInBoards.deleteMany({
      where: {
        boardId: boardId,
        userId: request.user.id,
      },
    })

    return request.user.id
  }
}
