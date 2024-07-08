import { Test, TestingModule } from '@nestjs/testing'
import { CardController } from './card.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { CardService } from './card.service'
import { ListModule } from 'src/list/list.module'
import { ConfigModule } from '@nestjs/config'
import { BoardModule } from 'src/board/board.module'

describe('CardController', () => {
  let controller: CardController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [CardService],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ListModule,
        PrismaModule,
        BoardModule,
      ],
    }).compile()

    controller = module.get<CardController>(CardController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
