import { Module } from '@nestjs/common'
import { ListService } from './list.service'
import { ListController } from './list.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { BoardModule } from 'src/board/board.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [PrismaModule, BoardModule, UsersModule],
  controllers: [ListController],
  providers: [ListService],
  exports: [ListService],
})
export class ListModule {}
