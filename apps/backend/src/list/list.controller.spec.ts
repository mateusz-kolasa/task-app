import { Test, TestingModule } from '@nestjs/testing'
import { ListController } from './list.controller'
import { ListService } from './list.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { BoardModule } from 'src/board/board.module'
import { UsersModule } from 'src/users/users.module'

describe('ListController', () => {
  let controller: ListController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListController],
      providers: [ListService],
      imports: [PrismaModule, BoardModule, UsersModule],
    }).compile()

    controller = module.get<ListController>(ListController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
