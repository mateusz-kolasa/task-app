import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Delete,
  ParseIntPipe,
  Param,
} from '@nestjs/common'
import { ListService } from './list.service'
import ListCreateData from 'src/dtos/list-create-data.dto'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { DeleteListData, ListFullData } from 'shared-types'
import ChangeListPositionData from 'src/dtos/list-change-position.data.dto'
import { List } from '@prisma/client'
import ChangeListTitleData from 'src/dtos/list-change-title-data.dto'
import { BoardPermissionGuard } from 'src/guards/board-permission.guard'
import { BoardPermissions } from 'src/decorators/board-permission.decorator'
import { BOARD_PERMISSIONS } from 'shared-consts'
import { ListAuthRequest } from 'src/types/user-jwt-payload'

@ApiTags('list')
@Controller('list')
@UseGuards(JwtAuthGuard, BoardPermissionGuard)
export class ListController {
  constructor(private readonly listService: ListService) {}

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @Post()
  create(@Body() createListData: ListCreateData): Promise<ListFullData> {
    return this.listService.create(createListData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @Post('change-position')
  changePosition(
    @Req() request: ListAuthRequest,
    @Body() changePositionData: ChangeListPositionData
  ): Promise<List[]> {
    return this.listService.changePosition(request, changePositionData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @Patch('change-title')
  changeTitle(
    @Req() request: ListAuthRequest,
    @Body() changeTitleData: ChangeListTitleData
  ): Promise<List> {
    return this.listService.changeTitle(request, changeTitleData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @Delete(':listId')
  delete(
    @Req() request: ListAuthRequest,
    @Param('listId', ParseIntPipe) listId: number
  ): Promise<DeleteListData> {
    return this.listService.delete(request, listId)
  }
}
