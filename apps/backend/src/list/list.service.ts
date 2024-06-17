import { ForbiddenException, Injectable } from '@nestjs/common'
import { ListFullData } from 'shared-types'
import { BoardService } from 'src/board/board.service'
import { BOARD_PERMISSIONS } from 'src/consts/user.consts'
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
}
