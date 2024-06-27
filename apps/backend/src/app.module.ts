import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { BoardModule } from './board/board.module'
import { ListModule } from './list/list.module'
import { CardModule } from './card/card.module'
import { PrismaModule } from './prisma/prisma.module'
import { CoreModule } from './core/core.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoreModule,
    UsersModule,
    AuthModule,
    BoardModule,
    ListModule,
    CardModule,
    PrismaModule,
  ],
  providers: [AppService],
})
export class AppModule {}
