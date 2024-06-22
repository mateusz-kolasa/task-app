import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { List } from '@prisma/client'
import { ListFullData } from 'shared-types'
import { BoardService } from 'src/board/board.service'
import { BOARD_PERMISSIONS } from 'src/consts/user.consts'
import ChangeListPositionData from 'src/dtos/list-change-position.data.dto'
import ListCreateData from 'src/dtos/list-create-data.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class ListService {
  constructor(
    private prisma: PrismaService,
    private boardService: BoardService,
    private usersService: UsersService
  ) {}

  async getFull(listId: number): Promise<ListFullData> {
    return this.prisma.list.findUnique({
      where: {
        id: listId,
      },
      include: {
        cards: true,
      },
    })
  }

  async create(request: AuthRequest, listData: ListCreateData): Promise<ListFullData> {
    const isAuthorized = await this.usersService.isUserAuthorized(
      request.user.id,
      listData.boardId,
      BOARD_PERMISSIONS.edit
    )

    if (!isAuthorized) {
      throw new ForbiddenException()
    }

    const board = await this.boardService.getWithLists(listData.boardId)
    const lastListPosition = Math.max(...board.lists.map(list => list.position), 0)

    return this.prisma.list.create({
      data: {
        title: listData.title,
        boardId: listData.boardId,
        position: lastListPosition + 1,
      },
      include: {
        cards: true,
      },
    })
  }

  async movePositionInList(changePositionData: ChangeListPositionData, currentListData: List) {
    if (changePositionData.position < currentListData.position) {
      return this.prisma.$transaction([
        // If moving list towards front, shift lists between one step to back
        this.prisma.list.updateMany({
          data: {
            position: {
              increment: 1,
            },
          },
          where: {
            position: {
              gte: changePositionData.position,
              lt: currentListData.position,
            },
            boardId: currentListData.boardId,
          },
        }),
        this.prisma.list.update({
          data: {
            position: changePositionData.position,
          },
          where: {
            id: changePositionData.listId,
          },
        }),
      ])
    } else {
      return this.prisma.$transaction([
        // If moving list towards end, shift lists between one step to front
        this.prisma.list.updateMany({
          data: {
            position: {
              decrement: 1,
            },
          },
          where: {
            position: {
              gt: currentListData.position,
              lte: changePositionData.position,
            },
            boardId: currentListData.boardId,
          },
        }),
        this.prisma.list.update({
          data: {
            position: changePositionData.position,
          },
          where: {
            id: changePositionData.listId,
          },
        }),
      ])
    }
  }

  async changePosition(
    request: AuthRequest,
    changePositionData: ChangeListPositionData
  ): Promise<List[]> {
    const list = await this.prisma.list.findUnique({
      where: {
        id: changePositionData.listId,
      },
    })

    if (!list) {
      throw new NotFoundException()
    }

    if (list.position === changePositionData.position) {
      throw new BadRequestException()
    }

    const isAuthorized = await this.usersService.isUserAuthorized(
      request.user.id,
      list.boardId,
      BOARD_PERMISSIONS.edit
    )

    if (!isAuthorized) {
      throw new ForbiddenException()
    }

    // Make sure new position is within current bounds
    const lists = await this.prisma.list.findMany({
      where: {
        boardId: list.boardId,
      },
    })
    const maxPosition = Math.max(...lists.map(list => list.position))
    if (changePositionData.position > maxPosition) {
      throw new BadRequestException()
    }
    console.log(changePositionData, list)
    await this.movePositionInList(changePositionData, list)

    return this.prisma.list.findMany({
      where: {
        boardId: list.boardId,
      },
    })
  }
}
