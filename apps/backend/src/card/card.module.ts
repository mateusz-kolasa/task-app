import { Module } from '@nestjs/common'
import { CardService } from './card.service'
import { CardController } from './card.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ListModule } from 'src/list/list.module'
import { BoardModule } from 'src/board/board.module'

@Module({
  imports: [PrismaModule, ListModule, BoardModule],
  providers: [CardService],
  controllers: [CardController],
})
export class CardModule {}
