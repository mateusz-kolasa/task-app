import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common'
import { ListService } from './list.service'
import ListCreateData from 'src/dtos/list-create-data.dto'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ListFullData } from 'shared-types'
import { AuthRequest } from 'src/types/user-jwt-payload'
import ChangeListPositionData from 'src/dtos/list-change-position.data.dto'
import { List } from '@prisma/client'

@ApiTags('list')
@Controller('list')
@UseGuards(JwtAuthGuard)
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  create(
    @Req() request: AuthRequest,
    @Body() createListData: ListCreateData
  ): Promise<ListFullData> {
    return this.listService.create(request, createListData)
  }

  @Post('change-position')
  changePosition(
    @Req() request: AuthRequest,
    @Body() changePositionData: ChangeListPositionData
  ): Promise<List[]> {
    return this.listService.changePosition(request, changePositionData)
  }
}
