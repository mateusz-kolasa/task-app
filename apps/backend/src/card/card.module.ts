import { Module } from '@nestjs/common'
import { CardService } from './card.service'
import { CardController } from './card.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ListModule } from 'src/list/list.module'

@Module({
  imports: [PrismaModule, ListModule],
  providers: [CardService],
  controllers: [CardController],
})
export class CardModule {}
