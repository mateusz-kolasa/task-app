import { Module } from '@nestjs/common'
import { BoardController } from './board.controller'
import { BoardService } from './board.service'
import { UsersModule } from 'src/users/users.module'
import { PrismaService } from 'src/prisma.service'

@Module({
  controllers: [BoardController],
  providers: [BoardService, PrismaService],
  imports: [UsersModule],
})
export class BoardModule {}
