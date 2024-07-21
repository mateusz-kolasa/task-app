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
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { CacheModule } from '@nestjs/cache-manager'
import { RedisClientOptions } from 'redis'
import { redisStore } from 'cache-manager-redis-yet'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'frontend', 'dist'),
      exclude: ['api/*'],
    }),
    CoreModule,
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: process.env.REDIS_URL,
      isGlobal: true,
    }),
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
