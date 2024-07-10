import { BadRequestException, Injectable } from '@nestjs/common'
import { List } from '@prisma/client'
import { DeleteListData, ListFullData } from 'shared-types'
import { BoardService } from 'src/board/board.service'
import ChangeListPositionData from 'src/dtos/list-change-position.data.dto'
import ChangeListTitleData from 'src/dtos/list-change-title-data.dto'
import ListCreateData from 'src/dtos/list-create-data.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { ListAuthRequest } from 'src/types/user-jwt-payload'

@Injectable()
export class ListService {
  constructor(
    private prisma: PrismaService,
    private boardService: BoardService
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

  async create(listData: ListCreateData): Promise<ListFullData> {
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
    request: ListAuthRequest,
    changePositionData: ChangeListPositionData
  ): Promise<List[]> {
    const { list } = request

    if (list.position === changePositionData.position) {
      throw new BadRequestException()
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
    await this.movePositionInList(changePositionData, list)

    return this.prisma.list.findMany({
      where: {
        boardId: list.boardId,
      },
    })
  }

  async changeTitle(request: ListAuthRequest, changeTitleData: ChangeListTitleData): Promise<List> {
    return this.prisma.list.update({
      data: {
        title: changeTitleData.title,
      },
      where: {
        id: changeTitleData.listId,
      },
    })
  }

  async delete(request: ListAuthRequest, listId: number): Promise<DeleteListData> {
    const { list } = request

    await this.prisma.$transaction([
      this.prisma.list.delete({
        where: {
          id: listId,
        },
      }),
      this.prisma.list.updateMany({
        data: {
          position: {
            decrement: 1,
          },
        },
        where: {
          position: {
            gt: list.position,
          },
          boardId: list.boardId,
        },
      }),
      this.prisma.card.deleteMany({
        where: {
          listId: listId,
        },
      }),
    ])

    const updatedLists = await this.prisma.list.findMany({
      where: {
        boardId: list.boardId,
      },
    })

    return {
      deleted: list,
      remaining: updatedLists,
    }
  }
}
