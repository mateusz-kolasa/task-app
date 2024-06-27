import { Module } from '@nestjs/common'
import { BoardController } from './board.controller'
import { BoardService } from './board.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersModule } from 'src/users/users.module'
import { BoardGateway } from './board.gateway'
import { CoreModule } from 'src/core/core.module'

@Module({
  controllers: [BoardController],
  providers: [BoardService, BoardGateway],
  imports: [PrismaModule, UsersModule, CoreModule],
  exports: [BoardService, BoardGateway],
})
export class BoardModule {}
