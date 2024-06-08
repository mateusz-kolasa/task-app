import { BadRequestException, Injectable } from '@nestjs/common'
import { BoardFullData, ListFullData } from 'shared-types'
import { BoardService } from 'src/board/board.service'
import ListCreateData from 'src/dtos/list-create-data.dto'
import { PrismaService } from 'src/prisma/prisma.service'

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

  async create(listData: ListCreateData): Promise<BoardFullData> {
    const board = await this.boardService.getWithLists(listData.boardId)

    if (!board) {
      throw new BadRequestException('Board not found')
    }

    const lastListPosition = Math.max(...board.lists.map(list => list.position), 0)

    await this.prisma.list.create({
      data: {
        title: listData.title,
        boardId: listData.boardId,
        position: lastListPosition + 1,
      },
    })

    return this.boardService.getFull(listData.boardId.toString())
  }
}
