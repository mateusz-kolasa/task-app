import { Module } from '@nestjs/common'
import { BoardController } from './board.controller'
import { BoardService } from './board.service'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  controllers: [BoardController],
  providers: [BoardService],
  imports: [PrismaModule],
  exports: [BoardService],
})
export class BoardModule {}
