import { BadRequestException, Injectable } from '@nestjs/common'
import { ListFullData } from 'shared-types'
import CardCreateData from 'src/dtos/card-create-data.dto'
import { ListService } from 'src/list/list.service'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class CardService {
  constructor(
    private prisma: PrismaService,
    private listService: ListService
  ) {}

  async create(cardData: CardCreateData): Promise<ListFullData> {
    const list = await this.listService.getFull(cardData.listId)

    if (!list) {
      throw new BadRequestException('List not found')
    }

    const lastListPosition = Math.max(...list.cards.map(card => card.position), 0)

    await this.prisma.card.create({
      data: {
        title: cardData.title,
        listId: cardData.listId,
        position: lastListPosition + 1,
      },
    })

    return this.listService.getFull(cardData.listId)
  }
}
