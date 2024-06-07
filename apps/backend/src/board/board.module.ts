import { Module } from '@nestjs/common'
import { BoardController } from './board.controller'
import { BoardService } from './board.service'
import { UsersModule } from 'src/users/users.module'
import { PrismaService } from 'src/prisma/prisma.service'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  controllers: [BoardController],
  providers: [BoardService, PrismaService],
  imports: [UsersModule, PrismaModule],
  exports: [BoardService],
})
export class BoardModule {}
