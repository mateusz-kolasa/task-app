import { Test, TestingModule } from '@nestjs/testing'
import { BoardGateway } from './board.gateway'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersModule } from 'src/users/users.module'
import { CoreModule } from 'src/core/core.module'
import { ConfigModule } from '@nestjs/config'

describe('BoardGateway', () => {
  let gateway: BoardGateway

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardGateway],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        PrismaModule,
        UsersModule,
        CoreModule,
      ],
    }).compile()

    gateway = module.get<BoardGateway>(BoardGateway)
  })

  it('should be defined', () => {
    expect(gateway).toBeDefined()
  })
})
