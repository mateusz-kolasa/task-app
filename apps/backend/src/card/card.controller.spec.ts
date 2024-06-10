import { Test, TestingModule } from '@nestjs/testing'
import { CardController } from './card.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { CardService } from './card.service'
import { ListModule } from 'src/list/list.module'

describe('CardController', () => {
  let controller: CardController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [CardService],
      imports: [ListModule, PrismaModule],
    }).compile()

    controller = module.get<CardController>(CardController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
