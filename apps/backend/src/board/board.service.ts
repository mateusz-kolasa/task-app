import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Board } from '@prisma/client'
import { BOARD_PERMISSIONS } from 'src/consts/user.consts'
import BoardCreateData from 'src/dtos/board-create-data.dto'
import { BoardWithListsData } from 'src/dtos/board-lists-data.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { BoardFullData, UsersInBoardsWithUsername } from 'shared-types'
import BoardAddUserData from 'src/dtos/board-add-user-data.dto'
import { UsersService } from 'src/users/users.service'
import { BoardGateway } from './board.gateway'
import { BOARD_SOCKET_MESSAGES } from 'shared-consts'

@Injectable()
export class BoardService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private boardGateway: BoardGateway
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

  async getFull(request: AuthRequest, boardId: number): Promise<BoardFullData> {
    const isAuthorized = await this.usersService.isUserAuthorized(
      request.user.id,
      boardId,
      BOARD_PERMISSIONS.view
    )
    if (!isAuthorized) {
      throw new ForbiddenException()
    }

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

  async addUser(
    request: AuthRequest,
    userData: BoardAddUserData
  ): Promise<UsersInBoardsWithUsername> {
    const isAuthorized = await this.usersService.isUserAuthorized(
      request.user.id,
      userData.boardId,
      BOARD_PERMISSIONS.admin
    )
    if (userData.permissions > BOARD_PERMISSIONS.admin) {
      throw new ForbiddenException()
    }

    if (!isAuthorized) {
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

    const addedUser = await this.prisma.usersInBoards.create({
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

    this.boardGateway.sendMessage(BOARD_SOCKET_MESSAGES.AddUser, {
      boardId: userData.boardId,
      payload: addedUser,
    })
    return addedUser
  }

  async delete(request: AuthRequest, boardId: number) {
    const isAuthorized = await this.usersService.isUserAuthorized(
      request.user.id,
      boardId,
      BOARD_PERMISSIONS.admin
    )
    if (!isAuthorized) {
      throw new ForbiddenException()
    }

    this.boardGateway.sendMessage(BOARD_SOCKET_MESSAGES.DeleteBoard, {
      boardId: boardId,
      payload: boardId,
    })
    return this.prisma.board.delete({
      where: {
        id: boardId,
      },
    })
  }

  async leave(request: AuthRequest, boardId: number) {
    const isAuthorized = await this.usersService.isUserAuthorized(
      request.user.id,
      boardId,
      BOARD_PERMISSIONS.admin
    )

    // Owner can't leave board
    if (isAuthorized) {
      throw new BadRequestException()
    }

    this.boardGateway.sendMessage(BOARD_SOCKET_MESSAGES.LeaveBoard, {
      boardId: boardId,
      payload: request.user.id,
    })
    return this.prisma.usersInBoards.deleteMany({
      where: {
        boardId: boardId,
        userId: request.user.id,
      },
    })
  }
}
