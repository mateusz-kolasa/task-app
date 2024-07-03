import { Test, TestingModule } from '@nestjs/testing'
import { BoardController } from './board.controller'
import { BoardService } from './board.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersModule } from 'src/users/users.module'
import { CoreModule } from 'src/core/core.module'
import { ConfigModule } from '@nestjs/config'
import { BoardGateway } from './board.gateway'

describe('BoardController', () => {
  let controller: BoardController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [BoardService, BoardGateway],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        PrismaModule,
        UsersModule,
        CoreModule,
      ],
    }).compile()

    controller = module.get<BoardController>(BoardController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
