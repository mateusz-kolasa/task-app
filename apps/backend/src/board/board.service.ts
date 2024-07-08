import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Board } from '@prisma/client'
import { BOARD_PERMISSIONS, BOARD_SOCKET_MESSAGES } from 'shared-consts'
import BoardCreateData from 'src/dtos/board-create-data.dto'
import { BoardWithListsData } from 'src/dtos/board-lists-data.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthRequest, BoardAuthRequest } from 'src/types/user-jwt-payload'
import { BoardFullData, UsersInBoardsWithUsername } from 'shared-types'
import BoardAddUserData from 'src/dtos/board-add-user-data.dto'
import { UsersService } from 'src/users/users.service'
import { BoardGateway } from './board.gateway'
import ChangeBoardDescriptionData from 'src/dtos/board-change-description-data.dto'
import ChangeBoardTitleData from 'src/dtos/board-change-title-data.dto'

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

  async changeTitle(titleData: ChangeBoardTitleData): Promise<Board> {
    const updatedBoard = await this.prisma.board.update({
      where: {
        id: titleData.boardId,
      },
      data: {
        title: titleData.title,
      },
    })

    this.boardGateway.sendMessage(BOARD_SOCKET_MESSAGES.ChangeBoardTitle, {
      boardId: titleData.boardId,
      payload: updatedBoard,
    })
    return updatedBoard
  }

  async changeDescription(descriptionData: ChangeBoardDescriptionData): Promise<Board> {
    const updatedBoard = await this.prisma.board.update({
      where: {
        id: descriptionData.boardId,
      },
      data: {
        description: descriptionData.description,
      },
    })

    this.boardGateway.sendMessage(BOARD_SOCKET_MESSAGES.ChangeBoardDescription, {
      boardId: descriptionData.boardId,
      payload: updatedBoard,
    })
    return updatedBoard
  }

  async delete(boardId: number) {
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

  async leave(request: BoardAuthRequest, boardId: number) {
    const { permissions } = request.user

    // Owner can't leave board
    if (permissions === BOARD_PERMISSIONS.owner) {
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
