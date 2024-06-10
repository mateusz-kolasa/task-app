import { Test, TestingModule } from '@nestjs/testing'
import { BoardController } from './board.controller'
import { BoardService } from './board.service'
import { PrismaModule } from 'src/prisma/prisma.module'

describe('BoardController', () => {
  let controller: BoardController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [BoardService],
      imports: [PrismaModule],
    }).compile()

    controller = module.get<BoardController>(BoardController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
